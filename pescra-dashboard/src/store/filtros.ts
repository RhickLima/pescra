import { create } from 'zustand'
import type { FiltroState } from '@/types'

interface FiltroStore extends FiltroState {
  setTemporadas: (v: number[]) => void
  setGranularidade: (v: FiltroState['granularidade']) => void
  setEspecies: (v: string[]) => void
  setLocais: (v: string[]) => void
  setDataInicio: (v: string | null) => void
  setDataFim: (v: string | null) => void
}

export const useFiltros = create<FiltroStore>((set) => ({
  temporadas: [2024],
  granularidade: 'mes',
  especies: [],
  locais: [],
  dataInicio: null,
  dataFim: null,
  setTemporadas: (v) => set({ temporadas: v }),
  setGranularidade: (v) => set({ granularidade: v }),
  setEspecies: (v) => set({ especies: v }),
  setLocais: (v) => set({ locais: v }),
  setDataInicio: (v) => set({ dataInicio: v }),
  setDataFim: (v) => set({ dataFim: v }),
}))
