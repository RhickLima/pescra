import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Header } from '@/components/Header'
import { BlocoCPUE } from '@/components/blocos/BlocoCPUE'
import { BlocoFroese } from '@/components/blocos/BlocoFroese'
import { BlocoEsforco } from '@/components/blocos/BlocoEsforco'
import { BlocoEspecies } from '@/components/blocos/BlocoEspecies'
import { BlocoRanking } from '@/components/blocos/BlocoRanking'
import { MapaPage } from '@/pages/MapaPage'
import './index.css'

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#0f172a]">
      <Header />
      <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-[#ffffff] px-4 py-2.5 text-xs text-[#94a3b8]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#f59e0b]" />
          Dados simulados (mock) — Temporadas 2019–2024 · TI Pequizal do Naruv'ytu, MT
          <span className="ml-auto font-medium text-[#cbd5e1]">
            Protocolo IBAMA — Anexo I · IT nº 22/2025
          </span>
        </div>

        <div className="flex flex-col gap-10">
          <BlocoCPUE />
          <div className="border-t border-[#e2e8f0]" />
          <BlocoFroese />
          <div className="border-t border-[#e2e8f0]" />
          <BlocoEsforco />
          <div className="border-t border-[#e2e8f0]" />
          <BlocoEspecies />
          <div className="border-t border-[#e2e8f0]" />
          <BlocoRanking />
        </div>

        <footer className="mt-12 border-t border-[#e2e8f0] pt-6 text-center text-xs text-[#cbd5e1]">
          PESCRA · Plataforma de Estudos de Sustentabilidade e Conservação de Recursos Aquáticos
          <span className="mx-2">·</span>
          IBAMA / NUBIO-MG
        </footer>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mapa" element={<MapaPage />} />
      </Routes>
    </BrowserRouter>
  )
}
