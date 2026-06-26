// lib/actions/aulas.ts
'use server'

import { createServiceClient } from '@/lib/supabase/service'
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
