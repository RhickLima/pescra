import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[#e2e8f0] bg-[#ffffff] p-5 ${className}`}
    >
      {children}
    </div>
  )
}

interface KpiCardProps {
  titulo: string
  valor: string | number
  unidade?: string
  variacao?: number
  descricao?: string
  icone?: ReactNode
}

export function KpiCard({ titulo, valor, unidade, variacao, descricao, icone }: KpiCardProps) {
  const positivo = variacao !== undefined && variacao > 0
  const negativo = variacao !== undefined && variacao < 0

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
          {titulo}
        </span>
        {icone && <span className="text-[#cbd5e1]">{icone}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight text-[#0f172a]">{valor}</span>
        {unidade && <span className="mb-1 text-sm text-[#64748b]">{unidade}</span>}
      </div>
      <div className="flex items-center gap-2">
        {variacao !== undefined && (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              positivo
                ? 'bg-emerald-100 text-emerald-700'
                : negativo
                ? 'bg-red-100 text-red-700'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            {positivo ? '▲' : negativo ? '▼' : '—'} {Math.abs(variacao)}%
          </span>
        )}
        {descricao && <span className="text-xs text-[#64748b]">{descricao}</span>}
      </div>
    </Card>
  )
}
