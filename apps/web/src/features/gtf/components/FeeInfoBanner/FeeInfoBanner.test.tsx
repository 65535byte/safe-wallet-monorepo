import { render, screen, fireEvent } from '@testing-library/react'
import FeeInfoBanner from './index'

const mockSetDismissed = jest.fn()
let mockDismissed = false

jest.mock('@/services/local-storage/useLocalStorage', () => jest.fn(() => [mockDismissed, mockSetDismissed]))

jest.mock('@/hooks/useChainId', () => jest.fn(() => '1'))

describe('FeeInfoBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDismissed = false
  })

  it('renders the banner when not dismissed', () => {
    render(<FeeInfoBanner />)

    expect(screen.getByText('即将支持从 8379 余额中支付费用。')).toBeInTheDocument()
    expect(screen.getByText('无需为签名钱包充值')).toBeInTheDocument()
    expect(screen.getByText('使用任何受支持的代币支付费用')).toBeInTheDocument()
    expect(screen.getByText('了解更多')).toBeInTheDocument()
  })

  it('does not render when dismissed', () => {
    mockDismissed = true

    const { container } = render(<FeeInfoBanner />)

    expect(container.innerHTML).toBe('')
  })

  it('calls setDismissed when close button is clicked', () => {
    render(<FeeInfoBanner />)

    fireEvent.click(screen.getByLabelText('关闭'))

    expect(mockSetDismissed).toHaveBeenCalledWith(true)
  })
})
