import type { Captura } from '@/types'
import { ESPECIES, LOCAIS, PIRANGUEIROS } from './especies'

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function gaussRng(rand: () => number, mean: number, std: number) {
  const u1 = rand()
  const u2 = rand()
  const z = Math.sqrt(-2 * Math.log(u1 + 0.001)) * Math.cos(2 * Math.PI * u2)
  return Math.max(5, mean + z * std)
}

// Gera coordenada aleatória dentro do raio (km) de um ponto central
function coordDentroRaio(rand: () => number, lat: number, lon: number, raio_km: number) {
  const KM_PER_DEG = 111.0
  const angle = rand() * 2 * Math.PI
  const dist = rand() * raio_km
  return {
    lat: parseFloat((lat + (dist / KM_PER_DEG) * Math.sin(angle)).toFixed(5)),
    lon: parseFloat((lon + (dist / (KM_PER_DEG * Math.cos((lat * Math.PI) / 180))) * Math.cos(angle)).toFixed(5)),
  }
}

const TEMPORADAS = [
  { ano: 2019, meses: [3, 4, 5, 6, 7, 8], barcosBase: 6, pescBase: 12 },
  { ano: 2021, meses: [3, 4, 5, 6, 7, 8], barcosBase: 6, pescBase: 12 },
  { ano: 2022, meses: [3, 4, 5, 6, 7, 8], barcosBase: 6, pescBase: 11 },
  { ano: 2023, meses: [3, 4, 5, 6, 7, 8], barcosBase: 8, pescBase: 14 },
  { ano: 2024, meses: [3, 4], barcosBase: 5, pescBase: 10 },
]

const DIST_ESPECIES = [0.40, 0.20, 0.18, 0.12, 0.06, 0.04]

export function gerarMock(): Captura[] {
  const todas: Captura[] = []
  let seed = 42

  for (const temporada of TEMPORADAS) {
    const rand = rng(seed++)
    for (const mes of temporada.meses) {
      const diasNoMes = new Date(temporada.ano, mes, 0).getDate()
      for (let dia = 1; dia <= diasNoMes; dia++) {
        if (rand() < 0.15) continue
        const nBarcos = Math.round(gaussRng(rand, temporada.barcosBase, 1.2))
        const barcosHoje = Math.max(1, Math.min(nBarcos, 8))
        for (let b = 0; b < barcosHoje; b++) {
          const dataStr = `${temporada.ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
          const pescadores = Math.max(1, Math.round(temporada.pescBase / temporada.barcosBase))
          const barcoId = `barco-${b + 1}`
          const pirangueiro = PIRANGUEIROS[Math.floor(rand() * PIRANGUEIROS.length)]
          const local = LOCAIS[Math.floor(rand() * LOCAIS.length)]
          const nPeixes = Math.round(gaussRng(rand, 10, 3))
          const horaBase = 6 + Math.floor(rand() * 2) // sai entre 06h e 07h

          for (let i = 0; i < nPeixes; i++) {
            const r = rand()
            let especieIdx = 0; let acc = 0
            for (let j = 0; j < DIST_ESPECIES.length; j++) {
              acc += DIST_ESPECIES[j]
              if (r < acc) { especieIdx = j; break }
            }
            const especie = ESPECIES[especieIdx]
            const comprimento = Math.round(gaussRng(rand, especie.lopt_cm * 0.9, especie.lopt_cm * 0.18))
            const peso = Math.round(gaussRng(rand, comprimento * 8.5, comprimento * 2))
            const horaCaptura = horaBase + Math.floor((i / nPeixes) * 9) // distribui ao longo do dia
            const minuto = Math.floor(rand() * 60)
            const horaStr = `${String(horaCaptura).padStart(2, '0')}:${String(minuto).padStart(2, '0')}:00`
            const coords = coordDentroRaio(rand, local.lat, local.lon, local.raio_km)

            todas.push({
              id: `${dataStr}-${barcoId}-${i}-${seed}`,
              data: dataStr,
              datetime: `${dataStr}T${horaStr}`,
              temporada: temporada.ano,
              especie_id: especie.id,
              comprimento_cm: Math.max(10, Math.min(comprimento, especie.lmax_cm)),
              peso_g: peso > 0 ? peso : null,
              barco_id: barcoId,
              pirangueiro_id: pirangueiro.id,
              pescadores,
              horas_efetivas: parseFloat((gaussRng(rand, 8, 1.2)).toFixed(1)),
              local_id: local.id,
              lat: coords.lat,
              lon: coords.lon,
            })
          }
          seed++
        }
      }
    }
  }

  return todas
}

export const CAPTURAS_MOCK = gerarMock()
