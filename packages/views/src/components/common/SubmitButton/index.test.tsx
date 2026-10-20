import { render, screen } from '@testing-library/react'
import SubmitButton from '.'

describe('SubmitButton', () => {
  it('renders its label as a submit-typed button', () => {
    render(<SubmitButton>Save</SubmitButton>)

    const button = screen.getByRole('button', { name: '保存' })
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('forwards the disabled prop', () => {
    render(<SubmitButton disabled>Save</SubmitButton>)

    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled()
  })

  it('swaps the label for a spinner and disables the button while loading', () => {
    render(<SubmitButton loading>Save</SubmitButton>)

    expect(screen.queryByText('保存')).not.toBeInTheDocument()
    expect(screen.getByRole('status', { name: '加载中' })).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
