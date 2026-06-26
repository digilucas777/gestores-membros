import AdminNav from '@/components/admin/AdminNav'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#080808]">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-bold text-sm">
            Admin <span className="text-muted font-normal">/ BORDERLESS</span>
          </span>
          <AdminNav />
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/aulas"
            className="text-muted text-xs hover:text-white transition-colors"
          >
            Ver área de aulas →
          </Link>
          <form action="/auth/signout" method="post">
            <button className="text-muted text-xs hover:text-white transition-colors">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
