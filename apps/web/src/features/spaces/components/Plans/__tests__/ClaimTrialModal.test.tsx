import { fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import { SAFE_PRO_PRICING_URL } from '@/config/constants'
import { trackEvent } from '@/services/analytics'
import { SAFE_PRO_EVENTS } from '@/services/analytics/events/safe-pro'
import ClaimTrialModal, { claimCopy, _freeLabel } from '../ClaimTrialModal'

const mockUseSpaceOffers = jest.fn()
const mockStartCheckout = jest.fn()
const mockRemoveSafes = jest.fn()
const mockSpaceSafes = jest.fn()
let mockCheckoutState: Record<string, unknown> = {}
let mockRemoveState: Record<string, unknown> = {}

jest.mock('@/services/analytics', () => ({ ...jest.requireActual('@/services/analytics'), trackEvent: jest.fn() }))
jest.mock('../../../hooks/billing/useSpaceOffers', () => ({
  useSpaceOffers: (spaceId?: string) => mockUseSpaceOffers(spaceId),
}))
jest.mock('../../../hooks/billing/useStartCheckout', () => ({
  useStartCheckout: (spaceId?: string, returnPathname?: string) => ({
    startCheckout: (paymentLinkId: string) => mockStartCheckout(spaceId, returnPathname, paymentLinkId),
    isRedirecting: false,
    isError: false,
    ...mockCheckoutState,
  }),
}))
jest.mock('@safe-global/store/gateway/AUTO_GENERATED/spaces', () => ({
  useSpaceSafesGetV1Query: () => ({ currentData: mockSpaceSafes() }),
  useSpaceSafesDeleteV1Mutation: () => [mockRemoveSafes, { isLoading: false, error: undefined, ...mockRemoveState }],
}))
jest.mock('../SelectAccountsStep', () => ({
  __esModule: true,
  default: ({
    limit,
    planName,
    onBack,
    onContinue,
    error,
  }: {
    limit: number
    planName: string
    onBack: () => void
    onContinue: (removed: Array<{ chainId: string; address: string }>) => void
    error?: string
  }) => (
    <div data-testid="select-accounts-step" data-limit={limit} data-plan={planName}>
      {error}
      <button onClick={onBack}>step-back</button>
      <button onClick={() => onContinue([{ chainId: '1', address: '0xB' }])}>step-continue</button>
    </div>
  ),
}))

const offer = (planName: string, paymentLinkId: string, seats: number, price: number) => ({
  paymentLinkId,
  priceId: `price_${paymentLinkId}`,
  planName,
  seats,
  price,
  currency: 'eur',
  billingCycle: 'month',
  trialPeriodDays: 60,
})
const BUSINESS = {
  name: 'Business',
  offers: [{ ...offer('Business', 'pl_business', 20, 499), features: ['策略引擎'] }],
}
const STARTER = { name: 'Starter', offers: [offer('Starter', 'pl_starter', 2, 149)] }
const SPACE_ID = '11111111-1111-1111-1111-111111111111'
const LOGIN_ENTRY = { 'Entry Point': 'workspace_login' }

describe('ClaimTrialModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCheckoutState = {}
    mockRemoveState = {}
    mockUseSpaceOffers.mockReturnValue({ trialPlans: [BUSINESS], trialPeriodDays: 60, isLoading: false })
    mockSpaceSafes.mockReturnValue({ safes: { '1': ['0xA', '0xB'] } })
    mockRemoveSafes.mockResolvedValue({ data: undefined })
    jest.spyOn(Date, 'now').mockReturnValue(Date.UTC(2026, 9, 6, 12))
  })

  afterEach(() => jest.restoreAllMocks())

  it('adapts the headline to the migrated 60-day grace and to a regular trial', () => {
    expect(claimCopy(60).title).toBe('开始使用 8379 工作空间')
    expect(claimCopy(30)).toMatchObject({
      title: '开始免费使用 8379 30 天',
      subtitle: '解锁所有 Pro 功能，无需提前填写账单信息。',
      note: '无需付款方式。我们将在免费使用期结束前 7 天提醒您。',
      back: '前往我的账户',
      claim: '领取免费使用期',
    })
    expect(claimCopy(null).title).toBe('开始免费使用 8379')
    expect(claimCopy(60, 'new')).toEqual({
      title: '工作空间由 8379 提供支持',
      subtitle: '前 60 天免费。',
      note: '无需付款方式。我们将在免费使用期结束前 7 天提醒您。',
      back: '前往我的账户',
      claim: '领取免费使用期',
    })
  })

  it('tags the price as free, with the length of the free period for a brand-new Workspace', () => {
    expect(_freeLabel(60, 'existing')).toBe('免费')
    expect(_freeLabel(30, 'new')).toBe('免费 30 天')
    expect(_freeLabel(null, 'new')).toBe('免费')
  })

  it('links to the full feature comparison under the header', () => {
    render(<ClaimTrialModal spaceId={SPACE_ID} onBack={jest.fn()} />)

    expect(screen.getByRole('link', { name: /比较全部功能/ })).toHaveAttribute('href', SAFE_PRO_PRICING_URL)
  })

  it('offers the Business trial and, when the Workspace fits the seats, goes straight to Stripe', () => {
    const onBack = jest.fn()
    render(<ClaimTrialModal spaceId={SPACE_ID} onBack={onBack} />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('开始使用 8379 工作空间')
    expect(screen.getByText(/60 天而非 30 天/)).toBeInTheDocument()
    expect(screen.getByTestId('trial-offer-Business')).toHaveTextContent('€499')
    expect(screen.getByTestId('trial-offer-Business')).toHaveTextContent('免费')
    expect(screen.getByText('可使用至 Dec 5, 2026。之后您可以随时订阅。')).toBeInTheDocument()
    expect(screen.getByText('20 个 8379 账户')).toBeInTheDocument()
    expect(screen.getByText('策略引擎')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '前往我的账户' }))
    expect(onBack).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /领取免费使用期/ }))
    expect(mockStartCheckout).toHaveBeenCalledWith(SPACE_ID, undefined, 'pl_business')
    expect(mockRemoveSafes).not.toHaveBeenCalled()
    expect(screen.queryByTestId('select-accounts-step')).not.toBeInTheDocument()
  })

  it('tracks the offer, the claim and the dismissal with the entry point', () => {
    render(<ClaimTrialModal spaceId={SPACE_ID} onBack={jest.fn()} />)
    expect(trackEvent).toHaveBeenCalledWith(SAFE_PRO_EVENTS.FREE_ACCESS_OFFER_VIEWED, {
      ...LOGIN_ENTRY,
      'Free Access Length': 60,
    })

    fireEvent.click(screen.getByRole('button', { name: /领取免费使用期/ }))
    expect(trackEvent).toHaveBeenCalledWith(SAFE_PRO_EVENTS.FREE_ACCESS_CLAIM_CLICKED, LOGIN_ENTRY)

    fireEvent.click(screen.getByRole('button', { name: '前往我的账户' }))
    expect(trackEvent).toHaveBeenCalledWith(SAFE_PRO_EVENTS.FREE_ACCESS_OFFER_DISMISSED, {
      ...LOGIN_ENTRY,
      'Dismiss Action': 'go_to_my_accounts',
    })
  })

  it('greets a brand-new Workspace with the full feature list and sends it straight to Stripe', () => {
    mockSpaceSafes.mockReturnValue({ safes: {} })
    const onBack = jest.fn()
    render(<ClaimTrialModal spaceId={SPACE_ID} onBack={onBack} returnPathname="/welcome/select-safes" variant="new" />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('工作空间由 8379 提供支持')
    expect(screen.getByText('前 60 天免费。')).toBeInTheDocument()
    expect(screen.getByText(/无需付款方式/)).toBeInTheDocument()
    expect(screen.getByTestId('trial-end-tooltip')).toBeInTheDocument()
    expect(screen.queryByText('不限工作空间成员数')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '前往我的账户' }))
    expect(onBack).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /领取免费使用期/ }))
    expect(mockStartCheckout).toHaveBeenCalledWith(SPACE_ID, '/welcome/select-safes', 'pl_business')
    expect(mockRemoveSafes).not.toHaveBeenCalled()
    expect(screen.queryByTestId('select-accounts-step')).not.toBeInTheDocument()
  })

  it('removes the Safes left out of the picked plan and then checks out', async () => {
    mockUseSpaceOffers.mockReturnValue({ trialPlans: [STARTER], trialPeriodDays: 30, isLoading: false })
    mockSpaceSafes.mockReturnValue({ safes: { '1': ['0xA', '0xB', '0xC'] } })
    render(<ClaimTrialModal spaceId={SPACE_ID} onBack={jest.fn()} returnPathname="/welcome/select-safes" />)

    fireEvent.click(screen.getByRole('button', { name: /领取免费使用期/ }))
    expect(mockStartCheckout).not.toHaveBeenCalled()
    expect(screen.getByTestId('select-accounts-step')).toHaveAttribute('data-limit', '2')
    expect(screen.getByTestId('select-accounts-step')).toHaveAttribute('data-plan', 'Starter')

    fireEvent.click(screen.getByText('step-back'))
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('开始免费使用 8379 30 天')

    fireEvent.click(screen.getByRole('button', { name: /领取免费使用期/ }))
    fireEvent.click(screen.getByText('step-continue'))

    await waitFor(() => expect(mockStartCheckout).toHaveBeenCalledWith(SPACE_ID, '/welcome/select-safes', 'pl_starter'))
    expect(mockRemoveSafes).toHaveBeenCalledWith({
      spaceId: SPACE_ID,
      deleteSpaceSafesDto: { safes: [{ chainId: '1', address: '0xB' }] },
    })
  })

  it('stays on the accounts step and shows the error when removing Safes fails', async () => {
    mockUseSpaceOffers.mockReturnValue({ trialPlans: [STARTER], trialPeriodDays: 30, isLoading: false })
    mockSpaceSafes.mockReturnValue({ safes: { '1': ['0xA', '0xB', '0xC'] } })
    mockRemoveSafes.mockResolvedValue({ error: { status: 500, data: { message: 'Boom' } } })
    mockRemoveState = { error: { status: 500, data: { message: 'Boom' } } }
    render(<ClaimTrialModal spaceId={SPACE_ID} onBack={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: /领取免费使用期/ }))
    fireEvent.click(screen.getByText('step-continue'))

    await waitFor(() => expect(mockRemoveSafes).toHaveBeenCalled())
    expect(mockStartCheckout).not.toHaveBeenCalled()
    expect(screen.getByTestId('select-accounts-step')).toHaveTextContent('Boom')
  })

  it('lets the admin pick between several trial offers and carries the pick into the accounts step', () => {
    mockUseSpaceOffers.mockReturnValue({ trialPlans: [BUSINESS, STARTER], trialPeriodDays: 60, isLoading: false })
    mockSpaceSafes.mockReturnValue({ safes: { '1': ['0xA', '0xB', '0xC'] } })
    render(<ClaimTrialModal spaceId={SPACE_ID} onBack={jest.fn()} />)

    expect(screen.getByRole('radio', { name: /Business/ })).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(screen.getByRole('radio', { name: /Starter/ }))
    fireEvent.click(screen.getByRole('button', { name: /领取免费使用期/ }))

    expect(screen.getByTestId('select-accounts-step')).toHaveAttribute('data-plan', 'Starter')
    expect(screen.getByTestId('select-accounts-step')).toHaveAttribute('data-limit', '2')
  })

  it('shows a skeleton while the offers load and an empty state without a trial', () => {
    mockUseSpaceOffers.mockReturnValue({ trialPlans: [], trialPeriodDays: null, isLoading: true })
    const { rerender } = render(<ClaimTrialModal spaceId={SPACE_ID} onBack={jest.fn()} />)
    expect(screen.getByTestId('claim-trial-skeleton')).toBeInTheDocument()

    mockUseSpaceOffers.mockReturnValue({ trialPlans: [], trialPeriodDays: null, isLoading: false })
    rerender(<ClaimTrialModal spaceId={SPACE_ID} onBack={jest.fn()} />)
    expect(screen.getByText('此工作空间没有可用的免费使用期。')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /领取免费使用期/ })).toBeDisabled()
  })

  it('surfaces a checkout failure', () => {
    mockCheckoutState = { isError: true }
    render(<ClaimTrialModal spaceId={SPACE_ID} onBack={jest.fn()} />)

    expect(screen.getByText('无法开始结账，请重试。')).toBeInTheDocument()
  })
})
