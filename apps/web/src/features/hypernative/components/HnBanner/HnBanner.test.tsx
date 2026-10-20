import { render, screen } from '@/tests/test-utils'
import { HnBanner } from './HnBanner'

// Mock HnSignupFlow to avoid rendering the actual modal in tests
jest.mock('../HnSignupFlow', () => ({
  HnSignupFlow: ({ open }: { open: boolean }) => (open ? <div data-testid="hn-signup-flow" /> : null),
}))

describe('HnBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders title and CTA', () => {
    const mockOnHnSignupClick = jest.fn()
    render(<HnBanner onHnSignupClick={mockOnHnSignupClick} />)

    expect(screen.getByText('启用企业级安全保护')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '了解更多' })).toBeInTheDocument()
  })

  it('renders dismiss button when onDismiss is provided', () => {
    const mockOnHnSignupClick = jest.fn()
    const mockOnDismiss = jest.fn()
    render(<HnBanner onHnSignupClick={mockOnHnSignupClick} onDismiss={mockOnDismiss} />)

    const dismissButton = screen.getByRole('button', { name: '关闭' })
    expect(dismissButton).toBeInTheDocument()
  })

  it('does not render dismiss button when onDismiss is not provided', () => {
    const mockOnHnSignupClick = jest.fn()
    render(<HnBanner onHnSignupClick={mockOnHnSignupClick} />)

    const dismissButton = screen.queryByRole('button', { name: '关闭' })
    expect(dismissButton).not.toBeInTheDocument()
  })
})
