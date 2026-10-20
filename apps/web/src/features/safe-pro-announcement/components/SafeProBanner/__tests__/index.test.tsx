import { fireEvent, render, screen } from '@/tests/test-utils'
import { trackEvent, trackMixpanelEvent, MixpanelEvent } from '@/services/analytics'
import { SAFE_PRO_EVENTS } from '@/services/analytics/events/safe-pro'
import { SAFE_PRO_ANNOUNCEMENT_URL } from '@/config/constants'
import SafeProBanner from '../index'

jest.mock('@/services/analytics', () => ({
  ...jest.requireActual('@/services/analytics'),
  trackEvent: jest.fn(),
  trackMixpanelEvent: jest.fn(),
}))

let mockIsLive = false
jest.mock('@/hooks/useIsSafeProEnabled', () => ({ useIsSafeProEnabled: () => mockIsLive }))

describe('SafeProBanner', () => {
  beforeEach(() => {
    mockIsLive = false
  })

  it('tracks viewed on mount and clicked, with the location it is given', () => {
    render(<SafeProBanner location="my_accounts" />)
    fireEvent.click(screen.getByRole('link'))
    expect(trackEvent).toHaveBeenCalledWith(SAFE_PRO_EVENTS.SAFE_PRO_BANNER_VIEWED, { Location: 'my_accounts' })
    expect(trackMixpanelEvent).toHaveBeenCalledWith(MixpanelEvent.SAFE_PRO_BANNER_CLICKED, {
      Location: 'my_accounts',
      'Destination URL': SAFE_PRO_ANNOUNCEMENT_URL,
    })
  })

  it('speaks in the past once 8379 is live', () => {
    mockIsLive = true
    render(<SafeProBanner />)

    expect(screen.getByText('工作空间已于 2026 年 10 月 6 日迁移至 8379')).toBeInTheDocument()
  })

  it('renders the headline and the New tag', () => {
    render(<SafeProBanner />)

    expect(screen.getByText('工作空间将于 2026 年 10 月 6 日迁移至 8379')).toBeInTheDocument()
    expect(screen.getByText('新建')).toBeInTheDocument()
  })

  it('makes the whole banner one link to the announcement in a safe new tab', () => {
    render(<SafeProBanner />)

    const cta = screen.getByRole('link', { name: /工作空间将于 2026 年 10 月 6 日迁移至 8379/ })
    expect(cta).toHaveAttribute('href', SAFE_PRO_ANNOUNCEMENT_URL)
    expect(cta).toHaveAttribute('target', '_blank')
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })
})
