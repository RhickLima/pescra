import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { CAPTURAS_MOCK } from '@/data/mock'
import { calcularFroese, filtrarCapturas } from '@/lib/agregacoes'
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
          {p.name}: <span className="font-bold">{p.value}%</span>
        </p>
      ))}
    </div>
  )
}

function IndicadorCard({
  titulo,
  valor,
  meta,
  cor,
  dica,
}: {
  titulo: string
  valor: number
  meta: string
  cor: string
  dica: string
}) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">{titulo}</span>
        <span className="rounded-full border border-[#cbd5e1] px-2 py-0.5 text-[10px] text-[#64748b]">
          meta: {meta}
        </span>
      </div>
      <div className="text-3xl font-bold tracking-tight" style={{ color: cor }}>
        {valor}%
      </div>
      <p className="text-xs text-[#64748b]">{dica}</p>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(valor, 100)}%`, backgroundColor: cor }}
        />
      </div>
    </Card>
  )
}

export function BlocoFroese() {
  const filtros = useFiltros()

  const dados = useMemo(() => {
    const capturadas = filtrarCapturas(CAPTURAS_MOCK, filtros)
    return calcularFroese(capturadas, filtros.granularidade, filtros.temporadas)
  }, [filtros])

  const media = useMemo(() => {
    if (!dados.length) return { adultos: 0, otimos: 0, mega: 0 }
    const n = dados.length
    return {
      adultos: parseFloat((dados.reduce((s, d) => s + d.adultos, 0) / n).toFixed(1)),
      otimos: parseFloat((dados.reduce((s, d) => s + d.otimos, 0) / n).toFixed(1)),
      mega: parseFloat((dados.reduce((s, d) => s + d.megarreprodutores, 0) / n).toFixed(1)),
    }
  }, [dados])

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle
        titulo="Indicadores de Conservação"
        descricao="Protocolo Froese (2004) — estrutura de comprimento das capturas"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <IndicadorCard
          titulo="% Adultos"
          valor={media.adultos}
          meta="100%"
          cor="#0d9488"
          dica="Proporção de peixes acima do comprimento de 1ª maturação (Lm)"
        />
        <IndicadorCard
          titulo="% Comprimento Ótimo"
          valor={media.otimos}
          meta="100%"
          cor="#1d4ed8"
          dica="Peixes dentro de ±10% do comprimento ótimo (Lopt)"
        />
        <IndicadorCard
          titulo="% Megarreprodutores"
          valor={media.mega}
          meta="30–40%"
          cor="#8b5cf6"
          dica="Peixes com comprimento > Lopt +10% — 30–40% indica estoque saudável"
        />
      </div>

      <Card>
        <div className="mb-4">
          <p className="text-xs text-[#64748b]">Distribuição das classes de comprimento ao longo do período</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dados} margin={{ top: 5, right: 10, left: -10, bottom: 0 }} barSize={filtros.granularidade === 'dia' ? 4 : 16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="square"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, color: '#475569', paddingTop: 8 }}
            />
            <Bar dataKey="jovens" name="Jovens" stackId="a" fill="#cbd5e1" radius={[0, 0, 0, 0]} />
            <Bar dataKey="adultos" name="Adultos" stackId="a" fill="#0d9488" radius={[0, 0, 0, 0]} />
            <Bar dataKey="otimos" name="Comprimento ótimo" stackId="a" fill="#1d4ed8" radius={[0, 0, 0, 0]} />
            <Bar dataKey="megarreprodutores" name="Megarreprodutores" stackId="a" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <KpiCard
        titulo="Referência metodológica"
        valor="Froese, 2004"
        descricao="Indicadores simples para avaliação de estoques pesqueiros. Megarreprodutores entre 30–40% = estoque saudável; abaixo de 20% = atenção."
      />
    </section>
  )
}
