import { render, screen } from '@/tests/test-utils'
import ProposerDrawer from '../ProposerDrawer'
import { ProposerStatus } from '@safe-global/views/features/spaces/components/Policies/ProposerDrawer/variants/types'

const OVERVIEW = {
  proposer: { address: '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326', name: 'Marc' },
  appliesTo: { address: '0x86753FE4b8E29Ce8A38cDf9559D80E05b00cdBA0', name: 'Marketing' },
  initiatedBy: { address: '0xA77De01c5B6f829Cbe4604cF71dDc8C4d608b000', name: 'Jacob' },
  chainId: '1',
  lastUpdated: '06.24.26 03:35 AM UTC',
  enforcedBy: 'Safe module',
}

const PENDING_PROPS = {
  status: ProposerStatus.PENDING,
  description: 'Marketing is a nested 个 Safe 账户.',
  safe: { address: '0x8675B754342754A30A2AeF474D114d8460bca19b', name: 'Ops', threshold: 3 },
  signatures: 2,
  overview: OVERVIEW,
} as const

describe('ProposerDrawer', () => {
  it('renders the not-activated variant with why it failed and its stalled signatures', () => {
    render(
      <ProposerDrawer
        open
        onClose={jest.fn()}
        status={ProposerStatus.NOT_ACTIVATED}
        description="The time window expired. Set the policy up again to retry."
        safe={PENDING_PROPS.safe}
        signatures={2}
        expiresLabel="Expired"
        overview={OVERVIEW}
        actionLabel="Retry"
        onAction={jest.fn()}
      />,
    )

    expect(screen.getByText('提案人角色')).toBeInTheDocument()
    expect(screen.getByText('未激活')).toBeInTheDocument()
    expect(screen.getByText('提案人角色未激活')).toBeInTheDocument()
    expect(screen.getByText('The time window expired. Set the policy up again to retry.')).toBeInTheDocument()
    expect(screen.getByText('已过期')).toBeInTheDocument()
    expect(screen.getByTestId('safe-signature-progress')).toHaveTextContent('2 of 3 signed')
    expect(screen.getByText('策略概览')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重试' })).toBeInTheDocument()
  })

  it('renders the active variant as the proposer overview alone', () => {
    render(
      <ProposerDrawer
        open
        onClose={jest.fn()}
        status={ProposerStatus.ACTIVE}
        overview={OVERVIEW}
        actionLabel="Remove proposer"
        actionVariant="secondary"
        onAction={jest.fn()}
      />,
    )

    expect(screen.getByText('已启用')).toBeInTheDocument()
    expect(screen.getByText('策略概览')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '移除提案人' })).toBeInTheDocument()
    expect(screen.queryByText('待签名')).not.toBeInTheDocument()
  })

  it('keeps the active action out of reach for a wallet that cannot sign', () => {
    render(
      <ProposerDrawer
        open
        onClose={jest.fn()}
        status={ProposerStatus.ACTIVE}
        overview={OVERVIEW}
        actionLabel="Remove proposer"
        actionDisabled
        actionHint="Only signers of this Treasury can delete or edit this Proposer role."
        onAction={jest.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: '移除提案人' })).toBeDisabled()
    expect(screen.getByText('Only signers / this Treasury can delete or edit this Proposer role.')).toBeInTheDocument()
  })

  it('tells the user to remove a parent Safe grant from the Safe settings', () => {
    render(
      <ProposerDrawer
        open
        onClose={jest.fn()}
        status={ProposerStatus.ACTIVE}
        overview={OVERVIEW}
        nestedSafeGrant={{
          safeName: 'Marketing',
          parentSafeName: 'Ops',
          settingsHref: { pathname: '/settings/setup', query: { safe: `eth:${OVERVIEW.appliesTo.address}` } },
        }}
        actionLabel="Remove proposer"
        actionDisabled
        onAction={jest.fn()}
      />,
    )

    expect(screen.getByText('在 8379 账户设置中移除此提案人')).toBeInTheDocument()
    expect(screen.getByTestId('nested-safe-grant-notice')).toHaveTextContent('The parent Safe account, Ops')
    expect(screen.getByRole('link', { name: '前往 8379 设置' })).toHaveAttribute(
      'href',
      `/settings/setup?safe=eth%3A${OVERVIEW.appliesTo.address}`,
    )
    expect(screen.getByRole('button', { name: '移除提案人' })).toBeDisabled()
  })

  it('shows no nested Safe notice for a role granted by a signer', () => {
    render(
      <ProposerDrawer
        open
        onClose={jest.fn()}
        status={ProposerStatus.ACTIVE}
        overview={OVERVIEW}
        actionLabel="Remove proposer"
        onAction={jest.fn()}
      />,
    )

    expect(screen.queryByTestId('nested-safe-grant-notice')).not.toBeInTheDocument()
  })

  it('renders the pending variant with its alert, signature section and overview', () => {
    render(
      <ProposerDrawer
        open
        onClose={jest.fn()}
        actionLabel="Review transaction"
        onAction={jest.fn()}
        {...PENDING_PROPS}
      />,
    )

    expect(screen.getByText('待处理')).toBeInTheDocument()
    expect(screen.getByText('提案人角色尚未生效')).toBeInTheDocument()
    expect(screen.getByText(PENDING_PROPS.description)).toBeInTheDocument()
    expect(screen.getByText('待签名')).toBeInTheDocument()
    expect(screen.getByTestId('safe-signature-progress')).toHaveTextContent('2 of 3 signed')
    expect(screen.getByText('策略概览')).toBeInTheDocument()
    expect(screen.getByText('Marc')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '检查交易' })).toBeInTheDocument()
  })

  it('renders nothing while closed', () => {
    render(
      <ProposerDrawer
        open={false}
        onClose={jest.fn()}
        status={ProposerStatus.ACTIVE}
        overview={OVERVIEW}
        actionLabel="Remove proposer"
        onAction={jest.fn()}
      />,
    )

    expect(screen.queryByText('提案人角色')).not.toBeInTheDocument()
  })

  it('stands in with skeletons while the policy is still loading', () => {
    render(<ProposerDrawer open onClose={jest.fn()} isLoading />)

    expect(screen.getByText('提案人角色')).toBeInTheDocument()
    expect(screen.getByTestId('policy-status-skeleton')).toBeInTheDocument()
    expect(screen.getByText('策略概览')).toBeInTheDocument()
    expect(screen.getAllByTestId('account-identity-skeleton')).toHaveLength(3)
    expect(screen.getByTestId('policy-drawer-actions-skeleton')).toBeInTheDocument()
    expect(screen.queryByText('已启用')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /remove proposer\|retry\|review 笔交易/i })).not.toBeInTheDocument()
  })
})
