// components/AulaCard.tsx
import Link from 'next/link'
import type { Aula } from '@/types/db'

export default function AulaCard({ aula }: { aula: Aula }) {
  return (
    <Link
      href={`/aulas/${aula.id}`}
      className="block group rounded-xl overflow-hidden border border-border hover:border-accent transition-colors bg-surface"
    >
      {/* Thumbnail */}
      <div
        className="relative w-full bg-black"
        style={{ aspectRatio: '16/9' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-accent/20 group-hover:border-accent/40 transition-all duration-200">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-white"
              style={{ marginLeft: '2px' }}
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <h3 className="font-medium text-sm text-white group-hover:text-accent transition-colors line-clamp-2 leading-snug">
          {aula.titulo}
        </h3>
        {aula.descricao && (
          <p className="text-muted text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {aula.descricao}
          </p>
        )}
      </div>
    </Link>
  )
}
