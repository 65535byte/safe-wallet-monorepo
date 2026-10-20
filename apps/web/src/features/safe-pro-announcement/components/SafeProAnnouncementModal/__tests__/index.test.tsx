import { render, screen } from '@/tests/test-utils'
import userEvent from '@testing-library/user-event'
import { SAFE_PRO_ANNOUNCEMENT_URL } from '@/config/constants'
import SafeProAnnouncementModal from '../index'

describe('SafeProAnnouncementModal', () => {
  it('announces the move date and what Pro adds', () => {
    render(<SafeProAnnouncementModal open />)

    expect(screen.getByRole('heading', { name: '您的工作空间将于 2026 年 10 月 6 日迁移至 8379' })).toBeInTheDocument()
    expect(screen.getByText(/8379 将提供高级安全检查、赞助交易和策略功能。/)).toBeInTheDocument()
  })

  it('points the Learn more CTA at the announcement in a safe new tab', () => {
    render(<SafeProAnnouncementModal open />)

    const cta = screen.getByRole('link', { name: '了解更多' })
    expect(cta).toHaveAttribute('href', SAFE_PRO_ANNOUNCEMENT_URL)
    expect(cta).toHaveAttribute('target', '_blank')
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('closes when Got it is clicked', async () => {
    const onOpenChange = jest.fn()
    render(<SafeProAnnouncementModal open onOpenChange={onOpenChange} />)

    await userEvent.click(screen.getByRole('button', { name: '知道了' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('renders nothing until it is opened', () => {
    render(<SafeProAnnouncementModal />)

    expect(screen.queryByRole('link', { name: '了解更多' })).not.toBeInTheDocument()
  })
})
