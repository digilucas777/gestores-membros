// app/admin/modulos/page.tsx
import { getModulosAdmin } from '@/lib/actions/modulos'
import ModulosManager from '@/components/admin/ModulosManager'

export default async function AdminModulosPage() {
  const modulos = await getModulosAdmin()
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Módulos</h1>
        <p className="text-muted text-sm mt-1">
          Arraste para reordenar. Clique no nome para renomear.
        </p>
      </div>
      <ModulosManager modulos={modulos} />
    </div>
  )
}
