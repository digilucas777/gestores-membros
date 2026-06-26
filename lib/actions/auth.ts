'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'

export async function sendMagicLink(
  email: string
): Promise<{ error?: string; success?: boolean }> {
  const normalizedEmail = email.toLowerCase().trim()

  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return { error: 'Email inválido.' }
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const isAdmin = normalizedEmail === adminEmail

  if (!isAdmin) {
    const service = createServiceClient()
    const { data } = await service
      .from('gestores')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (!data) {
      return { error: 'Acesso não autorizado.' }
    }
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    return { error: 'Erro ao enviar email. Tente novamente.' }
  }

  return { success: true }
}
