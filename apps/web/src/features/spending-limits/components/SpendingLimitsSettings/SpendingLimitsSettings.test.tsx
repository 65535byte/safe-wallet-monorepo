import { render, screen } from '@/tests/test-utils'
import { FEATURES } from '@safe-global/utils/utils/chains'
import SpendingLimitsSettings from './index'

const mockUsePlanGate = jest.fn()
jest.mock('@/features/spaces/hooks/usePlanGate', () => ({
  usePlanGate: (...args: unknown[]) => mockUsePlanGate(...args),
}))
jest.mock('@/hooks/useChains', () => ({
  __esModule: true,
  default: jest.fn(() => ({ configs: [] })),
  useHasFeature: jest.fn(() => true),
}))
jest.mock('../../hooks/useIsSpendingLimitSupported', () => ({ __esModule: true, default: () => true }))

const gate = (mustUpgradeToSafePro: boolean, isLoading = false, showProTag = false) => ({
  mustUpgradeToSafePro,
  isLoading,
  showProTag,
  upgradeHref: '/spaces/plans',
})

describe('SpendingLimitsSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUsePlanGate.mockReturnValue(gate(false))
  })

  it('offers a new spending limit while the plan gate is open', () => {
    render(<SpendingLimitsSettings />)

    expect(mockUsePlanGate).toHaveBeenCalledWith(FEATURES.SPENDING_LIMIT_GATING)
    expect(screen.getByTestId('new-spending-limit')).toBeInTheDocument()
    expect(screen.queryByTestId('safe-pro-lock')).not.toBeInTheDocument()
    expect(screen.queryByTestId('pro-tag')).not.toBeInTheDocument()
  })

  it('marks the button with the Pro tag when the plan gate asks for it', () => {
    mockUsePlanGate.mockReturnValue(gate(false, false, true))

    render(<SpendingLimitsSettings />)

    expect(screen.getByTestId('new-spending-limit')).toContainElement(screen.getByTestId('pro-tag'))
  })

  it('replaces the button with the 8379 lock while the plan gate blocks it', () => {
    mockUsePlanGate.mockReturnValue(gate(true))

    render(<SpendingLimitsSettings />)

    expect(screen.queryByTestId('new-spending-limit')).not.toBeInTheDocument()
    expect(screen.getByTestId('safe-pro-lock')).toHaveTextContent('已有配置将继续生效。')
    expect(screen.getByRole('link', { name: '了解 8379' })).toHaveAttribute('href', '/spaces/plans')
  })

  it('renders neither the button nor the lock while the plan gate is loading', () => {
    mockUsePlanGate.mockReturnValue(gate(false, true))

    render(<SpendingLimitsSettings />)

    expect(screen.queryByTestId('new-spending-limit')).not.toBeInTheDocument()
    expect(screen.queryByTestId('safe-pro-lock')).not.toBeInTheDocument()
  })
})
