import { Link, useLocation } from 'react-router-dom'
import { Filtros } from './Filtros'

export function Header() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-[#e2e8f0] bg-[#ffffff]/95 backdrop-blur-md">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6">
        <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo + Título + Nav */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#1e40af]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2">
                  <path d="M3 12s3-7 9-7 9 7 9 7-3 7-9 7-9-7-9-7z" />
                  <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" stroke="none" />
                  <path d="M20 5l-1 3m-14 8l-1 3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-[#0f172a]">PESCRA</h1>
                <p className="text-[10px] text-[#94a3b8]">Monitoramento de Estoques Pesqueiros</p>
              </div>
            </div>

            {/* Navegação */}
            <nav className="flex items-center gap-1 rounded-lg border border-[#e2e8f0] bg-[#ffffff] p-1">
              <Link
                to="/"
                className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  location.pathname === '/'
                    ? 'bg-[#e2e8f0] text-[#0f172a]'
                    : 'text-[#94a3b8] hover:text-[#475569]'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/mapa"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  location.pathname === '/mapa'
                    ? 'bg-[#1d4ed8] text-[#f1f5f9]'
                    : 'text-[#94a3b8] hover:text-[#475569]'
                }`}
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 2C5.79 2 4 3.79 4 6c0 3 4 8 4 8s4-5 4-8c0-2.21-1.79-4-4-4z" />
                  <circle cx="8" cy="6" r="1.5" fill="currentColor" stroke="none" />
                </svg>
                Mapa
              </Link>
            </nav>
          </div>

          {/* Filtros (só no dashboard) */}
          {location.pathname === '/' && <Filtros />}
        </div>
      </div>
    </header>
  )
}
