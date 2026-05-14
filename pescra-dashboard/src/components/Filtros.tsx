import { useFiltros } from '@/store/filtros'
import { ESPECIES, LOCAIS } from '@/data/especies'
import { CAPTURAS_MOCK } from '@/data/mock'
import type { FiltroState } from '@/types'

const TEMPORADAS_DISPONIVEIS = [2019, 2021, 2022, 2023, 2024]

type Granularidade = FiltroState['granularidade']

const OPCOES_GRAN: { label: string; value: Granularidade }[] = [
  { label: 'Temporada', value: 'temporada' },
  { label: 'Mês', value: 'mes' },
  { label: 'Semana', value: 'semana' },
  { label: 'Dia', value: 'dia' },
  { label: 'Entre datas', value: 'entre-datas' },
]

// Limites de datas disponíveis no mock
const DATAS_MOCK = Array.from(new Set(CAPTURAS_MOCK.map((c) => c.data))).sort()
const DATA_MIN = DATAS_MOCK[0] ?? '2019-01-01'
const DATA_MAX = DATAS_MOCK[DATAS_MOCK.length - 1] ?? '2024-12-31'

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: { id: string; nome: string }[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  }
  return (
    <div className="relative group">
      <button className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#ffffff] px-3 py-1.5 text-xs text-[#475569] hover:border-[#cbd5e1] transition-colors">
        {label}
        {selected.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#1d4ed8] text-[9px] font-bold text-[#f1f5f9]">
            {selected.length}
          </span>
        )}
        <span className="text-[#94a3b8]">▾</span>
      </button>
      <div className="absolute left-0 top-full z-50 mt-1 hidden min-w-[190px] rounded-xl border border-[#e2e8f0] bg-[#ffffff] p-1 shadow-2xl group-hover:block">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => toggle(o.id)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors ${
              selected.includes(o.id) ? 'bg-[#dbeafe] text-[#1d4ed8]' : 'text-[#475569] hover:bg-[#e2e8f0]'
            }`}
          >
            <span className={`h-3 w-3 rounded-sm border transition-colors ${selected.includes(o.id) ? 'border-[#1d4ed8] bg-[#1d4ed8]' : 'border-[#cbd5e1]'}`} />
            {o.nome}
          </button>
        ))}
        {selected.length > 0 && (
          <button onClick={() => onChange([])} className="mt-1 w-full rounded-lg px-3 py-1.5 text-center text-[10px] text-[#94a3b8] hover:text-[#475569]">
            Limpar filtro
          </button>
        )}
      </div>
    </div>
  )
}

export function Filtros() {
  const {
    temporadas, granularidade, especies, locais,
    dataInicio, dataFim,
    setTemporadas, setGranularidade, setEspecies, setLocais,
    setDataInicio, setDataFim,
  } = useFiltros()

  const modoEntreData = granularidade === 'entre-datas'

  function toggleTemporada(ano: number) {
    setTemporadas(temporadas.includes(ano) ? temporadas.filter((t) => t !== ano) : [...temporadas, ano])
  }

  function handleGranularidade(v: Granularidade) {
    setGranularidade(v)
    // Pré-preenche datas ao entrar em "entre-datas"
    if (v === 'entre-datas' && !dataInicio) {
      setDataInicio('2024-03-01')
      setDataFim('2024-04-30')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Temporadas — oculto no modo entre-datas */}
      {!modoEntreData && (
        <div className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-1">
          {TEMPORADAS_DISPONIVEIS.map((ano) => (
            <button
              key={ano}
              onClick={() => toggleTemporada(ano)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                temporadas.includes(ano) ? 'bg-[#1d4ed8] text-[#f1f5f9]' : 'text-[#94a3b8] hover:text-[#475569]'
              }`}
            >
              {ano}
            </button>
          ))}
        </div>
      )}

      {/* Granularidade */}
      <div className="flex rounded-lg border border-[#e2e8f0] bg-[#f1f5f9] p-0.5">
        {OPCOES_GRAN.map((o) => (
          <button
            key={o.value}
            onClick={() => handleGranularidade(o.value)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
              granularidade === o.value ? 'bg-[#1d4ed8] text-[#f1f5f9]' : 'text-[#94a3b8] hover:text-[#475569]'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Seletor de intervalo de datas */}
      {modoEntreData && (
        <div className="flex items-center gap-2 rounded-lg border border-[#1d4ed8]/40 bg-[#ffffff] px-3 py-1.5">
          <span className="text-xs text-[#94a3b8]">De</span>
          <input
            type="date"
            value={dataInicio ?? ''}
            min={DATA_MIN}
            max={dataFim ?? DATA_MAX}
            onChange={(e) => setDataInicio(e.target.value || null)}
            className="rounded-md bg-[#e2e8f0] px-2 py-0.5 text-xs text-[#0f172a] outline-none focus:ring-1 focus:ring-[#1d4ed8] [color-scheme:dark]"
          />
          <span className="text-xs text-[#94a3b8]">até</span>
          <input
            type="date"
            value={dataFim ?? ''}
            min={dataInicio ?? DATA_MIN}
            max={DATA_MAX}
            onChange={(e) => setDataFim(e.target.value || null)}
            className="rounded-md bg-[#e2e8f0] px-2 py-0.5 text-xs text-[#0f172a] outline-none focus:ring-1 focus:ring-[#1d4ed8] [color-scheme:dark]"
          />
          {/* Badge com total de dias */}
          {dataInicio && dataFim && (
            <span className="rounded-full bg-[#dbeafe] px-2 py-0.5 text-[10px] font-medium text-[#1d4ed8]">
              {Math.round((new Date(dataFim).getTime() - new Date(dataInicio).getTime()) / 86400000) + 1} dias
            </span>
          )}
        </div>
      )}

      {/* Espécies */}
      <MultiSelect
        label="Espécies"
        options={ESPECIES.map((e) => ({ id: e.id, nome: e.nome_popular }))}
        selected={especies}
        onChange={setEspecies}
      />

      {/* Locais */}
      <MultiSelect
        label="Locais"
        options={LOCAIS.map((l) => ({ id: l.id, nome: l.nome }))}
        selected={locais}
        onChange={setLocais}
      />
    </div>
  )
}
