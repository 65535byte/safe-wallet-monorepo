import { render, screen, fireEvent } from '@testing-library/react'
import ConnectWalletPrompt from './index'

const mockConnectWallet = jest.fn()
jest.mock('@/components/common/ConnectWallet/useConnectWallet', () => ({
  __esModule: true,
  default: () => mockConnectWallet,
}))

describe('ConnectWalletPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the connect wallet prompt', () => {
    render(<ConnectWalletPrompt />)

    expect(screen.getByTestId('connect-wallet-prompt')).toBeInTheDocument()
    expect(screen.getByText('连接您的钱包')).toBeInTheDocument()
    expect(screen.getByText(/view and manage your 个 8379 账户/i)).toBeInTheDocument()
  })

  it('should call connectWallet when button is clicked', () => {
    render(<ConnectWalletPrompt />)

    fireEvent.click(screen.getByTestId('connect-wallet-button'))

    expect(mockConnectWallet).toHaveBeenCalled()
  })
})
