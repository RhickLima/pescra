import { useMemo, useState } from 'react'
import { CAPTURAS_MOCK } from '@/data/mock'
import { ESPECIES } from '@/data/especies'
import { calcularRankingPirangueiros, filtrarCapturas } from '@/lib/agregacoes'
import { useFiltros } from '@/store/filtros'
import { Card } from '@/components/ui/Card'
import { SectionTitle } from '@/components/ui/SectionTitle'

type ModoRanking = 'capturas' | 'maior'

const MEDALHAS = ['🥇', '🥈', '🥉']

function TabButton({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
        ativo ? 'bg-[#1d4ed8] text-[#f1f5f9]' : 'text-[#94a3b8] hover:text-[#475569]'
      }`}
    >
      {children}
    </button>
  )
}

export function BlocoRanking() {
  const filtros = useFiltros()
  const [modo, setModo] = useState<ModoRanking>('capturas')
  const [especieFiltro, setEspecieFiltro] = useState<string>('todas')

  const ranking = useMemo(() => {
    const capturadas = filtrarCapturas(CAPTURAS_MOCK, filtros)
    return calcularRankingPirangueiros(capturadas)
  }, [filtros])

  const especiesPresentes = useMemo(() => {
    const ids = new Set(CAPTURAS_MOCK.flatMap((c) => filtrarCapturas([c], filtros).map((x) => x.especie_id)))
    return ESPECIES.filter((e) => ids.has(e.id))
  }, [filtros])

  const rankingOrdenado = useMemo(() => {
    if (modo === 'capturas') {
      if (especieFiltro === 'todas') return [...ranking].sort((a, b) => b.total - a.total)
      return [...ranking]
        .filter((r) => (r.por_especie[especieFiltro] ?? 0) > 0)
        .sort((a, b) => (b.por_especie[especieFiltro] ?? 0) - (a.por_especie[especieFiltro] ?? 0))
    } else {
      if (especieFiltro === 'todas') return [...ranking].sort((a, b) => b.maior_peixe_cm - a.maior_peixe_cm)
      return [...ranking]
        .filter((r) => r.maior_por_especie[especieFiltro])
        .sort((a, b) => (b.maior_por_especie[especieFiltro]?.comprimento_cm ?? 0) - (a.maior_por_especie[especieFiltro]?.comprimento_cm ?? 0))
    }
  }, [ranking, modo, especieFiltro])

  const valorMaximo = useMemo(() => {
    if (!rankingOrdenado.length) return 1
    if (modo === 'capturas') {
      return especieFiltro === 'todas'
        ? rankingOrdenado[0].total
        : rankingOrdenado[0].por_especie[especieFiltro] ?? 1
    } else {
      return especieFiltro === 'todas'
        ? rankingOrdenado[0].maior_peixe_cm
        : rankingOrdenado[0].maior_por_especie[especieFiltro]?.comprimento_cm ?? 1
    }
  }, [rankingOrdenado, modo, especieFiltro])

  function getValor(r: typeof rankingOrdenado[0]) {
    if (modo === 'capturas') {
      return especieFiltro === 'todas' ? r.total : (r.por_especie[especieFiltro] ?? 0)
    } else {
      const v = especieFiltro === 'todas' ? r.maior_peixe_cm : r.maior_por_especie[especieFiltro]?.comprimento_cm ?? 0
      return v
    }
  }

  function getUnidade() {
    return modo === 'capturas' ? 'capturas' : 'cm'
  }

  function getEspecieMaior(r: typeof rankingOrdenado[0]) {
    if (modo !== 'maior') return null
    if (especieFiltro !== 'todas') return null
    return ESPECIES.find((e) => e.id === r.maior_peixe_especie)
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionTitle
        titulo="Ranking Pirangueiros"
        descricao="Todos os períodos — performance dos pilotos de embarcação"
      />

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-[#e2e8f0] bg-[#f1f5f9] p-0.5">
          <TabButton ativo={modo === 'capturas'} onClick={() => setModo('capturas')}>
            Total de Capturas
          </TabButton>
          <TabButton ativo={modo === 'maior'} onClick={() => setModo('maior')}>
            Maior Peixe
          </TabButton>
        </div>

        {/* Filtro por espécie */}
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setEspecieFiltro('todas')}
            className={`rounded-full px-3 py-1 text-xs transition-all ${
              especieFiltro === 'todas'
                ? 'bg-[#e2e8f0] text-[#0f172a]'
                : 'text-[#94a3b8] hover:text-[#475569]'
            }`}
          >
            Todas espécies
          </button>
          {especiesPresentes.map((e) => (
            <button
              key={e.id}
              onClick={() => setEspecieFiltro(e.id)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-all ${
                especieFiltro === e.id
                  ? 'text-[#f1f5f9] font-medium'
                  : 'text-[#94a3b8] hover:text-[#475569]'
              }`}
              style={especieFiltro === e.id ? { backgroundColor: e.cor } : {}}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: e.cor }} />
              {e.nome_popular}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rankingOrdenado.slice(0, 8).map((r, idx) => {
          const valor = getValor(r)
          const percentual = (valor / valorMaximo) * 100
          const especieMaior = getEspecieMaior(r)
          const medalha = MEDALHAS[idx]

          return (
            <Card key={r.pirangueiro_id} className={`flex flex-col gap-3 ${idx < 3 ? 'border-[#cbd5e1]' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{medalha ?? `#${idx + 1}`}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0f172a]">{r.nome}</p>
                  <p className="text-xs text-[#64748b]">"{r.apelido}"</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-[#1d4ed8]">{valor.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-[#64748b]">{getUnidade()}</p>
                </div>
              </div>

              {/* Barra de progresso */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e2e8f0]">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${percentual}%`,
                    backgroundColor: idx === 0 ? '#f59e0b' : idx === 1 ? '#475569' : idx === 2 ? '#b45309' : '#cbd5e1',
                  }}
                />
              </div>

              {/* Detalhes */}
              {modo === 'capturas' && especieFiltro === 'todas' && (
                <div className="flex flex-wrap gap-1">
                  {ESPECIES.filter((e) => r.por_especie[e.id]).sort((a, b) => (r.por_especie[b.id] ?? 0) - (r.por_especie[a.id] ?? 0)).slice(0, 4).map((e) => (
                    <span
                      key={e.id}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]"
                      style={{ backgroundColor: `${e.cor}20`, color: e.cor }}
                    >
                      {e.nome_popular}: {r.por_especie[e.id]}
                    </span>
                  ))}
                </div>
              )}

              {modo === 'maior' && especieMaior && (
                <div className="flex items-center gap-2 rounded-lg bg-[#e2e8f0] px-3 py-2">
                  <span className="text-lg">{especieMaior.emoji}</span>
                  <div>
                    <p className="text-xs font-medium" style={{ color: especieMaior.cor }}>{especieMaior.nome_popular}</p>
                    <p className="text-[10px] text-[#64748b]">{r.maior_peixe_cm} cm</p>
                  </div>
                </div>
              )}

              {modo === 'maior' && especieFiltro !== 'todas' && r.maior_por_especie[especieFiltro] && (
                <p className="text-[10px] text-[#64748b]">
                  Capturado em {new Date(r.maior_por_especie[especieFiltro].data + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
              )}
            </Card>
          )
        })}
      </div>
    </section>
  )
}
