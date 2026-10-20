import { render, screen } from '@testing-library/react'
import TxStatusChip from './index'

describe('TxStatusChip', () => {
  it('renders a successful status as a success Badge', () => {
    render(<TxStatusChip color="success">Executed</TxStatusChip>)

    const badge = screen.getByText('已执行')
    expect(badge).toHaveAttribute('data-slot', 'badge')
    expect(badge).toHaveAttribute('data-variant', 'success')
  })

  it('renders a failed status as a destructive Badge', () => {
    render(<TxStatusChip color="error">Failed</TxStatusChip>)

    const badge = screen.getByText('失败')
    expect(badge).toHaveAttribute('data-slot', 'badge')
    expect(badge).toHaveAttribute('data-variant', 'destructive')
  })

  it('renders a pending status as a warning Badge', () => {
    render(<TxStatusChip color="warning">Pending</TxStatusChip>)

    const badge = screen.getByText('待处理')
    expect(badge).toHaveAttribute('data-slot', 'badge')
    expect(badge).toHaveAttribute('data-variant', 'warning')
  })

  it('defaults to the primary Badge variant', () => {
    render(<TxStatusChip>Processing</TxStatusChip>)

    const badge = screen.getByText('处理中')
    expect(badge).toHaveAttribute('data-variant', 'default')
  })
})
