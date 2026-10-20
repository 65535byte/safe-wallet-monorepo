import { fireEvent, render, renderWithUserEvent, screen } from '@/tests/test-utils'
import { CONTACT_SALES_URL } from '@/features/spaces/constants'
import { trackEvent } from '@/services/analytics'
import { SAFE_PRO_EVENTS } from '@/services/analytics/events/safe-pro'
import PlanChooserModal, { chooserCopy, _LAPSED_DATA_NOTE } from '../PlanChooserModal'

const mockUseSpaceOffers = jest.fn()
const mockCheckout = jest.fn()
const mockNeedsTrim = jest.fn()
const mockOpenPortal = jest.fn()
let mockTrimState: Record<string, unknown> = {}

jest.mock('@/services/analytics', () => ({ ...jest.requireActual('@/services/analytics'), trackEvent: jest.fn() }))
jest.mock('../../../hooks/billing/useSpaceOffers', () => ({
  useSpaceOffers: (spaceId?: string) => mockUseSpaceOffers(spaceId),
}))
jest.mock('../../../hooks/billing/useSeatTrimCheckout', () => ({
  useSeatTrimCheckout: (spaceId: string) => ({
    seatCount: 3,
    needsTrim: (seats: number | null | undefined) => mockNeedsTrim(seats),
    checkout: (paymentLinkId: string, removed?: unknown[]) => mockCheckout(spaceId, paymentLinkId, removed),
    isBusy: false,
    error: undefined,
    ...mockTrimState,
  }),
}))
jest.mock('../../../hooks/billing/useBillingPortal', () => ({
  useBillingPortal: () => ({ openPortal: mockOpenPortal, isRedirecting: false }),
}))
jest.mock('../SelectAccountsStep', () => ({
  __esModule: true,
  default: ({
    limit,
    planName,
    onBack,
    onContinue,
  }: {
    limit: number
    planName: string
    onBack: () => void
    onContinue: (removed: Array<{ chainId: string; address: string }>) => void
  }) => (
    <div data-testid="select-accounts-step" data-limit={limit} data-plan={planName}>
      <button onClick={onBack}>step-back</button>
      <button onClick={() => onContinue([{ chainId: '1', address: '0xC' }])}>step-continue</button>
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
  trialPeriodDays: null,
})
const PLANS = [
  { name: 'Starter', offers: [offer('Starter', 'pl_starter', 2, 149)] },
  { name: 'Business', offers: [offer('Business', 'pl_business', 20, 499)] },
]
const SPACE_ID = '11111111-1111-1111-1111-111111111111'
const ENDED_AT = Date.UTC(2026, 11, 5, 12)
const LOCKED_ENTRY = { 'Entry Point': 'locked_modal' }

describe('PlanChooserModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTrimState = {}
    mockUseSpaceOffers.mockReturnValue({ paidPlans: PLANS, isLoading: false })
    mockNeedsTrim.mockImplementation((seats: number | null | undefined) => seats != null && 3 > seats)
  })

  it('reassures a lapsed Workspace about charges and data in a tooltip next to the subtitle', async () => {
    const { user } = renderWithUserEvent(
      <PlanChooserModal spaceId={SPACE_ID} reason="lapsed" endedAt={ENDED_AT} onBack={jest.fn()} />,
    )

    expect(screen.queryByText(/exportable for 90 days/)).not.toBeInTheDocument()
    await user.hover(screen.getByTestId('lapsed-data-note'))
    expect(await screen.findByText(_LAPSED_DATA_NOTE)).toBeInTheDocument()
  })

  it('keeps the data note off a failed-payment Workspace', () => {
    render(<PlanChooserModal spaceId={SPACE_ID} reason="payment-failed" endedAt={null} onBack={jest.fn()} />)

    expect(screen.queryByTestId('lapsed-data-note')).not.toBeInTheDocument()
  })

  it('words the headline by lock reason', () => {
    expect(chooserCopy('lapsed', ENDED_AT).title).toBe('您的 8379 免费使用期已于 Dec 5, 2026 结束')
    expect(chooserCopy('lapsed', null).title).toBe('工作空间没有有效套餐')
    expect(chooserCopy('payment-failed', null).title).toBe('上次付款失败')
  })

  it('offers Starter and Business, leads with Business, and points large needs to sales', () => {
    const onBack = jest.fn()
    render(<PlanChooserModal spaceId={SPACE_ID} reason="lapsed" endedAt={ENDED_AT} onBack={onBack} />)

    expect(screen.getByRole('heading', { name: '您的 8379 免费使用期已于 Dec 5, 2026 结束' })).toBeInTheDocument()
    expect(screen.getByText('选择套餐以解锁工作空间。')).toBeInTheDocument()
    expect(screen.queryByText('Enterprise')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument()
    expect(screen.getByText('需要超过 20？')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /联系销售/ })).toHaveAttribute('href', CONTACT_SALES_URL)

    fireEvent.click(screen.getByRole('button', { name: '返回我的账户' }))
    expect(onBack).toHaveBeenCalled()
    expect(trackEvent).toHaveBeenCalledWith(SAFE_PRO_EVENTS.WORKSPACE_LOCKED_VIEWED, undefined)
  })

  it('goes straight to Stripe when the picked plan covers the Workspace', () => {
    render(<PlanChooserModal spaceId={SPACE_ID} reason="lapsed" endedAt={ENDED_AT} onBack={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '继续使用 Business' }))
    expect(trackEvent).toHaveBeenCalledWith(SAFE_PRO_EVENTS.PLAN_SELECTION_STARTED, LOCKED_ENTRY)
    expect(trackEvent).toHaveBeenCalledWith(
      SAFE_PRO_EVENTS.PLAN_CTA_CLICKED,
      expect.objectContaining({ Location: 'locked_modal' }),
    )
    expect(mockCheckout).toHaveBeenCalledWith(SPACE_ID, 'pl_business', undefined)
    expect(screen.queryByTestId('select-accounts-step')).not.toBeInTheDocument()
  })

  it('asks which Safes stay when the picked plan covers fewer than the Workspace holds', () => {
    render(<PlanChooserModal spaceId={SPACE_ID} reason="lapsed" endedAt={ENDED_AT} onBack={jest.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: '切换至 Starter' }))
    expect(mockCheckout).not.toHaveBeenCalled()
    expect(screen.getByTestId('select-accounts-step')).toHaveAttribute('data-limit', '2')
    expect(screen.getByTestId('select-accounts-step')).toHaveAttribute('data-plan', 'Starter')
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument()

    fireEvent.click(screen.getByText('step-back'))
    expect(screen.getByRole('heading', { name: '您的 8379 免费使用期已于 Dec 5, 2026 结束' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '切换至 Starter' }))
    fireEvent.click(screen.getByText('step-continue'))
    expect(mockCheckout).toHaveBeenCalledWith(SPACE_ID, 'pl_starter', [{ chainId: '1', address: '0xC' }])
  })

  it('sends a failed payment to the billing portal instead of the catalog', () => {
    render(<PlanChooserModal spaceId={SPACE_ID} reason="payment-failed" endedAt={null} onBack={jest.fn()} />)

    expect(screen.queryByRole('button', { name: '继续使用 Business' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /更新账单信息/ }))
    expect(mockOpenPortal).toHaveBeenCalled()
    expect(trackEvent).toHaveBeenCalledWith(SAFE_PRO_EVENTS.PLAN_SELECTION_STARTED, LOCKED_ENTRY)
  })

  it('shows a skeleton while loading, an empty state without plans and a checkout error', () => {
    mockUseSpaceOffers.mockReturnValue({ paidPlans: [], isLoading: true })
    const { rerender } = render(
      <PlanChooserModal spaceId={SPACE_ID} reason="lapsed" endedAt={null} onBack={jest.fn()} />,
    )
    expect(screen.getByTestId('plan-chooser-skeleton')).toBeInTheDocument()

    mockUseSpaceOffers.mockReturnValue({ paidPlans: [], isLoading: false })
    mockTrimState = { error: '无法开始结账，请重试。' }
    rerender(<PlanChooserModal spaceId={SPACE_ID} reason="lapsed" endedAt={null} onBack={jest.fn()} />)
    expect(screen.getByText('此工作空间目前没有可用套餐。')).toBeInTheDocument()
    expect(screen.getByText('无法开始结账，请重试。')).toBeInTheDocument()
  })
})
