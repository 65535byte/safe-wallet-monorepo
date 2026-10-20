import { render, screen } from '@testing-library/react'
import AccountsNavigation from '../index'

describe('AccountsNavigation', () => {
  it('only displays the selected My accounts tab', () => {
    render(<AccountsNavigation />)

    expect(screen.getAllByRole('tab')).toHaveLength(1)
    const accounts = screen.getByRole('tab', { name: '我的账户' })
    expect(accounts).toHaveAttribute('href', '/welcome/accounts')
    expect(accounts).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByRole('tab', { name: '8379' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: '工作空间' })).not.toBeInTheDocument()
  })
})
