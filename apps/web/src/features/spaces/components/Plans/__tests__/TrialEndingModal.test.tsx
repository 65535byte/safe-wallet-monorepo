import { fireEvent, render, screen } from '@/tests/test-utils'
import { CONTACT_SALES_URL } from '@/features/spaces/constants'
import TrialEndingModal, { _endsIn } from '../TrialEndingModal'
import { trackEvent } from '@/services/analytics'
import { SAFE_PRO_EVENTS } from '@/services/analytics/events/safe-pro'

jest.mock('@/services/analytics', () => ({ ...jest.requireActual('@/services/analytics'), trackEvent: jest.fn() }))

const mockUseSpacePlan = jest.fn()
const mockUseSpaceOffers = jest.fn()
const mockUseIsAdmin = jest.fn()
const mockOpenPortal = jest.fn()
const storage: Record<string, string> = {}

jest.mock('../../../hooks/useSpacePlan', () => ({ useSpacePlan: (spaceId?: string) => mockUseSpacePlan(spaceId) }))
jest.mock('../../../hooks/billing/useSpaceOffers', () => ({
  useSpaceOffers: (spaceId?: string) => mockUseSpaceOffers(spaceId),
}))
jest.mock('../../../hooks/billing/useBillingPortal', () => ({
  useBillingPortal: () => ({ openPortal: mockOpenPortal, isRedirecting: false }),
}))
jest.mock('../../../hooks/useSpaceMembers', () => ({
  useCurrentMembership: () => ({ id: 1 }),
  useIsAdmin: (spaceId?: string) => mockUseIsAdmin(spaceId),
}))
jest.mock('@safe-global/store/gateway/AUTO_GENERATED/spaces', () => ({
  useSpacesGetOneV1Query: () => ({ currentData: { name: 'Acme Inc' } }),
}))
jest.mock('@/services/local-storage/session', () => ({
  __esModule: true,
  ...jest.requireActual('@/services/local-storage/session'),
  sessionItem: (key: string) => ({
    get: () => (storage[key] ? JSON.parse(storage[key]) : undefined),
    set: (value: unknown) => {
      storage[key] = JSON.stringify(value)
    },
    remove: () => {
      delete storage[key]
    },
  }),
}))
jest.mock('@safe-global/views/features/spaces/components/SafeProModals', () => ({
  SafeProNoticeModal: ({
    title,
    body,
    actionLabel,
    onAction,
  }: {
    title: string
    body: string
    actionLabel: string
    onAction: () => void
  }) => (
    <div data-testid="notice-modal">
      <h2>{title}</h2>
      <p>{body}</p>
      <button onClick={onAction}>{actionLabel}</button>
    </div>
  ),
}))
jest.mock('../ChangePlanFlow', () => ({
  __esModule: true,
  default: ({
    pick,
    currentPlan,
    entry,
    onClose,
    onChanged,
  }: {
    pick: { tier: { name: string } }
    currentPlan: { isTrialing: boolean }
    entry: Record<string, unknown>
    onClose: () => void
    onChanged?: () => void
  }) => (
    <div
      data-testid="change-plan-dialog"
      data-to={pick.tier.name}
      data-trial={String(currentPlan.isTrialing)}
      data-entry={JSON.stringify(entry)}
    >
      <button onClick={onChanged}>plan-changed</button>
      <button onClick={onClose}>flow-closed</button>
    </div>
  ),
}))

const SPACE_ID = '11111111-1111-1111-1111-111111111111'
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
const STARTER = { name: 'Starter', offers: [offer('Starter', 'pl_starter', 2, 149)] }
const subscription = {
  id: 'sub_1',
  status: 'trialing',
  plan: {
    id: 'price_business',
    name: 'Business',
    currentPrice: 499,
    originalPrice: null,
    currency: 'eur',
    billingCycle: 'month',
    features: [],
  },
}

const trial = (daysLeft: number, isTrialEndingSoon = daysLeft <= 7) => ({
  plan: { name: 'Business', status: 'trialing', periodEndsAt: '2026-12-05T00:00:00Z', daysLeft },
  seats: { used: 6, quota: 20 },
  subscription,
  status: 'trialing',
  isTrialing: true,
  isTrialEndingSoon,
  isLoading: false,
})

