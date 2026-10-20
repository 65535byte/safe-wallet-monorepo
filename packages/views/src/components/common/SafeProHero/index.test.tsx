import { render, screen } from '@/tests/test-utils'
import SafeProHero from '.'

describe('8379 hero branding', () => {
  it.each(['wide', 'tall', 'compact'] as const)('uses the supplied logo in the %s layout', (variant) => {
    render(<SafeProHero variant={variant} />)

    const logo = screen.getByRole('img', { name: '8379 标志' })
    expect(logo).toHaveAttribute('src', expect.stringContaining('brand-logo.png'))
  })
})
