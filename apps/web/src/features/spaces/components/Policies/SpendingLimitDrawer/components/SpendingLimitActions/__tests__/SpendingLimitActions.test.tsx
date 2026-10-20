import { act, mockClipboard, render, renderWithUserEvent, screen, waitFor } from '@/tests/test-utils'
import type { SpendingLimitDrawerState } from '@safe-global/views/features/spaces/components/Policies/SpendingLimitDrawer/resolveState'
import SpendingLimitActions from '../SpendingLimitActions'

const TRANSACTION_LINK = 'https://app.safe.global/transactions/tx?id=0x9f3c'

const setup = (state: SpendingLimitDrawerState) =>
  render(
    <SpendingLimitActions
      state={state}
      pending={{ transactionLink: TRANSACTION_LINK, reviewTransactionHref: '/transactions/tx?id=0x9f3c' }}
      onEdit={jest.fn()}
      onConnectWallet={jest.fn()}
    />,
  )

describe('SpendingLimitActions', () => {
  it('none: renders no footer for a transaction that has left the queue', () => {
    const { container } = setup({
      kind: 'closed',
      operation: 'create',
      action: 'none',
      bannerTitle: '交易已删除。',
      bannerLine2: '关闭此面板以查看当前策略。',
    })

    expect(container).toBeEmptyDOMElement()
  })

  it('review: stays disabled until the transaction has loaded', () => {
    render(
      <SpendingLimitActions
        state={{ kind: 'pending', operation: 'create', action: 'review', bannerTitle: 't', signed: 1, required: 2 }}
        pending={{ transactionLink: TRANSACTION_LINK }}
        onConnectWallet={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '检查交易' })).toBeDisabled()
  })

  it('review: offers to try again when the transaction failed to load', async () => {
    const onRetry = jest.fn()
    const { user } = renderWithUserEvent(
      <SpendingLimitActions
        state={{ kind: 'pending', operation: 'create', action: 'review', bannerTitle: 't', signed: 1, required: 2 }}
        pending={{ transactionLink: TRANSACTION_LINK, onRetry }}
        onConnectWallet={jest.fn()}
      />,
    )

    await user.click(screen.getByRole('button', { name: '重试' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: '检查交易' })).not.toBeInTheDocument()
  })

  it('copy-link: renders no footer until the link can be built', () => {
    const { container } = render(
      <SpendingLimitActions
        state={{ kind: 'pending', operation: 'create', action: 'copy-link', bannerTitle: 't', signed: 1, required: 2 }}
        pending={{}}
        onConnectWallet={jest.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('connect: asks a disconnected viewer to connect and explains why', async () => {
    const onConnectWallet = jest.fn()
    const { user } = renderWithUserEvent(
      <SpendingLimitActions
        state={{ kind: 'active', action: 'connect', disabled: false, helper: '请连接签名人钱包以编辑。' }}
        pending={{ transactionLink: TRANSACTION_LINK, reviewTransactionHref: '/transactions/tx?id=0x9f3c' }}
        onEdit={jest.fn()}
        onConnectWallet={onConnectWallet}
      />,
    )

    expect(screen.getByText('请连接签名人钱包以编辑。')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '连接钱包' }))

    expect(onConnectWallet).toHaveBeenCalledTimes(1)
  })

  it('review: offers to review the pending transaction and drops a helper even if one were set', () => {
    setup({
      kind: 'pending',
      operation: 'create',
      action: 'review',
      bannerTitle: '交易尚未执行，支出限额尚未生效。',
      bannerLine2: '签名并执行交易 to activate。',
      // resolvePending never actually sets `helper` on a review state, but the review branch
      // must not render it even if it did — it has no matching copy for that action.
      helper: 'should never render',
      signed: 1,
      required: 2,
    })

    expect(screen.getByRole('link', { name: '检查交易' })).toBeInTheDocument()
    expect(screen.queryByText('should never render')).not.toBeInTheDocument()
  })

  it('manage: offers a connected signer edit, and no delete', async () => {
    const onEdit = jest.fn()
    const { user } = renderWithUserEvent(
      <SpendingLimitActions
        state={{ kind: 'active', action: 'manage', disabled: false }}
        onEdit={onEdit}
        onConnectWallet={jest.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: '删除' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '编辑' }))

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it('manage: disables editing for a non-signer and explains why', () => {
    setup({
      kind: 'active',
      action: 'manage',
      disabled: true,
      helper: '仅此 8379 账户的签名人可以编辑此支出限额。',
    })

    expect(screen.getByRole('button', { name: '编辑' })).toBeDisabled()
    expect(screen.getByText('仅此 8379 账户的签名人可以编辑此支出限额。')).toBeInTheDocument()
  })

  it('manage: keeps the non-signer reason ahead of the coming-soon line', () => {
    render(
      <SpendingLimitActions
        state={{
          kind: 'active',
          action: 'manage',
          disabled: true,
          helper: '仅此 8379 账户的签名人可以编辑此支出限额。',
        }}
        onConnectWallet={jest.fn()}
      />,
    )

    expect(screen.getByText('仅此 8379 账户的签名人可以编辑此支出限额。')).toBeInTheDocument()
    expect(screen.queryByText('升级至 Business 以编辑支出限额。')).not.toBeInTheDocument()
  })

  it('enable: adds the module of an unenforced policy back', async () => {
    const onEnableModule = jest.fn()
    const { user } = renderWithUserEvent(
      <SpendingLimitActions
        state={{
          kind: 'unenforced',
          action: 'enable',
          disabled: false,
          bannerTitle: '支出限额模块已删除',
          bannerLine2: '模块已删除，支出限额未应用。',
        }}
        onConnectWallet={jest.fn()}
        onEnableModule={onEnableModule}
      />,
    )

    expect(screen.queryByRole('button', { name: '编辑' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '添加模块' }))

    expect(onEnableModule).toHaveBeenCalledTimes(1)
  })

  it('enable: disables the action for a non-signer', () => {
    render(
      <SpendingLimitActions
        state={{
          kind: 'unenforced',
          action: 'enable',
          disabled: true,
          bannerTitle: '支出限额模块已删除',
          bannerLine2: '模块已删除，支出限额未应用。',
          helper: '仅此 8379 账户的签名人可以添加模块。',
        }}
        onConnectWallet={jest.fn()}
        onEnableModule={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '添加模块' })).toBeDisabled()
    expect(screen.getByText('仅此 8379 账户的签名人可以添加模块。')).toBeInTheDocument()
  })

  it('enable: disables the action and points to the upgrade while no flow is supplied', () => {
    render(
      <SpendingLimitActions
        state={{
          kind: 'unenforced',
          action: 'enable',
          disabled: false,
          bannerTitle: '支出限额模块已删除',
          bannerLine2: '模块已删除，支出限额未应用。',
        }}
        onConnectWallet={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '添加模块' })).toBeDisabled()
    expect(screen.getByText('升级至 Business 以添加模块。')).toBeInTheDocument()
  })

  it('manage: disables editing and points to the upgrade while no edit flow is supplied', () => {
    render(
      <SpendingLimitActions
        state={{ kind: 'active', action: 'manage', disabled: false }}
        onConnectWallet={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '编辑' })).toBeDisabled()
    expect(screen.getByText('升级至 Business 以编辑支出限额。')).toBeInTheDocument()
  })

  describe('copy-link', () => {
    it('copies the transaction link for a signer who already signed', async () => {
      const writeText = mockClipboard()
      setup({
        kind: 'pending',
        operation: 'create',
        action: 'copy-link',
        bannerTitle: '交易尚未执行，支出限额尚未生效。',
        signed: 1,
        required: 2,
      })

      act(() => {
        screen.getByRole('button', { name: /复制交易链接/ }).click()
      })

      await waitFor(() => expect(writeText).toHaveBeenCalledWith(TRANSACTION_LINK))
    })
  })
})
