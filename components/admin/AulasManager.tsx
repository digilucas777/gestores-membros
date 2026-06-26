// components/admin/AulasManager.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  createAula,
  updateAula,
  deleteAula,
  reorderAulas,
} from '@/lib/actions/aulas'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Aula, Modulo } from '@/types/db'

type AulaFormData = {
  titulo: string
  descricao: string
  pandaInput: string
  moduloId: string
}

const emptyForm: AulaFormData = {
  titulo: '',
  descricao: '',
  pandaInput: '',
  moduloId: '',
}

function AulaFormModal({
  modulos,
  initial,
  onSubmit,
  onClose,
  isPending,
  formError,
  title,
}: {
  modulos: Modulo[]
  initial: AulaFormData
  onSubmit: (data: AulaFormData) => void
  onClose: () => void
  isPending: boolean
  formError: string | null
  title: string
}) {
  const [form, setForm] = useState(initial)
  const set = (k: keyof AulaFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="font-semibold mb-5">{title}</h2>
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(form) }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Título *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={set('titulo')}
              required
              placeholder="Título da aula"
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Descrição (opcional)</label>
            <textarea
              value={form.descricao}
              onChange={set('descricao')}
              rows={2}
              placeholder="Breve descrição da aula"
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Vídeo *</label>
            <textarea
              value={form.pandaInput}
              onChange={set('pandaInput')}
              rows={3}
              required
              placeholder={`Cole a URL ou o iframe completo:\nPanda Video: https://player-vz-xxx.tv.pandavideo.com.br/embed/?v=...\nVideoflow: <div class="vf-player" data-vf-src="..."></div>`}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-muted">Módulo (opcional)</label>
            <select
              value={form.moduloId}
              onChange={set('moduloId')}
              className="bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
            >
              <option value="">Sem módulo</option>
              {modulos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.titulo}
                </option>
              ))}
            </select>
          </div>

          {formError && <p className="text-red-400 text-sm">{formError}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border text-sm py-2.5 rounded-lg hover:bg-border/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-accent hover:bg-blue-500 disabled:opacity-40 text-white text-sm py-2.5 rounded-lg transition-colors"
            >
              {isPending ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SortableAulaCard({
  aula,
  onEdit,
  onDelete,
}: {
  aula: Aula
  onEdit: (aula: Aula) => void
  onDelete: (id: string, titulo: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: aula.id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 bg-surface border border-border rounded-lg px-4 py-3"
    >
      <span
        {...attributes}
        {...listeners}
        className="text-muted cursor-grab active:cursor-grabbing text-lg select-none"
      >
        ⠿
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{aula.titulo}</p>
        {aula.descricao && (
          <p className="text-xs text-muted truncate mt-0.5">{aula.descricao}</p>
        )}
      </div>
      <Link
        href={`/aulas/${aula.id}`}
        target="_blank"
        className="text-accent hover:text-blue-400 text-xs transition-colors shrink-0"
        title="Abrir aula"
      >
        ▶ Abrir
      </Link>
      <button
        onClick={() => onEdit(aula)}
        className="text-muted hover:text-white text-xs transition-colors shrink-0"
      >
        Editar
      </button>
      <button
        onClick={() => onDelete(aula.id, aula.titulo)}
        className="text-red-400 hover:text-red-300 text-xs transition-colors shrink-0"
      >
        Deletar
      </button>
    </div>
  )
}

type Props = {
  aulas: Aula[]
  modulos: Modulo[]
}

export default function AulasManager({ aulas: initialAulas, modulos }: Props) {
  const router = useRouter()
  const [aulas, setAulas] = useState(initialAulas)
  const [showCreate, setShowCreate] = useState(false)
  const [editingAula, setEditingAula] = useState<Aula | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Group by modulo_id for display, but keep a flat sortable list per section
  const sections: { modulo: Modulo | null; items: Aula[] }[] = [
    ...modulos.map((m) => ({
      modulo: m,
      items: aulas.filter((a) => a.modulo_id === m.id),
    })),
    { modulo: null, items: aulas.filter((a) => !a.modulo_id) },
  ]

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = aulas.findIndex((a) => a.id === active.id)
    const newIndex = aulas.findIndex((a) => a.id === over.id)
    const reordered = arrayMove(aulas, oldIndex, newIndex)
    setAulas(reordered)
    startTransition(async () => {
      await reorderAulas(reordered.map((a) => a.id))
    })
  }

  function handleCreate(data: AulaFormData) {
    setFormError(null)
    startTransition(async () => {
      const result = await createAula(
        data.titulo,
        data.descricao,
        data.pandaInput,
        data.moduloId || null
      )
      if (result.error) { setFormError(result.error); return }
      setShowCreate(false)
      router.refresh()
    })
  }

  function handleUpdate(data: AulaFormData) {
    if (!editingAula) return
    setFormError(null)
    startTransition(async () => {
      const result = await updateAula(
        editingAula.id,
        data.titulo,
        data.descricao,
        data.pandaInput,
        data.moduloId || null
      )
      if (result.error) { setFormError(result.error); return }
      setEditingAula(null)
      router.refresh()
    })
  }

  function handleDelete(id: string, titulo: string) {
    if (!confirm(`Deletar aula "${titulo}"?`)) return
    startTransition(async () => {
      await deleteAula(id)
      setAulas((prev) => prev.filter((a) => a.id !== id))
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-end">
        <button
          onClick={() => setShowCreate(true)}
          className="bg-accent hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nova aula
        </button>
      </div>

      {aulas.length === 0 ? (
        <p className="text-muted text-sm">Nenhuma aula criada ainda.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={aulas.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-8">
              {sections.map((section) => {
                if (section.items.length === 0) return null
                return (
                  <div key={section.modulo?.id ?? 'unassigned'}>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-muted mb-3">
                      {section.modulo?.titulo ?? 'Sem módulo'}
                    </h3>
                    <div className="flex flex-col gap-2">
                      {section.items.map((aula) => (
                        <SortableAulaCard
                          key={aula.id}
                          aula={aula}
                          onEdit={(a) => { setFormError(null); setEditingAula(a) }}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {showCreate && (
        <AulaFormModal
          modulos={modulos}
          initial={emptyForm}
          onSubmit={handleCreate}
          onClose={() => { setShowCreate(false); setFormError(null) }}
          isPending={isPending}
          formError={formError}
          title="Nova aula"
        />
      )}

      {editingAula && (
        <AulaFormModal
          modulos={modulos}
          initial={{
            titulo: editingAula.titulo,
            descricao: editingAula.descricao ?? '',
            pandaInput: editingAula.panda_video_url.replace(/^vf::/, ''),
            moduloId: editingAula.modulo_id ?? '',
          }}
          onSubmit={handleUpdate}
          onClose={() => { setEditingAula(null); setFormError(null) }}
          isPending={isPending}
          formError={formError}
          title="Editar aula"
        />
      )}
    </div>
  )
}
