import { fireEvent, render, screen } from '@/tests/test-utils'
import SafeProNoticeModal from '../index'

describe('SafeProNoticeModal', () => {
  it('explains the lock without a close button and leads to My accounts', () => {
    const onAction = jest.fn()
    render(
      <SafeProNoticeModal
        open
        title="免费使用期已于 Dec 5, 2026 结束"
        body="An admin needs to choose a plan to unlock it."
        onAction={onAction}
      />,
    )

    expect(screen.getByRole('heading')).toHaveTextContent('免费使用期已于 Dec 5, 2026 结束')
    expect(screen.getByText('An admin needs to choose a plan to unlock it.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '前往我的账户' }))
    expect(onAction).toHaveBeenCalled()
  })

  it('becomes a dismissible notice with its own action label when given onOpenChange', () => {
    const onOpenChange = jest.fn()
    const onAction = jest.fn()
    render(
      <SafeProNoticeModal
        open
        title="Your free access will end in 7 days"
        body="Acme Inc will be locked on Dec 5, 2026."
        actionLabel="Got it"
        onAction={onAction}
        onOpenChange={onOpenChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '知道了' }))
    expect(onAction).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: '关闭' }))
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything())
  })

  it('offers a second action when given one', () => {
    const onSecondaryAction = jest.fn()
    render(
      <SafeProNoticeModal
        open
        title="Taking longer than expected"
        body="Try again in a moment."
        actionLabel="Close"
        onAction={jest.fn()}
        secondaryActionLabel="Try again"
        onSecondaryAction={onSecondaryAction}
        onOpenChange={jest.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '重试' }))
    expect(onSecondaryAction).toHaveBeenCalled()
  })

  it('renders a second action with a destination as a link', () => {
    render(
      <SafeProNoticeModal
        open
        title="免费使用期已于 Dec 5, 2026 结束"
        body="An admin needs to choose a plan to unlock it."
        onAction={jest.fn()}
        secondaryActionLabel="Create new Workspace"
        secondaryActionHref="/welcome/spaces"
      />,
    )

    expect(screen.getByRole('link', { name: '创建工作空间' })).toHaveAttribute('href', '/welcome/spaces')
  })
})
