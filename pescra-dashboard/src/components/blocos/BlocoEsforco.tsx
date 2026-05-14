import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'
import { CAPTURAS_MOCK } from '@/data/mock'
import { calcularEsforco, filtrarCapturas } from '@/lib/agregacoes'
import { useFiltros } from '@/store/filtros'
import { Card, KpiCard } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] px-4 py-3 shadow-2xl">
      <p className="mb-2 text-xs font-semibold text-[#475569]">{label}</p>
      {payload.map((p: { color: string; name: string; value: number }) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
      <p className="mt-1 text-[10px] text-[#64748b]">Limite anuência: 8 barcos/dia</p>
    </div>
  )
}

export function BlocoEsforco() {
  const filtros = useFiltros()

  const dados = useMemo(() => {
    const capturadas = filtrarCapturas(CAPTURAS_MOCK, filtros)
    return calcularEsforco(capturadas, filtros.granularidade, filtros.temporadas)
  }, [filtros])

  const mediaBarcos = dados.length
    ? parseFloat((dados.reduce((s, d) => s + d.barcos, 0) / dados.length).toFixed(1))
    : 0
  const mediaPescadores = dados.length
    ? parseFloat((dados.reduce((s, d) => s + d.pescadores, 0) / dados.length).toFixed(1))
    : 0

  const diasOperacao = useMemo(() => {
    const capturadas = filtrarCapturas(CAPTURAS_MOCK, filtros)
    return new Set(capturadas.map((c) => c.data)).size
  }, [filtros])

  const horasEfetivas = useMemo(() => {
    const capturadas = filtrarCapturas(CAPTURAS_MOCK, filtros)
    return capturadas.reduce((s, c) => s + c.horas_efetivas, 0).toFixed(0)
  }, [filtros])

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle
        titulo="Esforço de Pesca"
        descricao="Embarcações e pescadores em operação — limite da anuência: 8 barcos/dia"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard titulo="Barcos / Dia" valor={mediaBarcos} unidade="média" descricao="limite: 8/dia" />
        <KpiCard titulo="Pescadores / Dia" valor={mediaPescadores} unidade="média" />
        <KpiCard titulo="Dias de Operação" valor={diasOperacao} unidade="dias" />
        <KpiCard titulo="Horas Efetivas" valor={parseInt(horasEfetivas).toLocaleString('pt-BR')} unidade="h totais" />
      </div>

      <Card>
        <div className="mb-4">
          <p className="text-xs text-[#64748b]">
            Evolução do esforço de pesca — linha pontilhada indica o limite máximo permitido
          </p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dados} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: '#475569', paddingTop: 8 }}
            />
            <ReferenceLine
              y={8}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
              label={{ value: 'limite anuência', fill: '#ef4444', fontSize: 10, position: 'right' }}
            />
            <Line
              type="monotone"
              dataKey="barcos"
              name="Barcos/dia"
              stroke="#1d4ed8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Line
              type="monotone"
              dataKey="pescadores"
              name="Pescadores/dia"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </section>
  )
}
