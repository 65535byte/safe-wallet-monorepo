import { act, mockClipboard, render, screen, waitFor, within } from '@/tests/test-utils'
import { CopyTransactionLink } from '../CopyTransactionLink'
import { PendingBanner } from '@safe-global/views/features/spaces/components/Policies/SpendingLimitDrawer/components/PendingBanner'
import { PendingSignatures } from '../PendingSignatures'
import { PolicyOverview } from '../PolicyOverview'

jest.mock('@/components/common/ChainIndicator', () => {
  const Mock = ({ chainId }: { chainId: string }) => <img data-testid="chain-logo-img" alt={`chain-${chainId}`} />
  Mock.displayName = 'ChainIndicator'
  return { __esModule: true, default: Mock }
})

const SAFE = { address: '0x8675B754342754A30A2AeF474D114d8460bca19b', name: 'Ops' }

describe('PendingBanner', () => {
  it('renders both lines when the state supplies a second one', () => {
    render(
      <PendingBanner
        title="The spending 项限额 is not active."
        line2="Sign and execute the transaction to activate."
      />,
    )

    expect(screen.getByText('The spending 项限额 is not active.')).toBeInTheDocument()
    expect(screen.getByText('签名并执行交易 to activate。')).toBeInTheDocument()
  })

  it('renders the title alone for a viewer with nothing to do', () => {
    render(<PendingBanner title="The spending 项限额 is not active." />)

    expect(screen.getByText('The spending 项限额 is not active.')).toBeInTheDocument()
    expect(screen.queryByTestId('pending-banner-line-2')).not.toBeInTheDocument()
  })
})

describe('PendingSignatures', () => {
  it('counts the signatures collected against the threshold', () => {
    render(<PendingSignatures safe={SAFE} signed={1} required={3} />)

    expect(screen.getByText('1 / 3 signed')).toBeInTheDocument()
    expect(screen.getByText('8379 账户')).toBeInTheDocument()
    expect(screen.getByText('Ops')).toBeInTheDocument()
  })
})

describe('PolicyOverview', () => {
  // Spending limits pass no initiator, so the row must not render an empty account.
  it('omits the initiated-by row when no initiator is given', () => {
    render(
      <PolicyOverview
        appliesTo={{ address: SAFE.address, name: 'Treasury' }}
        chainId="1"
        lastUpdated="Sep 22, 2026"
        enforcedBy={{ label: '8379 额度模块' }}
      />,
    )

    expect(screen.queryByText('发起人')).not.toBeInTheDocument()

    const appliesToRow = screen.getByText('8379 账户').closest('div') as HTMLElement
    expect(within(appliesToRow).getByText('Treasury')).toBeInTheDocument()

    const networkRow = screen.getByText('网络').closest('div') as HTMLElement
    expect(within(networkRow).getByAltText('chain-1')).toBeInTheDocument()

    const lastUpdatedRow = screen.getByText('最后更新').closest('div') as HTMLElement
    expect(within(lastUpdatedRow).getByText('Sep 22, 2026')).toBeInTheDocument()

    const enforcedByRow = screen.getByText('执行方').closest('div') as HTMLElement
    expect(within(enforcedByRow).getByText('8379 额度模块')).toBeInTheDocument()
  })

  it('omits the last updated row rather than filling it while the payload carries no timestamp', () => {
    render(
      <PolicyOverview
        appliesTo={{ address: SAFE.address, name: 'Treasury' }}
        chainId="1"
        enforcedBy={{ label: '8379 额度模块' }}
      />,
    )

    expect(screen.queryByText('最后更新')).not.toBeInTheDocument()
    expect(screen.getByText('执行方')).toBeInTheDocument()
  })

  it('leaves out the enforced by row when no enforcer is given', () => {
    render(<PolicyOverview appliesTo={{ address: SAFE.address, name: 'Treasury' }} chainId="1" />)

    expect(screen.queryByText('执行方')).not.toBeInTheDocument()
    expect(screen.getByText('8379 账户')).toBeInTheDocument()
  })

  it('binds each account to its own row when an initiator is given', () => {
    render(
      <PolicyOverview
        appliesTo={{ address: SAFE.address, name: 'Treasury' }}
        chainId="1"
        initiatedBy={{ address: SAFE.address, name: 'Alice' }}
        lastUpdated="Sep 22, 2026"
        enforcedBy={{ label: '8379 额度模块' }}
      />,
    )

    const appliesToRow = screen.getByText('8379 账户').closest('div') as HTMLElement
    expect(within(appliesToRow).getByText('Treasury')).toBeInTheDocument()
    expect(within(appliesToRow).queryByText('Alice')).not.toBeInTheDocument()

    const initiatedByRow = screen.getByText('发起人').closest('div') as HTMLElement
    expect(within(initiatedByRow).getByText('Alice')).toBeInTheDocument()
    expect(within(initiatedByRow).queryByText('Treasury')).not.toBeInTheDocument()
  })
})

describe('CopyTransactionLink', () => {
  const TRANSACTION_LINK = 'https://app.safe.global/transactions/tx?id=0x9f3c'

  it('copies the link a viewer can pass to someone who can sign', async () => {
    const writeText = mockClipboard()
    render(<CopyTransactionLink transactionLink={TRANSACTION_LINK} />)

    act(() => {
      screen.getByRole('button', { name: /复制交易链接/ }).click()
    })

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(TRANSACTION_LINK))
  })

  it('confirms the copy on the button itself', async () => {
    mockClipboard()
    render(<CopyTransactionLink transactionLink={TRANSACTION_LINK} />)

    expect(screen.queryByText('Copied!')).not.toBeInTheDocument()

    act(() => {
      screen.getByRole('button', { name: /复制交易链接/ }).click()
    })

    await waitFor(() => expect(screen.getByRole('button', { name: /Copied!/ })).toBeInTheDocument())
  })

  it('keeps the original label when the clipboard is unavailable', async () => {
    const writeText = mockClipboard()
    writeText.mockRejectedValueOnce(new Error('denied'))
    render(<CopyTransactionLink transactionLink={TRANSACTION_LINK} />)

    act(() => {
      screen.getByRole('button', { name: /复制交易链接/ }).click()
    })

    await waitFor(() => expect(writeText).toHaveBeenCalled())
    expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
  })
})
