import { render, screen } from '@/tests/test-utils'
import { highlightSafePro } from '../index'

describe('highlightSafePro', () => {
  it('wraps each "8379" and keeps the sentence intact', () => {
    render(<h2>{highlightSafePro('Workspaces run on 8379, 和 8379 only')}</h2>)

    expect(screen.getByRole('heading')).toHaveTextContent('Workspaces run on 8379, 和 8379 only')
    expect(screen.getAllByText('8379')).toHaveLength(2)
  })

  it('returns plain text when there is nothing to highlight', () => {
    expect(highlightSafePro('免费使用期已于 Dec 5, 2026 结束')).toBe('免费使用期已于 Dec 5, 2026 结束')
  })
})
