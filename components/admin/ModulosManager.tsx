// components/admin/ModulosManager.tsx
'use client'

import { useState, useTransition } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
  createModulo,
  updateModulo,
  deleteModulo,
  reorderModulos,
} from '@/lib/actions/modulos'
import { useRouter } from 'next/navigation'
import type { Modulo } from '@/types/db'

function SortableModulo({
  modulo,
  onRename,
  onDelete,
}: {
  modulo: Modulo
  onRename: (id: string, titulo: string) => void
  onDelete: (id: string, titulo: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: modulo.id })
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(modulo.titulo)

  function commitRename() {
    if (draft.trim() && draft.trim() !== modulo.titulo) {
      onRename(modulo.id, draft.trim())
    }
    setEditing(false)
  }

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
        title="Arraste para reordenar"
      >
        ⠿
      </span>

      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename()
            if (e.key === 'Escape') { setDraft(modulo.titulo); setEditing(false) }
          }}
          className="flex-1 bg-background border border-accent rounded px-2 py-1 text-sm focus:outline-none"
        />
      ) : (
        <span
          className="flex-1 text-sm cursor-pointer hover:text-accent transition-colors"
          onClick={() => setEditing(true)}
          title="Clique para renomear"
        >
          {modulo.titulo}
        </span>
      )}

      <button
        onClick={() => onDelete(modulo.id, modulo.titulo)}
        className="text-red-400 hover:text-red-300 text-xs transition-colors"
      >
        Deletar
      </button>
    </div>
  )
}

export default function ModulosManager({ modulos: initial }: { modulos: Modulo[] }) {
  const router = useRouter()
  const [modulos, setModulos] = useState(initial)
  const [newTitulo, setNewTitulo] = useState('')
  const [isPending, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = modulos.findIndex((m) => m.id === active.id)
    const newIndex = modulos.findIndex((m) => m.id === over.id)
    const reordered = arrayMove(modulos, oldIndex, newIndex)
    setModulos(reordered)
    startTransition(async () => {
      await reorderModulos(reordered.map((m) => m.id))
    })
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitulo.trim()) return
    startTransition(async () => {
      await createModulo(newTitulo.trim())
      setNewTitulo('')
      router.refresh()
    })
  }

  function handleRename(id: string, titulo: string) {
    startTransition(async () => {
      await updateModulo(id, titulo)
      setModulos((prev) =>
        prev.map((m) => (m.id === id ? { ...m, titulo } : m))
      )
    })
  }

  function handleDelete(id: string, titulo: string) {
    if (!confirm(`Deletar módulo "${titulo}"? As aulas dentro dele ficarão sem módulo.`)) return
    startTransition(async () => {
      await deleteModulo(id)
      setModulos((prev) => prev.filter((m) => m.id !== id))
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          type="text"
          value={newTitulo}
          onChange={(e) => setNewTitulo(e.target.value)}
          placeholder="Nome do novo módulo"
          className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={isPending || !newTitulo.trim()}
          className="bg-accent hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
        >
          + Criar módulo
        </button>
      </form>

      {modulos.length === 0 ? (
        <p className="text-muted text-sm">Nenhum módulo criado ainda.</p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modulos.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-2">
              {modulos.map((m) => (
                <SortableModulo
                  key={m.id}
                  modulo={m}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
