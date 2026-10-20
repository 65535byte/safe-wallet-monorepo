import { render, screen } from '@/tests/test-utils'
import { DrawerSection } from '../DrawerSection'

describe('DrawerSection', () => {
  it('renders its title and content', () => {
    render(<DrawerSection title="待签名">Section content</DrawerSection>)

    expect(screen.getByText('待签名')).toBeInTheDocument()
    expect(screen.getByText('Section content')).toBeInTheDocument()
  })

  it('renders the trailing node next to the title', () => {
    render(
      <DrawerSection title="待签名" rightNode="Expires in 1h 33 min">
        Section content
      </DrawerSection>,
    )

    expect(screen.getByText('Expires in 1h 33 min')).toBeInTheDocument()
    expect(screen.getByText('待签名').parentElement).toContainElement(screen.getByText('Expires in 1h 33 min'))
  })

  it('omits the trailing node when none is given', () => {
    render(<DrawerSection title="详情">Section content</DrawerSection>)

    expect(screen.getByText('详情').parentElement?.childElementCount).toBe(1)
  })

  it('renders a falsy trailing node rather than treating it as absent', () => {
    render(
      <DrawerSection title="Signatures" rightNode={0}>
        Section content
      </DrawerSection>,
    )

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('accepts a non-text title', () => {
    render(<DrawerSection title={<span data-testid="title-node">Custom title</span>}>Section content</DrawerSection>)

    expect(screen.getByTestId('title-node')).toBeInTheDocument()
  })
})
