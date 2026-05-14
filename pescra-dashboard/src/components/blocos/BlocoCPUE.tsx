import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { CAPTURAS_MOCK } from '@/data/mock'
import { calcularCPUE, calcularVariacao, filtrarCapturas } from '@/lib/agregacoes'
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
    </div>
  )
}

export function BlocoCPUE() {
  const filtros = useFiltros()

  const dados = useMemo(() => {
    const capturadas = filtrarCapturas(CAPTURAS_MOCK, filtros)
    return calcularCPUE(capturadas, filtros.granularidade, filtros.temporadas)
  }, [filtros])

  const ultimoCPUEn = dados[dados.length - 1]?.cpuen ?? 0
  const penultimoCPUEn = dados[dados.length - 2]?.cpuen ?? 0
  const ultimoCPUEb = dados[dados.length - 1]?.cpueb ?? 0
  const penultimoCPUEb = dados[dados.length - 2]?.cpueb ?? 0

  const varCPUEn = calcularVariacao(ultimoCPUEn, penultimoCPUEn)
  const varCPUEb = calcularVariacao(ultimoCPUEb, penultimoCPUEb)
  const mediaCPUEn = dados.length ? parseFloat((dados.reduce((s, d) => s + d.cpuen, 0) / dados.length).toFixed(1)) : 0
  const mediaCPUEb = dados.length ? parseFloat((dados.reduce((s, d) => s + d.cpueb, 0) / dados.length).toFixed(1)) : 0

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle
        titulo="CPUE — Captura por Unidade de Esforço"
        descricao="Eficiência de captura por barco por dia"
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          titulo="CPUEn"
          valor={mediaCPUEn}
          unidade="peixes/barco/dia"
          variacao={varCPUEn}
          descricao="vs. período anterior"
        />
        <KpiCard
          titulo="CPUEb"
          valor={mediaCPUEb}
          unidade="kg/barco/dia"
          variacao={varCPUEb}
          descricao="vs. período anterior"
        />
        <KpiCard
          titulo="Total Capturas"
          valor={filtrarCapturas(CAPTURAS_MOCK, filtros).length.toLocaleString('pt-BR')}
          descricao="no período filtrado"
        />
        <KpiCard
          titulo="Períodos"
          valor={dados.length}
          descricao="intervalos com dados"
        />
      </div>

      <Card>
        <div className="mb-4">
          <p className="text-xs text-[#64748b]">Evolução temporal da eficiência de captura</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={dados} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCPUEn" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCPUEb" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="cpuen"
              name="CPUEn (peixes)"
              stroke="#1d4ed8"
              strokeWidth={2}
              fill="url(#gradCPUEn)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="cpueb"
              name="CPUEb (kg)"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#gradCPUEb)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </section>
  )
}
