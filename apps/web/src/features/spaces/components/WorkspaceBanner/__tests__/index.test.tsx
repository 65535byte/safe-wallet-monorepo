import { render, screen } from '@/tests/test-utils'
import WorkspaceBanner from '../index'

describe('WorkspaceBanner', () => {
  it('renders the headline and the New tag', () => {
    render(<WorkspaceBanner />)

    expect(screen.getByText('工作空间介绍')).toBeInTheDocument()
    expect(screen.getByText('新建')).toBeInTheDocument()
  })

  it('links the CTA to the announcement blog post in a safe new tab', () => {
    render(<WorkspaceBanner />)

    const cta = screen.getByRole('link', { name: '阅读工作空间公告' })
    expect(cta).toHaveAttribute(
      'href',
      'https://safe.global/blog/introducing-workspace-the-onchain-operating-environment-for-treasury-teams',
    )
    expect(cta).toHaveAttribute('target', '_blank')
    expect(cta).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('forwards a custom className to the card', () => {
    const { container } = render(<WorkspaceBanner className="custom-class" />)

    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})
