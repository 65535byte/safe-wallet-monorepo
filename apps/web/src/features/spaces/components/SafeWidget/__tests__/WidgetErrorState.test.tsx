import { render, screen } from '@/tests/test-utils'
import userEvent from '@testing-library/user-event'
import { WidgetErrorState } from '../WidgetErrorState'

describe('WidgetErrorState', () => {
  it('renders the default error message', () => {
    render(<WidgetErrorState />)

    expect(screen.getByText('无法加载内容')).toBeInTheDocument()
    expect(screen.getByText('请尝试刷新页面。')).toBeInTheDocument()
  })

  it('renders a custom error message', () => {
    render(<WidgetErrorState message="出现问题" />)

    expect(screen.getByText('出现问题')).toBeInTheDocument()
  })

  it('renders the refresh button when onRefresh is provided', () => {
    render(<WidgetErrorState onRefresh={jest.fn()} />)

    expect(screen.getByRole('button', { name: /刷新页面/i })).toBeInTheDocument()
  })

  it('does not render the refresh button when onRefresh is not provided', () => {
    render(<WidgetErrorState />)

    expect(screen.queryByRole('button', { name: /刷新页面/i })).not.toBeInTheDocument()
  })

  it('calls onRefresh when the button is clicked', async () => {
    const onRefresh = jest.fn()
    render(<WidgetErrorState onRefresh={onRefresh} />)

    await userEvent.click(screen.getByRole('button', { name: /刷新页面/i }))

    expect(onRefresh).toHaveBeenCalledTimes(1)
  })
})
