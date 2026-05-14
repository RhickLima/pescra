import { type ReactNode } from 'react'

interface SectionTitleProps {
  titulo: string
  descricao?: string
  children?: ReactNode
}

export function SectionTitle({ titulo, descricao, children }: SectionTitleProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex gap-3">
        {/* Barra accent vertical */}
        <div className="mt-1 w-1 flex-shrink-0 rounded-full bg-[#1d4ed8]" />
        <div>
          <h2 className="text-base font-bold tracking-tight text-[#0f172a]">{titulo}</h2>
          {descricao && <p className="mt-1 text-sm text-[#475569]">{descricao}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}
