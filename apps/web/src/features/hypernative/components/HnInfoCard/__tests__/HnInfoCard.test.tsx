import { render, screen } from '@/tests/test-utils'
import { hypernativeAuthStatusBuilder } from '@/tests/builders/hypernativeAuthStatus'
import { HnInfoCard } from '../index'

jest.mock('../../HypernativeTooltip', () => ({
  HypernativeTooltip: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div title={title}>{children}</div>
  ),
}))

describe('HnInfoCard', () => {
  it('renders nothing without Hypernative auth', () => {
    const { container } = render(<HnInfoCard />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when the active status is hidden', () => {
    const { container } = render(
      <HnInfoCard hypernativeAuth={hypernativeAuthStatusBuilder().build()} showActiveStatus={false} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('shows that Hypernative Guardian is active', () => {
    render(<HnInfoCard hypernativeAuth={hypernativeAuthStatusBuilder().build()} />)

    expect(screen.getByText('Hypernative Guardian 已启用')).toBeInTheDocument()
    expect(screen.getByTitle('Hypernative Guardian 正在监控此交易。')).toBeInTheDocument()
  })

  it.each([
    ['logged out', hypernativeAuthStatusBuilder().build()],
    ['token expired', hypernativeAuthStatusBuilder().with({ isAuthenticated: true, isTokenExpired: true }).build()],
  ])('never offers a login when %s', (_, hypernativeAuth) => {
    render(<HnInfoCard hypernativeAuth={hypernativeAuth} />)

    expect(screen.queryByRole('button', { name: '登录' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Log in to Hypernative/)).not.toBeInTheDocument()
  })
})
