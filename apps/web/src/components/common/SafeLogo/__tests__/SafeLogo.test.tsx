import { render, screen } from '@/tests/test-utils'
import SafeLogo from '../index'
import { AppRoutes } from '@/config/routes'

jest.mock('@/public/images/safe-pro/pro-chip.svg', () => 'svg')

jest.mock('next/link', () => {
  const MockLink = ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
  MockLink.displayName = 'Link'
  return { __esModule: true, default: MockLink }
})

describe('SafeLogo', () => {
  it('renders a link to /welcome/spaces by default', () => {
    render(<SafeLogo />)
    expect(screen.getByRole('link')).toHaveAttribute('href', AppRoutes.welcome.spaces)
  })

  it('renders a link to the provided href', () => {
    render(<SafeLogo href="/welcome" />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/welcome')
  })

  it('renders the Safe logo image with alt text and testid', () => {
    render(<SafeLogo />)
    const img = screen.getByTestId('logo-image')
    expect(img).toHaveAttribute('alt', '品牌标志')
    expect(img).toHaveAttribute('src', '/images/brand-logo.png')
    expect(img).not.toHaveClass('dark:hidden')
  })

  it('renders the Home label pill variant with the logo', () => {
    render(<SafeLogo href={AppRoutes.welcome.accounts} showHomeLabel />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', AppRoutes.welcome.accounts)
    expect(link).toHaveTextContent('首页')
    expect(screen.getByTestId('logo-image')).toBeInTheDocument()
  })

  it('renders the logo with the PRO chip in the pill for Workspaces on a plan', () => {
    render(<SafeLogo showHomeLabel showProLockup />)
    expect(screen.getByRole('img', { name: '8379' })).toBeInTheDocument()
    expect(screen.getByTestId('logo-image')).toBeInTheDocument()
    expect(screen.getByRole('link')).not.toHaveTextContent('首页')
  })
})
