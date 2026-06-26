import { getAdminStats } from '@/lib/actions/gestores'
import { formatDate } from '@/lib/utils'

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <p className="text-muted text-xs uppercase tracking-widest mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}

export default async function AdminDashboard() {
  const stats = await getAdminStats()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Visão geral da plataforma</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gestores cadastrados" value={stats.totalGestores} />
        <StatCard label="Ativos (30 dias)" value={stats.activeGestores} />
        <StatCard label="Total de aulas" value={stats.totalAulas} />
        <StatCard label="Módulos" value={stats.totalModulos} />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Últimos acessos</h2>
        {stats.recentAcessos.length === 0 ? (
          <p className="text-muted text-sm">Nenhum acesso registrado ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted text-xs uppercase tracking-widest">
                  <th className="pb-3 pr-6">Gestor</th>
                  <th className="pb-3 pr-6">Email</th>
                  <th className="pb-3">Data</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentAcessos.map((acesso) => (
                  <tr
                    key={acesso.id}
                    className="border-b border-border/50 hover:bg-surface/50 transition-colors"
                  >
                    <td className="py-3 pr-6">
                      {acesso.gestores?.nome ?? '—'}
                    </td>
                    <td className="py-3 pr-6 text-muted">
                      {acesso.gestores?.email}
                    </td>
                    <td className="py-3 text-muted">
                      {formatDate(acesso.accessed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
