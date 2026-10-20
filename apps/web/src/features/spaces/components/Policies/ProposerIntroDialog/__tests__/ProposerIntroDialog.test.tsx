import { useState } from 'react'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import { render, renderWithUserEvent, screen, waitFor } from '@/tests/test-utils'
import ProposerIntroDialog from '../index'

const StatefulIntro = ({ onProceed }: { onProceed: () => void }) => {
  const [open, setOpen] = useState(true)

  return <ProposerIntroDialog open={open} onOpenChange={setOpen} onProceed={onProceed} />
}

describe('ProposerIntroDialog', () => {
  it('names the policy and what it does', () => {
    render(<ProposerIntroDialog open onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.getByRole('heading', { name: /提案人角色/ })).toBeInTheDocument()
    expect(screen.getByText('允许没有签名权限的团队成员发起交易。')).toBeInTheDocument()
  })

  it('explains that a proposer can suggest but not approve or execute', () => {
    render(<ProposerIntroDialog open onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.getByText('提案人可以发起交易，但无法批准或执行。')).toBeInTheDocument()
  })

  it('explains that preparation is separated from approval without losing security', () => {
    render(<ProposerIntroDialog open onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.getByText('将交易准备与交易批准分离，同时保障安全。')).toBeInTheDocument()
  })

  it('explains that changes still require owner signatures', () => {
    render(<ProposerIntroDialog open onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.getByText('任何变更均需要所有者签名，所有权限均通过 8379 管理。')).toBeInTheDocument()
  })

  it('previews the end result: transactions, signers and proposers', () => {
    render(<ProposerIntroDialog open onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.getByTestId('proposer-preview')).toBeInTheDocument()
    expect(screen.getByText('交易')).toBeInTheDocument()
    expect(screen.getByText('签名人')).toBeInTheDocument()
    expect(screen.getByText('提案人')).toBeInTheDocument()
    expect(screen.getByText('3/5')).toBeInTheDocument()
  })

  it('links the title icon to the proposers article', () => {
    render(<ProposerIntroDialog open onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.getByRole('link', { name: '了解提案人' })).toHaveAttribute('href', HelpCenterArticle.PROPOSERS)
  })

  it('proceeds to the flow on the primary action', async () => {
    const onProceed = jest.fn()
    const { user } = renderWithUserEvent(<ProposerIntroDialog open onOpenChange={jest.fn()} onProceed={onProceed} />)

    await user.click(screen.getByRole('button', { name: '设置提案人' }))

    expect(onProceed).toHaveBeenCalledTimes(1)
  })

  it('closes without proceeding when dismissed', async () => {
    const onProceed = jest.fn()
    const { user } = renderWithUserEvent(<StatefulIntro onProceed={onProceed} />)

    await user.click(screen.getByRole('button', { name: '关闭' }))

    await waitFor(() => expect(screen.queryByTestId('proposer-intro-dialog')).not.toBeInTheDocument())
    expect(onProceed).not.toHaveBeenCalled()
  })

  it('renders nothing while closed', () => {
    render(<ProposerIntroDialog open={false} onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.queryByTestId('proposer-intro-dialog')).not.toBeInTheDocument()
  })
})
