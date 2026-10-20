import { render, screen } from '@testing-library/react'
import StatusCell from './StatusCell'

describe('StatusCell', () => {
  describe('null grade', () => {
    it('renders a skeleton when scanning', () => {
      const { container } = render(<StatusCell grade={null} isScanning />)
      expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument()
    })

    it('renders a dash when not scanning', () => {
      render(<StatusCell grade={null} />)
      expect(screen.getByText('—')).toBeInTheDocument()
    })
  })

  describe('passing grade', () => {
    it('renders a bare "Healthy" chip with the matching aria-label', () => {
      render(<StatusCell grade="passing" count={0} />)
      const chip = screen.getByLabelText('安全状况良好')
      expect(chip).toHaveTextContent('安全状况良好')
      expect(chip).not.toHaveTextContent(/0 issues/)
    })
  })

  describe('non-passing grades', () => {
    it.each([
      ['critical', 4, '发现 Critical · 4 个问题'],
      ['at_risk', 3, '发现 At risk · 3 个问题'],
      ['needs_attention', 2, '发现 Needs review · 2 个问题'],
    ] as const)('renders "%s · %s" with the count + label (count > 1)', (grade, count, expected) => {
      render(<StatusCell grade={grade} count={count} />)
      expect(screen.getByText(expected)).toBeInTheDocument()
      expect(screen.getByLabelText(expected)).toBeInTheDocument()
    })

    it('singularises the label when count is 1 ("1 issue found")', () => {
      render(<StatusCell grade="at_risk" count={1} />)
      expect(screen.getByText('发现 At risk · 1 个问题')).toBeInTheDocument()
    })

    it('falls back to the Healthy chip if count is 0 even with a non-passing grade (defensive) and warns in dev', () => {
      // Should never happen in production (computeSummary and getSafeGrade agree), but the
      // guard prevents a nonsense "At risk · 0 issues found" reading if they ever desync.
      // The dev-only console.warn surfaces the underlying bug instead of silently degrading.
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
      render(<StatusCell grade="at_risk" count={0} />)
      expect(screen.getByLabelText('安全状况良好')).toBeInTheDocument()
      expect(screen.queryByText(/存在风险/)).not.toBeInTheDocument()
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('grade=at_risk but count=0'))
      warn.mockRestore()
    })
  })
})
