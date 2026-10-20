import { render, screen } from '@/tests/test-utils'
import SafeProPendingModal from '../index'

describe('SafeProPendingModal', () => {
  it('blocks the screen with the hero, a spinner and the wait copy, and cannot be closed', () => {
    render(<SafeProPendingModal title="正在确认订阅" body="This usually takes a few seconds." />)

    expect(screen.getByRole('heading')).toHaveTextContent('正在确认订阅')
    expect(screen.getByText('通常只需几秒钟。')).toBeInTheDocument()
    expect(screen.getByTestId('safe-pro-pending')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '关闭' })).not.toBeInTheDocument()
  })
})
