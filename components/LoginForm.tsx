'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { sendMagicLink, signInWithAdminPassword } from '@/lib/actions/auth'

type Mode = 'magic' | 'password'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<Mode>('magic')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setPassword('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      if (mode === 'password') {
        const result = await signInWithAdminPassword(email, password)
        if (result.error) {
          setError(result.error)
        } else {
          router.push('/admin')
        }
      } else {
        const result = await sendMagicLink(email)
        if (result.error) {
          setError(result.error)
        } else {
          setSent(true)
        }
      }
    })
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="text-4xl mb-4">✉️</div>
        <h2 className="text-xl font-semibold mb-2">Verifique seu email</h2>
        <p className="text-muted text-sm">
          Enviamos um link de acesso para <strong>{email}</strong>.<br />
          Clique no link para entrar.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} aria-label="login" className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm text-muted">
          Seu email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          disabled={isPending}
          className="bg-surface border border-border rounded-lg px-4 py-3 text-sm text-white placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
        />
      </div>

      {mode === 'password' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm text-muted">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isPending}
            autoFocus
            className="bg-surface border border-border rounded-lg px-4 py-3 text-sm text-white placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
          />
        </div>
      )}

      {error && (
        <p role="alert" className="text-red-400 text-sm">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || !email || (mode === 'password' && !password)}
        className="bg-accent hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg text-sm transition-colors"
      >
        {isPending
          ? mode === 'password' ? 'Entrando...' : 'Enviando...'
          : mode === 'password' ? 'Entrar' : 'Entrar com magic link'}
      </button>

      <button
        type="button"
        onClick={() => switchMode(mode === 'magic' ? 'password' : 'magic')}
        disabled={isPending}
        className="text-muted text-xs hover:text-white transition-colors text-center disabled:opacity-50"
      >
        {mode === 'magic' ? 'Entrar com senha' : 'Entrar com magic link'}
      </button>
    </form>
  )
}
