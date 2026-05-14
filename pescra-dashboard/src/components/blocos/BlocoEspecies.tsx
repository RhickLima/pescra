import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { CAPTURAS_MOCK } from '@/data/mock'
import { calcularEspecies, filtrarCapturas } from '@/lib/agregacoes'
import { useFiltros } from '@/store/filtros'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-xl border border-[#cbd5e1] bg-[#ffffff] px-4 py-3 shadow-2xl">
      <p className="text-sm font-semibold" style={{ color: d.cor }}>{d.nome_popular}</p>
      <p className="text-xs italic text-[#64748b]">{d.nome_cientifico}</p>
      <div className="mt-2 flex flex-col gap-1">
        <p className="text-xs text-[#475569]">Capturas: <span className="font-bold text-[#0f172a]">{d.total.toLocaleString('pt-BR')}</span></p>
        <p className="text-xs text-[#475569]">% do total: <span className="font-bold text-[#0f172a]">{d.percentual}%</span></p>
        <p className="text-xs text-[#475569]">Comp. médio: <span className="font-bold text-[#0f172a]">{d.comprimento_medio} cm</span></p>
        {d.peso_medio && (
          <p className="text-xs text-[#475569]">Peso médio: <span className="font-bold text-[#0f172a]">{d.peso_medio} g</span></p>
        )}
      </div>
    </div>
  )
}

export function BlocoEspecies() {
  const filtros = useFiltros()

  const especies = useMemo(() => {
    const capturadas = filtrarCapturas(CAPTURAS_MOCK, filtros)
    return calcularEspecies(capturadas)
  }, [filtros])

  const total = especies.reduce((s, e) => s + e.total, 0)

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle
        titulo="Composição de Espécies"
        descricao={`${total.toLocaleString('pt-BR')} capturas no período — ${especies.length} espécies registradas`}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Donut */}
        <Card className="flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={especies}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="total"
              >
                {especies.map((e) => (
                  <Cell key={e.especie_id} fill={e.cor} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legenda centralizada no donut */}
          <div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-2">
            {especies.map((e) => (
              <div key={e.especie_id} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: e.cor }} />
                <span className="text-xs text-[#475569]">{e.nome_popular}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Tabela */}
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#e2e8f0]">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#64748b]">Espécie</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#64748b]">Capturas</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#64748b]">%</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[#64748b]">Comp. Médio</th>
                </tr>
              </thead>
              <tbody>
                {especies.map((e, i) => (
                  <tr
                    key={e.especie_id}
                    className={`border-b border-[#e2e8f0] transition-colors hover:bg-[#f8fafc] ${
                      i === especies.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: e.cor }} />
                        <div>
                          <p className="text-xs font-medium text-[#0f172a]">{e.nome_popular}</p>
                          <p className="text-[10px] italic text-[#64748b]">{e.nome_cientifico}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[#475569]">
                      {e.total.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#e2e8f0]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${e.percentual}%`, backgroundColor: e.cor }}
                          />
                        </div>
                        <span className="w-8 text-right text-xs text-[#475569]">{e.percentual}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-[#475569]">
                      {e.comprimento_medio} cm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  )
}
