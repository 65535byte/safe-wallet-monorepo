import { render, screen } from '@testing-library/react'
import DialogActions from '.'

describe('DialogActions', () => {
  it('renders a confirm-only footer when no onCancel is given', () => {
    render(<DialogActions confirmLabel="Confirm" />)

    expect(screen.getByRole('button', { name: '确认' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '取消' })).not.toBeInTheDocument()
  })

  it('forwards test ids and the disabled state', () => {
    render(
      <DialogActions
        confirmLabel="Confirm"
        confirmTestId="confirm"
        confirmDisabled
        onCancel={jest.fn()}
        cancelTestId="cancel"
      />,
    )

    expect(screen.getByTestId('confirm')).toBeDisabled()
    expect(screen.getByTestId('cancel')).not.toBeDisabled()
  })

  it('swaps the confirm label for a spinner and disables both buttons while loading', () => {
    render(<DialogActions confirmLabel="Confirm" confirmLoading onCancel={jest.fn()} />)

    expect(screen.queryByText('确认')).not.toBeInTheDocument()
    expect(screen.getByRole('status', { name: '加载中' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
  })
})
