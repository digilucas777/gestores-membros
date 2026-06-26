// components/AulaCard.tsx
import Link from 'next/link'
import type { Aula } from '@/types/db'

export default function AulaCard({ aula }: { aula: Aula }) {
  return (
    <Link
      href={`/aulas/${aula.id}`}
      className="block bg-surface border border-border rounded-lg p-4 hover:border-accent transition-colors group"
    >
      <h3 className="font-medium text-sm group-hover:text-accent transition-colors">
        {aula.titulo}
      </h3>
      {aula.descricao && (
        <p className="text-muted text-xs mt-1 line-clamp-2">{aula.descricao}</p>
      )}
    </Link>
  )
}
