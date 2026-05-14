import { getISOWeek, getISOWeekYear } from 'date-fns'
import type { Captura, CPUEPonto, EsforcoPonto, EspecieResumo, FiltroState, FroesePonto, RankingPirangueiro } from '@/types'
import { ESPECIES, PIRANGUEIROS } from '@/data/especies'

const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function parseData(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function chaveISO(data: string, gran: FiltroState['granularidade']): string {
  if (gran === 'temporada') return data.slice(0, 4)
  if (gran === 'mes') return data.slice(0, 7)
  if (gran === 'dia' || gran === 'entre-datas') return data
  // semana: chave "YYYY-Www"
  const d = parseData(data)
  const semana = String(getISOWeek(d)).padStart(2, '0')
  const ano = getISOWeekYear(d)
  return `${ano}-W${semana}`
}

function labelDe(key: string, gran: FiltroState['granularidade'], temporadas: number[]): string {
  if (gran === 'temporada') return key
  if (gran === 'mes') {
    const [ano, mes] = key.split('-')
    return temporadas.length > 1 ? `${MESES_PT[parseInt(mes) - 1]}/${ano.slice(2)}` : MESES_PT[parseInt(mes) - 1]
  }
  if (gran === 'semana') {
    const [ano, w] = key.split('-W')
    return temporadas.length > 1 ? `Sem ${parseInt(w)}/${ano.slice(2)}` : `Sem ${parseInt(w)}`
  }
  // dia ou entre-datas
  const [ano, mes, dia] = key.split('-')
  return `${dia}/${mes}${temporadas.length > 1 ? `/${ano.slice(2)}` : ''}`
}

export function filtrarCapturas(capturas: Captura[], filtros: FiltroState): Captura[] {
  return capturas.filter((c) => {
    if (filtros.granularidade !== 'entre-datas') {
      if (filtros.temporadas.length && !filtros.temporadas.includes(c.temporada)) return false
    } else {
      if (filtros.dataInicio && c.data < filtros.dataInicio) return false
      if (filtros.dataFim && c.data > filtros.dataFim) return false
    }
    if (filtros.especies.length && !filtros.especies.includes(c.especie_id)) return false
    if (filtros.locais.length && !filtros.locais.includes(c.local_id)) return false
    return true
  })
}

function agruparPorPeriodo(capturas: Captura[], gran: FiltroState['granularidade'], temporadas: number[]) {
  const grupos = new Map<string, { capturas: Captura[]; dias: Set<string>; barcos: Set<string> }>()

  for (const c of capturas) {
    const key = chaveISO(c.data, gran)
    if (!grupos.has(key)) grupos.set(key, { capturas: [], dias: new Set(), barcos: new Set() })
    const g = grupos.get(key)!
    g.capturas.push(c)
    g.dias.add(c.data)
    g.barcos.add(`${c.data}-${c.barco_id}`)
  }

  return Array.from(grupos.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({ key, label: labelDe(key, gran, temporadas), ...v }))
}

export function calcularCPUE(capturas: Captura[], gran: FiltroState['granularidade'], temporadas: number[]): CPUEPonto[] {
  const grupos = agruparPorPeriodo(capturas, gran, temporadas)
  return grupos.map(({ label, capturas: cs, barcos }) => {
    const nBarcos = barcos.size || 1
    const totalPeso = cs.reduce((s, c) => s + (c.peso_g != null ? c.peso_g : c.comprimento_cm * 8.5), 0)
    return {
      label,
      cpuen: parseFloat((cs.length / nBarcos).toFixed(2)),
      cpueb: parseFloat(((totalPeso || 0) / 1000 / nBarcos).toFixed(2)),
      barcos: nBarcos,
      pescadores: cs.reduce((s, c) => s + c.pescadores, 0) / (cs.length || 1),
    }
  })
}

export function calcularFroese(capturas: Captura[], gran: FiltroState['granularidade'], temporadas: number[]): FroesePonto[] {
  const grupos = agruparPorPeriodo(capturas, gran, temporadas)
  return grupos.map(({ label, capturas: cs }) => {
    let adultos = 0, otimos = 0, mega = 0, jovens = 0
    for (const c of cs) {
      const esp = ESPECIES.find((e) => e.id === c.especie_id)
      if (!esp) continue
      const l = c.comprimento_cm
      if (l >= esp.lm_cm) adultos++
      else jovens++
      if (l >= esp.lopt_cm * 0.9 && l <= esp.lopt_cm * 1.1) otimos++
      if (l > esp.lopt_cm * 1.1) mega++
    }
    const total = cs.length || 1
    return {
      label,
      adultos: parseFloat(((adultos / total) * 100).toFixed(1)),
      otimos: parseFloat(((otimos / total) * 100).toFixed(1)),
      megarreprodutores: parseFloat(((mega / total) * 100).toFixed(1)),
      jovens: parseFloat(((jovens / total) * 100).toFixed(1)),
    }
  })
}

export function calcularEsforco(capturas: Captura[], gran: FiltroState['granularidade'], temporadas: number[]): EsforcoPonto[] {
  const grupos = agruparPorPeriodo(capturas, gran, temporadas)
  return grupos.map(({ label, barcos, dias }) => ({
    label,
    barcos: parseFloat((barcos.size / (dias.size || 1)).toFixed(1)),
    pescadores: parseFloat((barcos.size * 2 / (dias.size || 1)).toFixed(1)),
  }))
}

export function calcularEspecies(capturas: Captura[]): EspecieResumo[] {
  const contagem = new Map<string, { total: number; comprimentos: number[]; pesos: number[] }>()
  for (const c of capturas) {
    if (!contagem.has(c.especie_id)) contagem.set(c.especie_id, { total: 0, comprimentos: [], pesos: [] })
    const v = contagem.get(c.especie_id)!
    v.total++
    v.comprimentos.push(c.comprimento_cm)
    if (c.peso_g) v.pesos.push(c.peso_g)
  }

  const totalGeral = capturas.length || 1
  return ESPECIES
    .filter((e) => contagem.has(e.id))
    .map((e) => {
      const v = contagem.get(e.id)!
      const soma_c = v.comprimentos.reduce((s, x) => s + x, 0)
      const soma_p = v.pesos.reduce((s, x) => s + x, 0)
      return {
        especie_id: e.id,
        nome_popular: e.nome_popular,
        nome_cientifico: e.nome_cientifico,
        total: v.total,
        comprimento_medio: parseFloat((soma_c / v.comprimentos.length).toFixed(1)),
        peso_medio: v.pesos.length ? parseFloat((soma_p / v.pesos.length).toFixed(0)) : null,
        percentual: parseFloat(((v.total / totalGeral) * 100).toFixed(1)),
        cor: e.cor,
      }
    })
    .sort((a, b) => b.total - a.total)
}

export function calcularVariacao(atual: number, anterior: number): number {
  if (!anterior) return 0
  return parseFloat((((atual - anterior) / anterior) * 100).toFixed(1))
}

export function calcularRankingPirangueiros(capturas: Captura[]): RankingPirangueiro[] {
  const mapa = new Map<string, {
    total: number
    maior_peixe_cm: number
    maior_peixe_especie: string
    por_especie: Record<string, number>
    maior_por_especie: Record<string, { comprimento_cm: number; data: string }>
  }>()

  for (const c of capturas) {
    if (!mapa.has(c.pirangueiro_id)) {
      mapa.set(c.pirangueiro_id, {
        total: 0 as number,
        maior_peixe_cm: 0,
        maior_peixe_especie: '',
        por_especie: {},
        maior_por_especie: {},
      })
    }
    const v = mapa.get(c.pirangueiro_id)!
    v.total++
    v.por_especie[c.especie_id] = (v.por_especie[c.especie_id] ?? 0) + 1

    if (c.comprimento_cm > v.maior_peixe_cm) {
      v.maior_peixe_cm = c.comprimento_cm
      v.maior_peixe_especie = c.especie_id
    }

    const atualMaior = v.maior_por_especie[c.especie_id]
    if (!atualMaior || c.comprimento_cm > atualMaior.comprimento_cm) {
      v.maior_por_especie[c.especie_id] = { comprimento_cm: c.comprimento_cm, data: c.data }
    }
  }

  return Array.from(mapa.entries())
    .map(([id, v]) => {
      const p = PIRANGUEIROS.find((p) => p.id === id)
      return { pirangueiro_id: id, nome: p?.nome ?? id, apelido: p?.apelido ?? id, ...v }
    })
    .sort((a, b) => b.total - a.total)
}
