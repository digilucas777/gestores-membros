// app/admin/aulas/page.tsx
import { getAulas, getModulos } from '@/lib/actions/aulas'
import AulasManager from '@/components/admin/AulasManager'

export default async function AdminAulasPage() {
  const [aulas, modulos] = await Promise.all([getAulas(), getModulos()])
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Aulas</h1>
        <p className="text-muted text-sm mt-1">
          Crie, edite e organize as aulas. Arraste para reordenar.
        </p>
      </div>
      <AulasManager aulas={aulas} modulos={modulos} />
    </div>
  )
}
