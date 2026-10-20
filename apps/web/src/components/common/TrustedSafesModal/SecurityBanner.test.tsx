import { render, screen } from '@/tests/test-utils'
import SecurityBanner from './SecurityBanner'

describe('SecurityBanner', () => {
  it('renders the optional title', () => {
    render(<SecurityBanner title="信任前请先核实" />)
    expect(screen.getByText('信任前请先核实')).toBeInTheDocument()
  })

  it('renders the impersonation warning copy with a "Learn more" link', () => {
    render(<SecurityBanner title="信任前请先核实" />)

    expect(screen.getByText(/部分 8379 账户可能存在恶意或冒充行为。请仅信任您能核实的 8379 账户。/)).toBeInTheDocument()
    expect(screen.getByText('了解更多')).toBeInTheDocument()
  })
})
