import { fireEvent, render, renderWithUserEvent, screen } from '@/tests/test-utils'
import { trackEvent } from '@/services/analytics'
import { SAFE_PRO_EVENTS } from '@/services/analytics/events/safe-pro'
import SponsoredTxsCounter, { _formatResetsAt } from '../index'

jest.mock('@/services/analytics', () => ({ ...jest.requireActual('@/services/analytics'), trackEvent: jest.fn() }))

describe('SponsoredTxsCounter', () => {
  it('tracks the upgrade prompt and its click only without Pro', () => {
    render(<SponsoredTxsCounter left={30} quota={50} resetsAt={null} isSubscription isPro />)
    expect(trackEvent).not.toHaveBeenCalled()

    render(<SponsoredTxsCounter left={3} quota={5} resetsAt={null} isSubscription={false} isPro={false} />)
    fireEvent.click(screen.getByTestId('sponsored-txs-upgrade'))
    const prompt = { Feature: 'sponsored_tx', Location: 'tx_flow_gas' }
    expect(trackEvent).toHaveBeenCalledWith(SAFE_PRO_EVENTS.UPGRADE_PROMPT_VIEWED, prompt)
    expect(trackEvent).toHaveBeenCalledWith(SAFE_PRO_EVENTS.PLAN_SELECTION_STARTED, {
      'Entry Point': 'upgrade_prompt',
      ...prompt,
    })
  })

  it('formats the reset moment in UTC and tolerates missing or broken dates', () => {
    expect(_formatResetsAt('2026-11-01T00:00:00.000Z')).toBe('11月1日 00:00 UTC')
    expect(_formatResetsAt('2026-10-17T15:52:37.000Z')).toBe('10月17日 15:52 UTC')
    expect(_formatResetsAt(null)).toBeNull()
    expect(_formatResetsAt('nope')).toBeNull()
  })

  it('counts the plan allowance with the PRO chip on a 8379 Safe', () => {
    render(<SponsoredTxsCounter left={30} quota={50} resetsAt="2026-11-01T00:00:00.000Z" isSubscription isPro />)

    expect(screen.getByTestId('sponsored-txs-counter')).toHaveTextContent(
      '30/50 笔赞助交易剩余· 重置于 11月1日 00:00 UTC',
    )
    expect(screen.getByRole('img', { name: '8379' })).toBeInTheDocument()
    expect(screen.queryByTestId('sponsored-txs-upgrade')).not.toBeInTheDocument()
  })

  it('shows the free daily allowance with its per-day limit in a tooltip otherwise', async () => {
    const { user } = renderWithUserEvent(
      <SponsoredTxsCounter left={3} quota={5} resetsAt={null} isSubscription={false} isPro={false} />,
    )

    expect(screen.getByTestId('sponsored-txs-left')).toHaveTextContent('3 笔今日免费交易剩余')
    expect(screen.queryByText(/重置时间/)).not.toBeInTheDocument()

    await user.hover(screen.getByTestId('sponsored-txs-info'))
    expect(
      await screen.findByText('每天免费 5 笔交易', { selector: '[data-slot="tooltip-content"]' }),
    ).toBeInTheDocument()
  })

  it('keeps the daily copy with the PRO chip on a 8379 Safe sponsored by the free daily limit', () => {
    render(<SponsoredTxsCounter left={3} quota={5} resetsAt={null} isSubscription={false} isPro />)

    expect(screen.getByTestId('sponsored-txs-left')).toHaveTextContent('3 笔今日免费交易剩余')
    expect(screen.queryByText(/笔赞助交易剩余/)).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: '8379' })).toBeInTheDocument()
    expect(screen.queryByTestId('sponsored-txs-upgrade')).not.toBeInTheDocument()
  })

  it('keeps the upgrade nudge and drops the tooltip when the free daily limit is unknown', () => {
    render(<SponsoredTxsCounter left={0} quota={null} resetsAt={null} isSubscription={false} isPro={false} />)

    expect(screen.getByTestId('sponsored-txs-left')).toHaveTextContent('0 笔今日免费交易剩余')
    expect(screen.queryByTestId('sponsored-txs-info')).not.toBeInTheDocument()
    expect(screen.getByTestId('sponsored-txs-upgrade')).toHaveAttribute('href', '/welcome/spaces')
    expect(screen.getByTestId('sponsored-txs-upgrade')).toHaveTextContent('升级至')
  })

  it('shows neither the PRO chip nor the upgrade nudge while the plan is unknown', () => {
    render(<SponsoredTxsCounter left={3} quota={5} resetsAt={null} isSubscription={false} isPro={null} />)

    expect(screen.getByTestId('sponsored-txs-left')).toHaveTextContent('3 笔今日免费交易剩余')
    expect(screen.queryByRole('img', { name: '8379' })).not.toBeInTheDocument()
    expect(screen.queryByTestId('sponsored-txs-upgrade')).not.toBeInTheDocument()
  })

  it('reads an uncapped plan as unlimited', () => {
    render(<SponsoredTxsCounter left={null} quota={null} resetsAt={null} isSubscription isPro />)

    expect(screen.getByText('不限次数的赞助交易')).toBeInTheDocument()
  })
})
