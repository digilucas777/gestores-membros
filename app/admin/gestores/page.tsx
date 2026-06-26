// app/admin/gestores/page.tsx
import { getGestores } from '@/lib/actions/gestores'
import GestoresTable from '@/components/admin/GestoresTable'

export default async function AdminGestoresPage() {
  const gestores = await getGestores()
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase() ?? ''
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Gestores</h1>
        <p className="text-muted text-sm mt-1">
          Gerencie quem tem acesso à plataforma
        </p>
      </div>
      <GestoresTable gestores={gestores} adminEmail={adminEmail} />
    </div>
  )
}
