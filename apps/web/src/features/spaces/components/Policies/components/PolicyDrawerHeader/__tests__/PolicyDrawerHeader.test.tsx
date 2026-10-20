import { Wallet } from 'lucide-react'
import { render, screen } from '@/tests/test-utils'
import PolicyDrawerHeader from '../PolicyDrawerHeader'

describe('PolicyDrawerHeader', () => {
  it('titles the drawer', () => {
    render(<PolicyDrawerHeader icon={Wallet} title="支出限额" status="active" />)

    expect(screen.getByText('支出限额')).toBeInTheDocument()
  })

  it('renders the status it is given', () => {
    render(<PolicyDrawerHeader icon={Wallet} title="支出限额" status="not-activated" />)

    expect(screen.getByText('未激活')).toBeInTheDocument()
  })

  it('stands in with a skeleton until the status is known', () => {
    render(<PolicyDrawerHeader icon={Wallet} title="提案人角色" />)

    expect(screen.getByTestId('policy-status-skeleton')).toBeInTheDocument()
    expect(screen.queryByText('已启用')).not.toBeInTheDocument()
  })
})
