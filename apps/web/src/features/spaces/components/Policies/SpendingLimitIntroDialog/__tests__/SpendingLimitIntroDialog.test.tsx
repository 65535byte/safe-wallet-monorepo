import { useState } from 'react'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import { render, renderWithUserEvent, screen, waitFor } from '@/tests/test-utils'
import SpendingLimitIntroDialog from '../index'

/** Holds the open state the way the Policies page does, so dismissal is observable. */
const StatefulIntro = ({ onProceed }: { onProceed: () => void }) => {
  const [open, setOpen] = useState(true)

  return <SpendingLimitIntroDialog open={open} onOpenChange={setOpen} onProceed={onProceed} />
}

describe('SpendingLimitIntroDialog', () => {
  it('names the policy and what it does', () => {
    render(<SpendingLimitIntroDialog open onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.getByRole('heading', { name: /支出限额/ })).toBeInTheDocument()
    expect(screen.getByText('允许支出授权人无需收集签名即可使用资产。')).toBeInTheDocument()
  })

  it('explains that a spender need not be a signer', () => {
    render(<SpendingLimitIntroDialog open onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.getByText('任何人均可成为支出授权人，无需是此 8379 账户的签名人。')).toBeInTheDocument()
  })

  it('explains the token, the amount, the period and the automatic reset', () => {
    render(<SpendingLimitIntroDialog open onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.getByText('选择代币及每日、每周或每月额度。周期结束后，额度会自动重置。')).toBeInTheDocument()
  })

  it('explains that creating the limit costs a transaction but spending within it does not', () => {
    render(<SpendingLimitIntroDialog open onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.getByText('创建限额需要一笔交易。生效后，在额度内支出无需额外批准。')).toBeInTheDocument()
  })

  it('previews the end result: spenders, a token limit and the remaining balance', () => {
    render(<SpendingLimitIntroDialog open onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    const preview = screen.getByTestId('spending-limit-preview')

    expect(preview).toBeInTheDocument()
    expect(screen.getAllByText('支出授权人')).toHaveLength(2)
    expect(screen.getByText('USDC')).toBeInTheDocument()
    expect(screen.getByText('1,500/Month')).toBeInTheDocument()
    expect(screen.getByText('剩余 500 USDC')).toBeInTheDocument()
  })

  it('links the title icon to the spending limits article', () => {
    render(<SpendingLimitIntroDialog open onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.getByRole('link', { name: '了解支出限额' })).toHaveAttribute(
      'href',
      HelpCenterArticle.SPENDING_LIMITS,
    )
  })

  it('proceeds to the flow on the primary action', async () => {
    const onProceed = jest.fn()
    const { user } = renderWithUserEvent(
      <SpendingLimitIntroDialog open onOpenChange={jest.fn()} onProceed={onProceed} />,
    )

    await user.click(screen.getByRole('button', { name: '设置支出限额' }))

    expect(onProceed).toHaveBeenCalledTimes(1)
  })

  it('closes without proceeding when dismissed', async () => {
    const onProceed = jest.fn()
    const { user } = renderWithUserEvent(<StatefulIntro onProceed={onProceed} />)

    await user.click(screen.getByRole('button', { name: '关闭' }))

    await waitFor(() => expect(screen.queryByTestId('spending-limit-intro-dialog')).not.toBeInTheDocument())
    expect(onProceed).not.toHaveBeenCalled()
  })

  it('renders nothing while closed', () => {
    render(<SpendingLimitIntroDialog open={false} onOpenChange={jest.fn()} onProceed={jest.fn()} />)

    expect(screen.queryByTestId('spending-limit-intro-dialog')).not.toBeInTheDocument()
  })
})
