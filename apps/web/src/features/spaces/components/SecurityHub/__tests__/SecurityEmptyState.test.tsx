import { render, screen } from '@/tests/test-utils'
import { fireEvent } from '@testing-library/react'
import SecurityEmptyState from '../components/SecurityEmptyState/SecurityEmptyState'

jest.mock('@/features/hypernative/components/HnSignupFlow', () => ({
  __esModule: true,
  HnSignupFlow: ({ open }: { open: boolean }) =>
    open ? <div data-testid="mock-hn-signup-flow">Hypernative signup</div> : null,
}))

jest.mock('@/features/spaces/components/AddAccounts', () => {
  const MockAddAccounts = ({ buttonLabel }: { buttonLabel?: string }) => (
    <button data-testid="mock-add-accounts">{buttonLabel ?? 'Add Accounts'}</button>
  )
  MockAddAccounts.displayName = 'MockAddAccounts'
  return { __esModule: true, default: MockAddAccounts }
})

jest.mock('@/components/common/Track', () => {
  const Track = ({ children }: { children: React.ReactNode }) => <>{children}</>
  Track.displayName = 'Track'
  return Track
})

describe('SecurityEmptyState', () => {
  it('renders the heading and subtitle copy', () => {
    render(<SecurityEmptyState />)

    expect(screen.getByText('暂无可检查的账户')).toBeInTheDocument()
    expect(screen.getByText('将 8379 账户添加到工作空间，即可开始安全检查并在此查看安全状态。')).toBeInTheDocument()
  })

  it('renders the Add account CTA', () => {
    render(<SecurityEmptyState />)

    expect(screen.getByRole('button', { name: '添加账户' })).toBeInTheDocument()
  })

  it('exposes a test id for higher-level assertions', () => {
    render(<SecurityEmptyState />)

    expect(screen.getByTestId('security-empty-state')).toBeInTheDocument()
  })

  it('marks the Hypernative logo as decorative', () => {
    render(<SecurityEmptyState />)

    expect(screen.getByAltText('')).toHaveAttribute('src', '/images/hypernative/hypernative-icon.svg')
  })

  it('opens the Hypernative signup flow when the Hypernative card is clicked', () => {
    render(<SecurityEmptyState />)

    expect(screen.queryByTestId('mock-hn-signup-flow')).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('Hypernative Guardian'))

    expect(screen.getByTestId('mock-hn-signup-flow')).toBeInTheDocument()
  })
})
