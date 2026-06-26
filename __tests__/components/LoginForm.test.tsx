import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginForm from '@/components/LoginForm'

jest.mock('@/lib/actions/auth', () => ({
  sendMagicLink: jest.fn(),
}))

const { sendMagicLink } = require('@/lib/actions/auth')

beforeEach(() => jest.clearAllMocks())

describe('LoginForm', () => {
  it('renders email input and submit button', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/seu email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('shows success state after magic link sent', async () => {
    sendMagicLink.mockResolvedValue({ success: true })
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/seu email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => {
      expect(screen.getByText(/verifique seu email/i)).toBeInTheDocument()
    })
  })

  it('shows error message on failure', async () => {
    sendMagicLink.mockResolvedValue({ error: 'Acesso não autorizado.' })
    render(<LoginForm />)
    fireEvent.change(screen.getByLabelText(/seu email/i), {
      target: { value: 'unknown@example.com' },
    })
    fireEvent.submit(screen.getByRole('form'))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Acesso não autorizado.')
    })
  })
})
