import { render, screen } from '@/tests/test-utils'
import { WidgetEmptyState } from '../WidgetEmptyState'

describe('WidgetEmptyState', () => {
  it('renders the icon and text', () => {
    render(<WidgetEmptyState icon={<span data-testid="test-icon" />} text="No items found" />)

    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
    expect(screen.getByText('No items found')).toBeInTheDocument()
  })

  it('renders the action when provided', () => {
    render(<WidgetEmptyState icon={<span />} text="Empty" action={<button>Do something</button>} />)

    expect(screen.getByRole('button', { name: 'Do something' })).toBeInTheDocument()
  })

  it('does not render an action when not provided', () => {
    render(<WidgetEmptyState icon={<span />} text="Empty" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders the subtitle when provided', () => {
    render(<WidgetEmptyState icon={<span />} text="错误 occurred" subtitle="Please try again." />)

    expect(screen.getByText('错误 occurred')).toBeInTheDocument()
    expect(screen.getByText('请重试。')).toBeInTheDocument()
  })

  it('does not render the subtitle when not provided', () => {
    render(<WidgetEmptyState icon={<span />} text="No items found" />)

    expect(screen.getByText('No items found')).toBeInTheDocument()
    expect(screen.queryByText('请重试。')).not.toBeInTheDocument()
  })

  it('applies custom icon container className', () => {
    const { container } = render(
      <WidgetEmptyState icon={<span data-testid="icon" />} text="Empty" iconContainerClassName="bg-accent" />,
    )

    const iconContainer = container.querySelector('[data-testid="icon"]')?.parentElement
    expect(iconContainer?.className).toContain('bg-accent')
  })
})
