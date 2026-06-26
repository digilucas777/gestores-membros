import { sendMagicLink } from '@/lib/actions/auth'

jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(),
}))

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => Promise.resolve({ getAll: () => [], set: jest.fn() })),
}))

const { createServiceClient } = require('@/lib/supabase/service')
const { createServerClient } = require('@supabase/ssr')

function makeServiceMock(gestorData: { id: string } | null) {
  return {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn(() => Promise.resolve({ data: gestorData })),
        })),
      })),
    })),
  }
}

function makeSupabaseMock(otpError: Error | null = null) {
  return {
    auth: {
      signInWithOtp: jest.fn(() => Promise.resolve({ error: otpError })),
    },
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  process.env.ADMIN_EMAIL = 'admin@test.com'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
})

describe('sendMagicLink', () => {
  it('returns error for invalid email', async () => {
    const result = await sendMagicLink('notanemail')
    expect(result.error).toBe('Email inválido.')
  })

  it('returns error when email not in gestores and not admin', async () => {
    createServiceClient.mockReturnValue(makeServiceMock(null))
    createServerClient.mockReturnValue(makeSupabaseMock())
    const result = await sendMagicLink('unknown@test.com')
    expect(result.error).toBe('Acesso não autorizado.')
  })

  it('sends magic link when email is in gestores', async () => {
    createServiceClient.mockReturnValue(makeServiceMock({ id: 'gestor-1' }))
    const mockSignIn = jest.fn(() => Promise.resolve({ error: null }))
    createServerClient.mockReturnValue({ auth: { signInWithOtp: mockSignIn } })
    const result = await sendMagicLink('gestor@test.com')
    expect(result.success).toBe(true)
    expect(mockSignIn).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'gestor@test.com' })
    )
  })

  it('sends magic link when email is admin (skips DB check)', async () => {
    const mockSignIn = jest.fn(() => Promise.resolve({ error: null }))
    createServerClient.mockReturnValue({ auth: { signInWithOtp: mockSignIn } })
    const result = await sendMagicLink('admin@test.com')
    expect(result.success).toBe(true)
    expect(createServiceClient).not.toHaveBeenCalled()
  })

  it('returns error when Supabase OTP fails', async () => {
    createServiceClient.mockReturnValue(makeServiceMock({ id: 'g-1' }))
    createServerClient.mockReturnValue(
      makeSupabaseMock(new Error('rate limited'))
    )
    const result = await sendMagicLink('gestor@test.com')
    expect(result.error).toBe('Erro ao enviar email. Tente novamente.')
  })
})
