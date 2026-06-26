// lib/actions/modulos.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import type { Modulo } from '@/types/db'

export async function getModulosAdmin(): Promise<Modulo[]> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('modulos')
    .select('*')
    .order('position', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createModulo(
  titulo: string
): Promise<{ error?: string }> {
  if (!titulo.trim()) return { error: 'Título obrigatório.' }
  const db = createServiceClient()
  const { data: last } = await db
    .from('modulos')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextPosition = (last?.position ?? -1) + 1
  const { error } = await db
    .from('modulos')
    .insert({ titulo: titulo.trim(), position: nextPosition })
  if (error) return { error: 'Erro ao criar módulo.' }
  revalidatePath('/admin/modulos')
  revalidatePath('/aulas')
  return {}
}

export async function updateModulo(id: string, titulo: string): Promise<void> {
  const db = createServiceClient()
  await db.from('modulos').update({ titulo: titulo.trim() }).eq('id', id)
  revalidatePath('/admin/modulos')
  revalidatePath('/aulas')
}

export async function deleteModulo(id: string): Promise<void> {
  const db = createServiceClient()
  // Aulas with this modulo_id will have modulo_id set to null (ON DELETE SET NULL)
  await db.from('modulos').delete().eq('id', id)
  revalidatePath('/admin/modulos')
  revalidatePath('/admin/aulas')
  revalidatePath('/aulas')
}

export async function reorderModulos(ids: string[]): Promise<void> {
  const db = createServiceClient()
  await Promise.all(
    ids.map((id, index) =>
      db.from('modulos').update({ position: index }).eq('id', id)
    )
  )
  revalidatePath('/admin/modulos')
  revalidatePath('/aulas')
}
