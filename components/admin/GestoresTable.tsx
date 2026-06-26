// components/admin/GestoresTable.tsx
'use client'

import { useState, useTransition } from 'react'
import { addGestor, removeGestor } from '@/lib/actions/gestores'
import { formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { Gestor } from '@/types/db'

export default function GestoresTable({
  gestores,
  adminEmail,
}: {
  gestores: Gestor[]
  adminEmail: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showModal, setShowModal] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    startTransition(async () => {
      const result = await addGestor(nome, email)
      if (result.error) {
        setFormError(result.error)
        return
      }
      setNome('')
      setEmail('')
      setShowModal(false)
      router.refresh()
    })
  }

  function handleRemove(id: string, email: string) {
    if (!confirm(`Remover acesso de ${email}?`)) return
    startTransition(async () => {
      await removeGestor(id)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-muted text-sm">{gestores.length} gestores cadastrados</p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-accent hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Adicionar gestor
        </button>
      </div>

      {gestores.length === 0 ? (
        <p className="text-muted text-sm">Nenhum gestor cadastrado ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted text-xs uppercase tracking-widest">
                <th className="pb-3 pr-6">Nome</th>
                <th className="pb-3 pr-6">Email</th>
                <th className="pb-3 pr-6">Cadastrado em</th>
                <th className="pb-3 pr-6">Último acesso</th>
                <th className="pb-3 pr-6">Acessos</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody>
              {gestores.map((g) => (
                <tr
                  key={g.id}
                  className="border-b border-border/50 hover:bg-surface/50 transition-colors"
                >
                  <td className="py-3 pr-6">{g.nome ?? '—'}</td>
                  <td className="py-3 pr-6 text-muted">{g.email}</td>
                  <td className="py-3 pr-6 text-muted">{formatDate(g.created_at)}</td>
                  <td className="py-3 pr-6 text-muted">{formatDate(g.last_seen_at)}</td>
                  <td className="py-3 pr-6 text-muted">{g.login_count}</td>
                  <td className="py-3">
                    {g.email.toLowerCase() !== adminEmail ? (
                      <button
                        onClick={() => handleRemove(g.id, g.email)}
                        disabled={isPending}
                        className="text-red-400 hover:text-red-300 text-xs disabled:opacity-40 transition-colors"
                      >
                        Remover
                      </button>
                    ) : (
                      <span className="text-muted text-xs">master</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="font-semibold mb-4">Adicionar gestor</h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted">Nome (opcional)</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do gestor"
                  className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="gestor@email.com"
                  required
                  className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              {formError && (
                <p className="text-red-400 text-sm">{formError}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(null) }}
                  className="flex-1 border border-border text-sm py-2.5 rounded-lg hover:bg-border/50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || !email}
                  className="flex-1 bg-accent hover:bg-blue-500 disabled:opacity-40 text-white text-sm py-2.5 rounded-lg transition-colors"
                >
                  {isPending ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
