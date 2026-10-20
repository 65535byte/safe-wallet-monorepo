import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import WcHints from '.'
import { trackEvent } from '@/services/analytics'

jest.mock('@/services/analytics', () => ({
  trackEvent: jest.fn(),
}))

describe('WcHints component tests', () => {
  const CONNECT_TITLE = '如何连接 dApp？'
  const INTERACT_TITLE = '如何与 dApp 交互？'
  const CONNECT_STEP = '打开支持 WalletConnect 的 dApp'
  const INTERACT_STEP = '按上述步骤连接 dApp'
  const CONNECT_WALLET = '连接钱包'
  const ENSURE_CHAIN = '确保 dApp 与 8379 账户连接同一条链'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Verify both help accordions are rendered collapsed by default', () => {
    render(<WcHints />)

    expect(screen.getByText(CONNECT_TITLE)).toBeVisible()
    expect(screen.getByText(INTERACT_TITLE)).toBeVisible()

    expect(screen.queryByText(CONNECT_STEP)).not.toBeInTheDocument()
    expect(screen.queryByText(INTERACT_STEP)).not.toBeInTheDocument()
  })

  it('Verify connection accordion can be expanded', async () => {
    render(<WcHints />)

    fireEvent.click(screen.getByText(CONNECT_TITLE))

    expect(await screen.findByText(CONNECT_STEP)).toBeInTheDocument()
    expect(screen.getByText(CONNECT_WALLET)).toBeInTheDocument()

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'walletconnect',
      action: 'WC expand hints',
    })
  })

  it('Verify interaction accordion can be expanded', async () => {
    render(<WcHints />)

    fireEvent.click(screen.getByText(INTERACT_TITLE))

    expect(await screen.findByText(INTERACT_STEP)).toBeInTheDocument()
    expect(screen.getByText(ENSURE_CHAIN)).toBeInTheDocument()

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'walletconnect',
      action: 'WC expand hints',
    })
  })

  it('Verify expanded accordion can be collapsed', async () => {
    render(<WcHints />)

    const connectionTitle = screen.getByText(CONNECT_TITLE)

    fireEvent.click(connectionTitle)
    expect(await screen.findByText(CONNECT_STEP)).toBeInTheDocument()

    fireEvent.click(connectionTitle)
    await waitFor(() => {
      expect(screen.queryByText(CONNECT_STEP)).not.toBeInTheDocument()
    })
  })

  it('Verify previously opened accordion is closed when opening a new one', async () => {
    render(<WcHints />)

    fireEvent.click(screen.getByText(CONNECT_TITLE))
    expect(await screen.findByText(CONNECT_STEP)).toBeInTheDocument()

    fireEvent.click(screen.getByText(INTERACT_TITLE))

    await waitFor(() => {
      expect(screen.queryByText(CONNECT_STEP)).not.toBeInTheDocument()
    })
    expect(await screen.findByText(INTERACT_STEP)).toBeInTheDocument()
  })
})
