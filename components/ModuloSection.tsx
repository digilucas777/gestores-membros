// components/ModuloSection.tsx
import AulaCard from './AulaCard'
import type { Aula, Modulo } from '@/types/db'

type Props = {
  modulo: Modulo | null
  aulas: Aula[]
}

export default function ModuloSection({ modulo, aulas }: Props) {
  if (aulas.length === 0) return null
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
        {modulo?.titulo ?? 'Sem módulo'}
      </h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {aulas.map((aula) => (
          <AulaCard key={aula.id} aula={aula} />
        ))}
      </div>
    </section>
  )
}
