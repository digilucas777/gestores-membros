// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'magiclink' | 'email' | null

  if (!code && !token_hash) {
    console.error('[callback] Parâmetros ausentes:', Object.fromEntries(searchParams))
    return NextResponse.redirect(new URL('/login?error=missing_code', origin))
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

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[callback] exchangeCodeForSession error:', {
        code: error.code,
        message: error.message,
        status: error.status,
      })
      return NextResponse.redirect(new URL('/login?error=auth', origin))
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (error) {
      console.error('[callback] verifyOtp error:', {
        code: error.code,
        message: error.message,
        status: error.status,
      })
      return NextResponse.redirect(new URL('/login?error=auth', origin))
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.email) {
    const service = createServiceClient()

    await service.rpc('increment_login_count', { p_email: user.email })

    const { data: gestor } = await service
      .from('gestores')
      .select('id')
      .eq('email', user.email)
      .maybeSingle()

    if (gestor) {
      await service.from('acessos').insert({ gestor_id: gestor.id })
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const dest = user?.email?.toLowerCase() === adminEmail ? '/admin' : '/aulas'
  return NextResponse.redirect(new URL(dest, origin))
}
