// app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
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

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth', origin))
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user?.email) {
    const service = createServiceClient()

    // Atomically update last_seen_at and login_count
    await service.rpc('increment_login_count', { p_email: user.email })

    // Insert access log (only for gestores, not admin)
    const { data: gestor } = await service
      .from('gestores')
      .select('id')
      .eq('email', user.email)
      .maybeSingle()

    if (gestor) {
      await service.from('acessos').insert({ gestor_id: gestor.id })
    }
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const dest = user?.email === adminEmail ? '/admin' : '/aulas'
  return NextResponse.redirect(new URL(dest, origin))
}
