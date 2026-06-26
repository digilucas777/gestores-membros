// app/aulas/page.tsx
import { getAulas, getModulos } from '@/lib/actions/aulas'
import ModuloSection from '@/components/ModuloSection'
import type { Aula, Modulo } from '@/types/db'

export default async function AulasPage() {
  const [modulos, aulas] = await Promise.all([getModulos(), getAulas()])

  // Group aulas by modulo_id
  const byModulo = new Map<string | null, Aula[]>()
  aulas.forEach((aula) => {
    const key = aula.modulo_id ?? null
    if (!byModulo.has(key)) byModulo.set(key, [])
    byModulo.get(key)!.push(aula)
  })

  // Sections: each modulo in order, then unassigned
  const sections: { modulo: Modulo | null; aulas: Aula[] }[] = [
    ...modulos.map((m) => ({ modulo: m, aulas: byModulo.get(m.id) ?? [] })),
    { modulo: null, aulas: byModulo.get(null) ?? [] },
  ]

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">
          Trafego <span className="text-muted font-normal">/ BORDERLESS</span>
        </h1>
        <form action="/auth/signout" method="post">
          <button className="text-muted text-sm hover:text-white transition-colors">
            Sair
          </button>
        </form>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">
        <div>
          <h2 className="text-2xl font-bold">Aulas</h2>
          <p className="text-muted text-sm mt-1">
            {aulas.length} aula{aulas.length !== 1 ? 's' : ''} disponíve
            {aulas.length !== 1 ? 'is' : 'l'}
          </p>
        </div>

        {aulas.length === 0 ? (
          <p className="text-muted text-sm">Nenhuma aula disponível ainda.</p>
        ) : (
          sections.map((section) => (
            <ModuloSection
              key={section.modulo?.id ?? 'unassigned'}
              modulo={section.modulo}
              aulas={section.aulas}
            />
          ))
        )}
      </main>
    </div>
  )
}
