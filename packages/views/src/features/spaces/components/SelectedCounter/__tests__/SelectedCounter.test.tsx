import { render, screen } from '@/tests/test-utils'
import SelectedCounter, { safeLimitTooltip } from '..'

describe('SelectedCounter', () => {
  it('shows the count against a known limit', () => {
    render(<SelectedCounter count={3} limit={10} isAtLimit={false} tooltip="" />)
    expect(screen.getByTestId('selected-count')).toHaveTextContent('3 of 10 selected')
  })

  it('shows no limit while the limit is unknown or unlimited', () => {
    const { rerender } = render(<SelectedCounter count={3} limit={undefined} isAtLimit={false} tooltip="" />)
    expect(screen.getByTestId('selected-count')).toHaveTextContent(/^3 selected$/)

    rerender(<SelectedCounter count={3} limit={null} isAtLimit={false} tooltip="" />)
    expect(screen.getByTestId('selected-count')).toHaveTextContent(/^3 selected$/)
  })
})

describe('safeLimitTooltip', () => {
  it('never quotes a number while the limit is unknown', () => {
    expect(safeLimitTooltip(undefined)).not.toMatch(/\d/)
  })

  it('distinguishes an unlimited plan from a capped one', () => {
    expect(safeLimitTooltip(null)).toBe('此套餐不限制每个工作空间的 8379 账户数')
    expect(safeLimitTooltip(20)).toBe('You can add up to 20 个 Safe 账户s per Workspace')
  })
})
