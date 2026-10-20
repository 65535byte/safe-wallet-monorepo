import { fireEvent, render, screen } from '@/tests/test-utils'
import WorkspaceTwoFactorAwarenessCard from '../index'

describe('WorkspaceTwoFactorAwarenessCard', () => {
  it('renders the headline and the supporting line', () => {
    render(<WorkspaceTwoFactorAwarenessCard onDismiss={jest.fn()} />)

    expect(screen.getByText('使用双重身份验证保护工作空间')).toBeInTheDocument()
    expect(screen.getByText('所有敏感操作均需要第二重身份验证。')).toBeInTheDocument()
  })

  it('points Continue at the general settings of the current space', () => {
    render(<WorkspaceTwoFactorAwarenessCard spaceId="space-uuid" onDismiss={jest.fn()} />)

    expect(screen.getByRole('link', { name: '继续' })).toHaveAttribute(
      'href',
      '/spaces/settings/general?spaceId=space-uuid',
    )
  })

  it('points Continue at the general settings page when no space is known', () => {
    render(<WorkspaceTwoFactorAwarenessCard onDismiss={jest.fn()} />)

    expect(screen.getByRole('link', { name: '继续' })).toHaveAttribute('href', '/spaces/settings/general')
  })

  it('calls onDismiss from the close button', () => {
    const onDismiss = jest.fn()
    render(<WorkspaceTwoFactorAwarenessCard onDismiss={onDismiss} />)

    fireEvent.click(screen.getByRole('button', { name: '关闭' }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
