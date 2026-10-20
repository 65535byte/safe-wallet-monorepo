import { render } from '@/tests/test-utils'
import userEvent from '@testing-library/user-event'
import { PRIVACY_URL, TERMS_URL } from '@safe-global/utils/config/constants'
import GetStartedCard from './index'

jest.mock('@safe-global/utils/config/constants', () => ({
  ...jest.requireActual('@safe-global/utils/config/constants'),
  TERMS_URL: 'https://example.com/terms',
  PRIVACY_URL: 'https://example.com/privacy',
}))

const mockConnectWallet = jest.fn()
jest.mock('@/components/common/ConnectWallet/useConnectWallet', () => ({
  __esModule: true,
  default: () => mockConnectWallet,
}))

describe('GetStartedCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the heading and both call-to-actions', () => {
    const { getByRole, getByTestId } = render(<GetStartedCard />, {
      routerProps: { pathname: '/welcome/accounts', query: {} },
    })

    expect(getByRole('heading', { name: /开始使用/i })).toBeInTheDocument()
    expect(getByTestId('connect-wallet-button')).toBeInTheDocument()
    expect(getByTestId('watch-account-button')).toBeInTheDocument()
  })

  it('opens the wallet onboarding when "Connect wallet" is clicked', async () => {
    const { getByTestId } = render(<GetStartedCard />, {
      routerProps: { pathname: '/welcome/accounts', query: {} },
    })

    await userEvent.click(getByTestId('connect-wallet-button'))
    expect(mockConnectWallet).toHaveBeenCalled()
  })

  it('links "Watch any account" to /new-safe/load with the current page as `next`', () => {
    const { getByTestId } = render(<GetStartedCard />, {
      routerProps: { pathname: '/welcome/accounts', query: {} },
    })

    const href = getByTestId('watch-account-button').getAttribute('href') ?? ''
    const url = new URL(href, 'http://localhost')
    expect(url.pathname).toBe('/new-safe/load')
    expect(url.searchParams.get('next')).toBe('/welcome/accounts')
  })

  it('links the Terms and Privacy Policy', () => {
    const { getByRole } = render(<GetStartedCard />, {
      routerProps: { pathname: '/welcome/accounts', query: {} },
    })

    expect(getByRole('link', { name: '使用条款' })).toHaveAttribute('href', TERMS_URL)
    expect(getByRole('link', { name: /隐私政策/ })).toHaveAttribute('href', PRIVACY_URL)
  })
})
