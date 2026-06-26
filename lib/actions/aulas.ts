// lib/actions/aulas.ts
'use server'

import { createServiceClient } from '@/lib/supabase/service'
import { extractVideoUrl } from '@/lib/utils'
import type { Aula, Modulo } from '@/types/db'

export async function getModulos(): Promise<Modulo[]> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('modulos')
    .select('*')
    .order('position', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAulas(): Promise<Aula[]> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('aulas')
    .select('*')
    .order('position', { ascending: true })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAulaById(id: string): Promise<Aula | null> {
  const db = createServiceClient()
  const { data } = await db
    .from('aulas')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  return data
}

export async function createAula(
  titulo: string,
  descricao: string,
  pandaInput: string,
  moduloId: string | null
): Promise<{ error?: string }> {
  if (!titulo.trim()) return { error: 'Título obrigatório.' }
  if (!pandaInput.trim()) return { error: 'URL do vídeo obrigatória.' }

  const panda_video_url = extractVideoUrl(pandaInput)
  const db = createServiceClient()

  let posQuery = db
    .from('aulas')
    .select('position')
    .order('position', { ascending: false })
    .limit(1)

  posQuery = moduloId
    ? posQuery.eq('modulo_id', moduloId)
    : posQuery.is('modulo_id', null)

  const { data: last } = await posQuery.maybeSingle()

  const nextPosition = (last?.position ?? -1) + 1

  const { error } = await db.from('aulas').insert({
    titulo: titulo.trim(),
    descricao: descricao.trim() || null,
    panda_video_url,
    modulo_id: moduloId || null,
    position: nextPosition,
  })

  if (error) return { error: 'Erro ao criar aula.' }
  return {}
}

export async function updateAula(
  id: string,
  titulo: string,
  descricao: string,
  pandaInput: string,
  moduloId: string | null
): Promise<{ error?: string }> {
  if (!titulo.trim()) return { error: 'Título obrigatório.' }
  if (!pandaInput.trim()) return { error: 'URL do vídeo obrigatória.' }

  const panda_video_url = extractVideoUrl(pandaInput)
  const db = createServiceClient()

  const { error } = await db
    .from('aulas')
    .update({
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      panda_video_url,
      modulo_id: moduloId || null,
    })
    .eq('id', id)

  if (error) return { error: 'Erro ao atualizar aula.' }
  return {}
}

export async function deleteAula(id: string): Promise<void> {
  const db = createServiceClient()
  await db.from('aulas').delete().eq('id', id)
}

export async function reorderAulas(ids: string[]): Promise<void> {
  const db = createServiceClient()
  await Promise.all(
    ids.map((id, index) =>
      db.from('aulas').update({ position: index }).eq('id', id)
    )
  )
}
