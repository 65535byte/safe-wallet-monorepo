import { fireEvent } from '@testing-library/react'
import { render, screen } from '@/tests/test-utils'
import SecurityDrawerContent from './SecurityDrawerContent'

const renderContent = () =>
  render(<SecurityDrawerContent scanContext={null} results={{}} isComplete={false} lastScannedAt={null} />)

describe('SecurityDrawerContent', () => {
  it('selects the Checks tab by default', () => {
    renderContent()

    expect(screen.getByRole('tab', { name: '检查项' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: '详情' })).toHaveAttribute('aria-selected', 'false')
  })

  it('switches to the Details tab on click', () => {
    renderContent()

    fireEvent.click(screen.getByRole('tab', { name: '详情' }))

    expect(screen.getByRole('tab', { name: '详情' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: '检查项' })).toHaveAttribute('aria-selected', 'false')
  })
})
