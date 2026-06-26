'use server'

import { createServiceClient } from '@/lib/supabase/service'
import type { AcessoWithGestor } from '@/types/db'

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
