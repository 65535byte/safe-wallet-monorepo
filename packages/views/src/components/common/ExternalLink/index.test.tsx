import { render, screen } from '@/tests/test-utils'
import ExternalLink from '.'

describe('ExternalLink visibility', () => {
  it.each(['https://github.com/safe-global', 'https://www.github.com/project', 'https://gist.github.com/example'])(
    'hides GitHub links and their contents: %s',
    (href) => {
      render(<ExternalLink href={href}>GitHub</ExternalLink>)
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
      expect(screen.queryByText('GitHub')).not.toBeInTheDocument()
    },
  )

  it.each(['link', 'button'] as const)('keeps non-GitHub links in %s mode', (mode) => {
    render(
      <ExternalLink href="https://example.org" mode={mode}>
        帮助
      </ExternalLink>,
    )
    expect(screen.getByRole('link', { name: '帮助' })).toHaveAttribute('href', 'https://example.org')
  })
})
