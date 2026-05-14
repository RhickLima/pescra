export interface Especie {
  id: string
  nome_popular: string
  nome_cientifico: string
  lmax_cm: number
  lm_cm: number
  lopt_cm: number
  linfinito_cm: number
  cor: string
  emoji: string
}

export interface LocalPesca {
  id: string
  nome: string
  tipo: 'lago' | 'ressaca' | 'canal' | 'pedrais' | 'igarape'
  lat: number
  lon: number
  raio_km: number
}

export interface Captura {
  id: string
  data: string
  datetime: string        // ISO 8601 com hora: "2024-03-15T08:30:00"
  temporada: number
  especie_id: string
  comprimento_cm: number
  peso_g: number | null
  barco_id: string
  pirangueiro_id: string
  pescadores: number
  horas_efetivas: number
  local_id: string
  lat: number
  lon: number
}

export interface Pirangueiro {
  id: string
  nome: string
  apelido: string
}

export interface FiltroState {
  temporadas: number[]
  granularidade: 'temporada' | 'mes' | 'semana' | 'dia' | 'entre-datas'
  especies: string[]
  locais: string[]
  dataInicio: string | null   // ISO "YYYY-MM-DD", ativo quando granularidade === 'entre-datas'
  dataFim: string | null
}

export interface CPUEPonto {
  label: string
  cpuen: number
  cpueb: number
  barcos: number
  pescadores: number
}

export interface FroesePonto {
  label: string
  adultos: number
  otimos: number
  megarreprodutores: number
  jovens: number
}

export interface EsforcoPonto {
  label: string
  barcos: number
  pescadores: number
}

export interface EspecieResumo {
  especie_id: string
  nome_popular: string
  nome_cientifico: string
  total: number
  comprimento_medio: number
  peso_medio: number | null
  percentual: number
  cor: string
}

export interface RankingPirangueiro {
  pirangueiro_id: string
  nome: string
  apelido: string
  total: number
  maior_peixe_cm: number
  maior_peixe_especie: string
  por_especie: Record<string, number>
  maior_por_especie: Record<string, { comprimento_cm: number; data: string }>
}
