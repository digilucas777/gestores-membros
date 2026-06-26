import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-tight">
            Trafego{' '}
            <span className="text-muted font-normal">/ BORDERLESS</span>
          </h1>
          <p className="text-muted text-sm mt-2">Área exclusiva para gestores</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8">
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
