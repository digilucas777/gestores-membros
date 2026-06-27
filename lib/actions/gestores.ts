'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/service'
import type { AcessoWithGestor, Gestor } from '@/types/db'

export type AdminStats = {
  totalGestores: number
  activeGestores: number
  totalAulas: number
  totalModulos: number
  recentAcessos: AcessoWithGestor[]
}

export async function getAdminStats(): Promise<AdminStats> {
  const db = createServiceClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: totalGestores },
    { count: activeGestores },
    { count: totalAulas },
    { count: totalModulos },
    { data: recentAcessos },
  ] = await Promise.all([
    db.from('gestores').select('*', { count: 'exact', head: true }),
    db
      .from('gestores')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen_at', thirtyDaysAgo),
    db.from('aulas').select('*', { count: 'exact', head: true }),
    db.from('modulos').select('*', { count: 'exact', head: true }),
    db
      .from('acessos')
      .select('*, gestores(nome, email)')
      .order('accessed_at', { ascending: false })
      .limit(20),
  ])

  return {
    totalGestores: totalGestores ?? 0,
    activeGestores: activeGestores ?? 0,
    totalAulas: totalAulas ?? 0,
    totalModulos: totalModulos ?? 0,
    recentAcessos: (recentAcessos ?? []) as AcessoWithGestor[],
  }
}

export async function getGestores(): Promise<Gestor[]> {
  const db = createServiceClient()
  const { data, error } = await db
    .from('gestores')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function addGestor(
  nome: string,
  email: string
): Promise<{ error?: string }> {
  const normalizedEmail = email.toLowerCase().trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) return { error: 'Email inválido.' }

  const db = createServiceClient()
  const { error: insertError } = await db
    .from('gestores')
    .insert({ nome: nome.trim() || null, email: normalizedEmail })

  if (insertError?.code === '23505') return { error: 'Email já cadastrado.' }
  if (insertError) return { error: 'Erro ao cadastrar gestor.' }

  const { error: authError } = await db.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: true,
  })

  if (authError && authError.status !== 422) {
    console.error('[addGestor] auth.admin.createUser error:', {
      message: authError.message,
      status: authError.status,
    })
  }

  revalidatePath('/admin', 'layout')
  return {}
}

export async function removeGestor(id: string): Promise<void> {
  const db = createServiceClient()
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()

  if (adminEmail) {
    const { data } = await db
      .from('gestores')
      .select('email')
      .eq('id', id)
      .maybeSingle()
    if (data?.email?.toLowerCase() === adminEmail) return
  }

  await db.from('gestores').delete().eq('id', id)
  revalidatePath('/admin', 'layout')
}
