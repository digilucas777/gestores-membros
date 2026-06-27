'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/service'

export async function sendMagicLink(
  email: string
): Promise<{ error?: string; success?: boolean }> {
  const normalizedEmail = email.toLowerCase().trim()

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!normalizedEmail || !emailRegex.test(normalizedEmail)) {
    return { error: 'Email inválido.' }
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const isAdmin = normalizedEmail === adminEmail

  if (!isAdmin) {
    const service = createServiceClient()
    const { data, error: queryError } = await service
      .from('gestores')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle()

    if (queryError) {
      console.error('[sendMagicLink] Erro na query gestores:', {
        code: queryError.code,
        message: queryError.message,
        details: queryError.details,
        hint: queryError.hint,
      })
      return { error: 'Erro ao verificar acesso. Tente novamente.' }
    }

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

  const headerStore = await headers()
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host') ?? ''
  const proto = headerStore.get('x-forwarded-proto') ?? 'https'
  const callbackUrl = `${proto}://${host}/auth/callback`
  console.log('[sendMagicLink] emailRedirectTo:', callbackUrl)

  const { error } = await supabase.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      emailRedirectTo: callbackUrl,
    },
  })

  if (error) {
    console.error('[sendMagicLink] Supabase error:', {
      code: error.code,
      message: error.message,
      status: error.status,
    })
    return { error: 'Erro ao enviar email. Tente novamente.' }
  }

  return { success: true }
}

export async function signInWithAdminPassword(
  email: string,
  password: string
): Promise<{ error?: string; success?: boolean }> {
  const normalizedEmail = email.toLowerCase().trim()

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  if (!adminEmail || normalizedEmail !== adminEmail) {
    return { error: 'Acesso não autorizado.' }
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

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  })

  if (error) {
    console.error('[signInWithAdminPassword] Supabase error:', {
      code: error.code,
      message: error.message,
      status: error.status,
    })
    return { error: 'Email ou senha incorretos.' }
  }

  return { success: true }
}