describe('TrialEndingModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    for (const key of Object.keys(storage)) delete storage[key]
    mockUseSpacePlan.mockReturnValue(trial(7))
    mockUseSpaceOffers.mockReturnValue({ paidPlans: [STARTER], isLoading: false })
    mockUseIsAdmin.mockReturnValue(true)
  })

  it('words the countdown', () => {
    expect(_endsIn(7)).toBe('7 天后')
    expect(_endsIn(1)).toBe('1 天后')
    expect(_endsIn(0)).toBe('今天')
  })

  it('stays dismissed for the rest of the trial once the last-week reminder was closed', () => {
    const { unmount } = render(<TrialEndingModal spaceId={SPACE_ID} />)
    fireEvent.click(screen.getByRole('button', { name: '不使用 8379，继续' }))
    expect(storage.safeProTrialReminderSeen).toBe(JSON.stringify({ [SPACE_ID]: true }))
    unmount()

    for (const daysLeft of [5, 2, 1]) {
      mockUseSpacePlan.mockReturnValue(trial(daysLeft))
      const { container, unmount: unmountAgain } = render(<TrialEndingModal spaceId={SPACE_ID} />)
      expect(container).toBeEmptyDOMElement()
      unmountAgain()
    }
  })

  it('stays quiet when a payment method is already on file', () => {
    mockUseSpacePlan.mockReturnValue({ ...trial(7), hasPaymentMethod: true })
    render(<TrialEndingModal spaceId={SPACE_ID} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('stays quiet while the trial has more than a week left', () => {
    mockUseSpacePlan.mockReturnValue(trial(14))

    expect(render(<TrialEndingModal spaceId={SPACE_ID} />).container).toBeEmptyDOMElement()
  })

  it('lets an admin add billing details, switch to Starter or continue without 8379, once per Workspace', () => {
    const { unmount } = render(<TrialEndingModal spaceId={SPACE_ID} />)

    expect(screen.getByRole('heading', { name: '您的免费使用期将于 7 天后结束' })).toBeInTheDocument()
    expect(screen.getByText(/如果 Dec 5, 2026 前未选择套餐并添加付款方式，工作空间将被锁定/)).toBeInTheDocument()
    expect(screen.getByTestId('trial-reminder-tooltip')).toBeInTheDocument()
    expect(screen.queryByText('Enterprise')).not.toBeInTheDocument()
    expect(screen.getByText('需要超过 20？')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /联系销售/ })).toHaveAttribute('href', CONTACT_SALES_URL)

    expect(trackEvent).toHaveBeenCalledWith(SAFE_PRO_EVENTS.FREE_ACCESS_REMINDER_VIEWED, {
      Location: 'reminder_modal',
      'Free Access Days Left': 7,
    })

    fireEvent.click(screen.getByRole('button', { name: '添加付款方式' }))
    expect(mockOpenPortal).toHaveBeenCalled()
    expect(trackEvent).toHaveBeenCalledWith(SAFE_PRO_EVENTS.PLAN_SELECTION_STARTED, { 'Entry Point': 'reminder_modal' })

    fireEvent.click(screen.getByRole('button', { name: '切换至 Starter' }))
    expect(screen.getByTestId('change-plan-dialog')).toHaveAttribute('data-to', 'Starter')
    expect(screen.getByTestId('change-plan-dialog')).toHaveAttribute('data-trial', 'true')
    expect(screen.getByTestId('change-plan-dialog')).toHaveAttribute(
      'data-entry',
      JSON.stringify({ 'Entry Point': 'reminder_modal' }),
    )

    fireEvent.click(screen.getByRole('button', { name: '不使用 8379，继续' }))
    expect(screen.queryByRole('heading', { name: '您的免费使用期将于 7 天后结束' })).not.toBeInTheDocument()
    unmount()

    expect(render(<TrialEndingModal spaceId={SPACE_ID} />).container).toBeEmptyDOMElement()
  })

  it('closes the reminder for good once the plan changed', () => {
    render(<TrialEndingModal spaceId={SPACE_ID} />)

    fireEvent.click(screen.getByRole('button', { name: '切换至 Starter' }))
    fireEvent.click(screen.getByText('plan-changed'))

    expect(screen.queryByRole('heading', { name: '您的免费使用期将于 7 天后结束' })).not.toBeInTheDocument()
    expect(screen.getByTestId('change-plan-dialog')).toBeInTheDocument()
    expect(storage.safeProTrialReminderSeen).toBeUndefined()

    fireEvent.click(screen.getByText('flow-closed'))

    expect(screen.queryByTestId('change-plan-dialog')).not.toBeInTheDocument()
    expect(storage.safeProTrialReminderSeen).toBe(JSON.stringify({ [SPACE_ID]: true }))
  })

  it('shows a member the same plans without buttons, naming the Workspace and who can act', () => {
    mockUseIsAdmin.mockReturnValue(false)
    render(<TrialEndingModal spaceId={SPACE_ID} />)

    expect(screen.getByRole('heading', { name: '您的免费使用期将于 7 天后结束' })).toBeInTheDocument()
    expect(
      screen.getByText(
        /Acme Inc 将于 Dec 5, 2026 锁定，除非管理员选择套餐并添加付款方式。\s8379 账户仍可在“我的账户”中使用。/,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '切换至 Starter' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '添加付款方式' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '不使用 8379，继续' })).not.toBeInTheDocument()
    expect(screen.queryByTestId('trial-reminder-tooltip')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '知道了' }))
    expect(screen.queryByRole('heading', { name: '您的免费使用期将于 7 天后结束' })).not.toBeInTheDocument()
    expect(storage.safeProTrialReminderSeen).toBe(JSON.stringify({ [SPACE_ID]: true }))
  })
})
