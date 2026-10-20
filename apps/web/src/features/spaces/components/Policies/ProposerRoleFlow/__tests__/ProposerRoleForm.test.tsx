import type { ReactNode } from 'react'
import { act, fireEvent, renderWithUserEvent, screen, waitFor } from '@/tests/test-utils'
import * as useIsWrongChainHook from '@/hooks/useIsWrongChain'
import * as useChainsHook from '@/hooks/useChains'
import * as useChainIdHook from '@/hooks/useChainId'
import type { SpaceAddressBookItemDto } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import useGetSpaceAddressBook from '../../../../hooks/useGetSpaceAddressBook'
import { useIsAdmin } from '../../../../hooks/useSpaceMembers'
import { chainBuilder } from '@/tests/builders/chains'
import { getNestedSafesNoticeText } from '@safe-global/views/features/spaces/components/Policies/SafeAccountSelector/constants'
import { buildSafeAccountId } from '../../SafeAccountSelector/utils'
import type { SafeAccountOption } from '@safe-global/views/features/spaces/components/Policies/SafeAccountSelector/types'
import { PARENT_SAFE_WALLET_COPY } from '@safe-global/views/features/spaces/components/Policies/ProposerRoleFlow/constants'
import ProposerRoleForm, { type ProposerRoleFormProps } from '../ProposerRoleForm'

jest.mock('@/components/common/ChainIndicator', () => {
  const Mock = ({ chainId }: { chainId: string }) => <img data-testid="chain-logo-img" alt={`chain-${chainId}`} />
  Mock.displayName = 'ChainIndicator'
  return { __esModule: true, default: Mock }
})

// No wallet or scoped Safe here; the wallet gate is CheckWallet's own concern.
jest.mock('@/components/common/CheckWallet', () => ({
  __esModule: true,
  default: ({ children }: { children: (ok: boolean) => ReactNode }) => <>{children(true)}</>,
}))

const NO_WORKSPACE_CONTACTS: SpaceAddressBookItemDto[] = []

jest.mock('../../../../hooks/useGetSpaceAddressBook', () => ({
  ...jest.requireActual('../../../../hooks/useGetSpaceAddressBook'),
  __esModule: true,
  default: jest.fn(() => NO_WORKSPACE_CONTACTS),
}))

jest.mock('../../../../hooks/useSpaceMembers', () => ({
  ...jest.requireActual('../../../../hooks/useSpaceMembers'),
  useIsAdmin: jest.fn(() => false),
}))

const CHAIN_ID = '1'
const SAFE = '0xAAAAaaaaAAaaaaAAAaAAaaaAaAaaaaaAAAaaAAaA'
const PROPOSER = '0x8675B754342754A30A2AeF474D114d8460bca19b'

const treasury: SafeAccountOption = {
  id: buildSafeAccountId(CHAIN_ID, SAFE),
  chainId: CHAIN_ID,
  address: SAFE,
  name: 'Treasury',
  eligibility: 'signer',
  threshold: 3,
  owners: 5,
  chain: { chainId: CHAIN_ID, chainName: 'Ethereum', chainLogoUri: null, shortName: 'eth' },
  fiatTotal: '123720',
}

const eligible = {
  accounts: [treasury],
  isLoading: false,
  isError: false,
  hasWallet: true,
  signersOnly: true,
  refetch: jest.fn(),
}

const renderForm = (props: Partial<ProposerRoleFormProps> = {}, addressBook = {}) =>
  renderWithUserEvent(
    <ProposerRoleForm onSubmit={jest.fn()} safeAccounts={eligible} onSafeAccountChange={jest.fn()} {...props} />,
    { initialReduxState: { addressBook } },
  )

const submitButton = () => screen.getByRole('button', { name: '提交' })

// The proposer field is a combobox too, so the account field is addressed by its test id.
const accountField = () => screen.getByTestId('safe-account-selector')

const openAccountField = async (user: ReturnType<typeof renderForm>['user']) => {
  const trigger = accountField()
  await user.click(trigger)
  await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'true'))
}

describe('ProposerRoleForm', () => {
  it('warns that the grant needs a wallet signature to complete', () => {
    renderForm()

    expect(screen.getByText('您即将授予发起交易的权限。')).toBeInTheDocument()
    expect(screen.getByText('请使用已连接钱包签名确认以完成配置。')).toBeInTheDocument()
  })

  it('points at the proposer settings in the nested Safes notice', async () => {
    const { user } = renderForm()

    await openAccountField(user)

    expect(await screen.findByTestId('safe-account-selector-notice')).toHaveTextContent(
      getNestedSafesNoticeText('proposers'),
    )
  })

  it('explains the proposer field and where a member name goes', () => {
    renderForm()

    expect(screen.getByText('将获得发起交易权限的受益人。')).toBeInTheDocument()
    expect(screen.getByText('已提交管理员，申请添加到工作空间通讯录。')).toBeInTheDocument()
  })

  describe('submit gating', () => {
    it('disables submit until a Safe account is picked', () => {
      renderForm({ defaultValues: { proposer: PROPOSER, name: 'Nicole' } })

      expect(submitButton()).toBeDisabled()
    })

    it('disables submit while the proposer address is empty', () => {
      renderForm({ safeAccount: treasury.id })

      expect(submitButton()).toBeDisabled()
    })

    it('enables submit once an account and a valid proposer are set', async () => {
      renderForm({ safeAccount: treasury.id, defaultValues: { proposer: PROPOSER } })

      await waitFor(() => expect(submitButton()).toBeEnabled())
    })

    it('keeps submit disabled while the picked Safe account is not activated', async () => {
      const notActivated: SafeAccountOption = {
        ...treasury,
        id: buildSafeAccountId('137', SAFE),
        chainId: '137',
        ineligibleReason: 'not-activated',
      }
      renderForm({
        safeAccounts: { ...eligible, accounts: [treasury, notActivated] },
        safeAccount: notActivated.id,
        defaultValues: { proposer: PROPOSER },
      })

      await screen.findByText('交易前需要先激活此 8379')
      expect(submitButton()).toBeDisabled()
    })

    it('shows the parent Safe notice with a settings link and blocks submit when the wallet is a parent Safe', async () => {
      renderForm({
        safeAccount: treasury.id,
        defaultValues: { proposer: PROPOSER },
        parentSafeWallet: {
          ...PARENT_SAFE_WALLET_COPY,
          safeName: 'Treasury',
          parentSafeName: 'Ops',
          settingsHref: { pathname: '/settings/setup', query: { safe: `eth:${SAFE}` } },
        },
      })

      expect(screen.getByText('在 8379 账户设置中添加此提案人')).toBeInTheDocument()
      expect(screen.getByTestId('parent-safe-wallet-notice')).toHaveTextContent(
        'Your connected wallet, Ops, is a parent Safe account of Treasury. To grant this role on its behalf, open the settings of Treasury with a signer of Ops.',
      )
      expect(screen.getByRole('link', { name: '前往 8379 设置' })).toHaveAttribute(
        'href',
        expect.stringContaining('/settings/setup?safe='),
      )
      await waitFor(() => expect(screen.getByRole('combobox', { name: '提案人' })).toHaveValue(PROPOSER))
      expect(submitButton()).toBeDisabled()
    })

    it('closes the flow and pushes the settings route itself when the link is clicked', async () => {
      const onNavigate = jest.fn()
      const push = jest.fn().mockResolvedValue(true)
      const settingsHref = { pathname: '/settings/setup', query: { safe: `eth:${SAFE}` } }
      const { user } = renderWithUserEvent(
        <ProposerRoleForm
          onSubmit={jest.fn()}
          safeAccounts={eligible}
          onSafeAccountChange={jest.fn()}
          safeAccount={treasury.id}
          parentSafeWallet={{
            ...PARENT_SAFE_WALLET_COPY,
            safeName: 'Treasury',
            parentSafeName: 'Ops',
            settingsHref,
            onNavigate,
          }}
        />,
        { routerProps: { push } },
      )

      await user.click(screen.getByRole('link', { name: '前往 8379 设置' }))

      expect(onNavigate).toHaveBeenCalledTimes(1)
      expect(push).toHaveBeenCalledTimes(1)
      expect(push).toHaveBeenCalledWith(settingsHref)
    })

    it('keeps the settings link mousedown from the document-level navigation guard', () => {
      const guard = jest.fn()
      document.addEventListener('mousedown', guard)
      renderForm({
        safeAccount: treasury.id,
        parentSafeWallet: { ...PARENT_SAFE_WALLET_COPY, safeName: 'Treasury', parentSafeName: 'Ops', settingsHref: {} },
      })

      fireEvent.mouseDown(screen.getByRole('link', { name: '前往 8379 设置' }))
      fireEvent.mouseDown(screen.getByTestId('parent-safe-wallet-notice'))

      expect(guard).toHaveBeenCalledTimes(1)
      document.removeEventListener('mousedown', guard)
    })

    it('keeps submit disabled while the picked Safe account is missing from the resolved accounts', async () => {
      renderForm({ safeAccount: buildSafeAccountId('137', SAFE), defaultValues: { proposer: PROPOSER } })

      await waitFor(() => expect(screen.getByRole('combobox', { name: '提案人' })).toHaveValue(PROPOSER))
      expect(submitButton()).toBeDisabled()
    })

    it('runs the proposer rule on the typed address and blocks submit on its message', async () => {
      const validateProposer = jest.fn().mockResolvedValue('不能将此 8379 账户的签名人添加为提案人')
      const { user } = renderForm({ safeAccount: treasury.id, validateProposer })

      await user.type(screen.getByRole('combobox', { name: '提案人' }), PROPOSER)

      await waitFor(() => expect(validateProposer).toHaveBeenCalledWith(PROPOSER))
      await waitFor(() => expect(screen.getByText('不能将此 8379 账户的签名人添加为提案人')).toBeInTheDocument())
      expect(submitButton()).toBeDisabled()
    })

    it('re-validates the proposer when the Safe account changes', async () => {
      const validateProposer = jest.fn().mockResolvedValue(undefined)
      const { user, rerender } = renderForm({ safeAccount: treasury.id, validateProposer })

      await user.type(screen.getByRole('combobox', { name: '提案人' }), PROPOSER)
      await waitFor(() => expect(validateProposer).toHaveBeenCalled())
      validateProposer.mockClear()

      rerender(
        <ProposerRoleForm
          onSubmit={jest.fn()}
          safeAccounts={eligible}
          onSafeAccountChange={jest.fn()}
          safeAccount="137:0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"
          validateProposer={validateProposer}
        />,
      )

      await waitFor(() => expect(validateProposer).toHaveBeenCalledWith(PROPOSER))
    })

    it('re-validates the proposer when the rule itself changes, e.g. once the Safe has loaded', async () => {
      const loading = jest.fn().mockResolvedValue('正在加载 8379 账户详情，请稍候')
      const loaded = jest.fn().mockResolvedValue(undefined)
      const { user, rerender } = renderForm({ safeAccount: treasury.id, validateProposer: loading })

      await user.type(screen.getByRole('combobox', { name: '提案人' }), PROPOSER)
      await waitFor(() => expect(screen.getByText('正在加载 8379 账户详情，请稍候')).toBeInTheDocument())
      expect(submitButton()).toBeDisabled()

      rerender(
        <ProposerRoleForm
          onSubmit={jest.fn()}
          safeAccounts={eligible}
          onSafeAccountChange={jest.fn()}
          safeAccount={treasury.id}
          validateProposer={loaded}
        />,
      )

      await waitFor(() => expect(loaded).toHaveBeenCalledWith(PROPOSER))
      await waitFor(() => expect(submitButton()).toBeEnabled())
      expect(screen.queryByText('正在加载 8379 账户详情，请稍候')).not.toBeInTheDocument()
    })

    it('re-validates a prefilled proposer when the Safe account changes', async () => {
      const validateProposer = jest.fn().mockResolvedValue(undefined)
      const { rerender } = renderForm({
        safeAccount: treasury.id,
        defaultValues: { proposer: PROPOSER },
        validateProposer,
      })

      await waitFor(() => expect(validateProposer).toHaveBeenCalledWith(PROPOSER))
      validateProposer.mockClear()

      rerender(
        <ProposerRoleForm
          onSubmit={jest.fn()}
          safeAccounts={eligible}
          onSafeAccountChange={jest.fn()}
          safeAccount="137:0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"
          defaultValues={{ proposer: PROPOSER }}
          validateProposer={validateProposer}
        />,
      )

      await waitFor(() => expect(validateProposer).toHaveBeenCalledWith(PROPOSER))
    })

    it('reports the entered values to onSubmit', async () => {
      const onSubmit = jest.fn()
      const { user } = renderForm({
        safeAccount: treasury.id,
        defaultValues: { proposer: PROPOSER, name: 'Nicole' },
        onSubmit,
      })

      await waitFor(() => expect(submitButton()).toBeEnabled())
      await user.click(submitButton())

      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ proposer: PROPOSER, name: 'Nicole' }),
          expect.anything(),
        ),
      )
    })

    it('swaps submit for a disabled spinner while submitting', () => {
      renderForm({
        safeAccount: treasury.id,
        defaultValues: { proposer: PROPOSER },
        isSubmitting: true,
      })

      expect(screen.queryByRole('button', { name: '提交' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: '加载中' })).toBeDisabled()
    })

    it('submits without a name, which is optional', async () => {
      const onSubmit = jest.fn()
      const { user } = renderForm({
        safeAccount: treasury.id,
        defaultValues: { proposer: PROPOSER },
        onSubmit,
      })

      await waitFor(() => expect(submitButton()).toBeEnabled())
      await user.click(submitButton())

      await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    })
  })

  describe('proposer name', () => {
    const nameField = () => screen.getByRole('textbox', { name: '提案人名称' })
    const queryNameField = () => screen.queryByRole('textbox', { name: '提案人名称' })
    const localContact = { [CHAIN_ID]: { [PROPOSER]: 'Alice' } }
    const workspaceContact: SpaceAddressBookItemDto = {
      name: 'Workspace Alice',
      address: PROPOSER,
      chainIds: [CHAIN_ID],
      createdBy: '',
      createdByUserId: 0,
      lastUpdatedBy: '',
      lastUpdatedByUserId: 0,
      createdAt: '',
      updatedAt: '',
    }
    const workspaceContacts = [workspaceContact]

    beforeEach(() => jest.spyOn(useChainIdHook, 'default').mockReturnValue(CHAIN_ID))
    afterEach(() => {
      jest.restoreAllMocks()
      jest.mocked(useIsAdmin).mockReturnValue(false)
      jest.mocked(useGetSpaceAddressBook).mockReturnValue(NO_WORKSPACE_CONTACTS)
    })

    it('fills in the local address book name and lets a member change it', async () => {
      const { user } = renderForm({ defaultValues: { proposer: PROPOSER } }, localContact)

      await waitFor(() => expect(nameField()).toHaveValue('Alice'))
      await user.clear(nameField())
      await user.type(nameField(), 'Bob')
      expect(nameField()).toHaveValue('Bob')
    })

    it('fills in the local address book name, lets an admin change it and says it goes to the Workspace', async () => {
      jest.mocked(useIsAdmin).mockReturnValue(true)
      const { user } = renderForm({ defaultValues: { proposer: PROPOSER } }, localContact)

      await waitFor(() => expect(nameField()).toHaveValue('Alice'))
      await user.clear(nameField())
      await user.type(nameField(), 'Bob')
      expect(nameField()).toHaveValue('Bob')
      expect(screen.getByText('已保存到工作空间通讯录，对所有成员可见。')).toBeInTheDocument()
    })

    it.each([
      ['an admin', true],
      ['a member', false],
    ])('hides the name field from %s when the proposer is in the Workspace address book', async (_, isAdmin) => {
      jest.mocked(useIsAdmin).mockReturnValue(isAdmin)
      jest.mocked(useGetSpaceAddressBook).mockReturnValue(workspaceContacts)
      renderForm({ defaultValues: { proposer: PROPOSER } })

      await waitFor(() => expect(queryNameField()).not.toBeInTheDocument())
    })

    it('hides the name field when the proposer is in both the Workspace and the local address book', async () => {
      jest.mocked(useGetSpaceAddressBook).mockReturnValue(workspaceContacts)
      renderForm({ defaultValues: { proposer: PROPOSER } }, localContact)

      await waitFor(() => expect(queryNameField()).not.toBeInTheDocument())
    })

    it('submits the Workspace address book name while the name field is hidden', async () => {
      jest.mocked(useGetSpaceAddressBook).mockReturnValue(workspaceContacts)
      const onSubmit = jest.fn()
      const { user } = renderForm({ safeAccount: treasury.id, defaultValues: { proposer: PROPOSER }, onSubmit })

      await waitFor(() => expect(submitButton()).toBeEnabled())
      await user.click(submitButton())

      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ proposer: PROPOSER, name: 'Workspace Alice' }, expect.anything()),
      )
    })

    it('restores the Workspace name when switching from an edited local contact to a Workspace contact with the same name', async () => {
      const otherContact = '0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed'
      jest
        .mocked(useGetSpaceAddressBook)
        .mockReturnValue([{ ...workspaceContact, name: 'Alice', address: otherContact }])
      const onSubmit = jest.fn()
      const { user } = renderForm({ safeAccount: treasury.id, onSubmit }, localContact)
      const proposerField = () => screen.getByRole('combobox', { name: '提案人' })

      await user.type(proposerField(), PROPOSER)
      await waitFor(() => expect(nameField()).toHaveValue('Alice'))
      await user.clear(nameField())
      await user.type(nameField(), 'Bob')

      // Picked from the suggestions, so the proposer jumps straight from one contact to the other
      await user.click(screen.getByTestId('address-book-recipient'))
      const workspaceOption = (await screen.findAllByTestId('address-item')).find((option) =>
        option.textContent?.toLowerCase().includes(otherContact.slice(-4).toLowerCase()),
      )
      await user.click(workspaceOption!)
      await waitFor(() => expect(queryNameField()).not.toBeInTheDocument())

      await user.click(submitButton())
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ proposer: otherContact, name: 'Alice' }, expect.anything()),
      )
    })

    it('shows an empty name field when the proposer is in neither address book', () => {
      renderForm({ defaultValues: { proposer: PROPOSER } })

      expect(nameField()).toHaveValue('')
    })

    it('flags a local address book name the Workspace would reject so the admin can fix it', async () => {
      jest.mocked(useIsAdmin).mockReturnValue(true)
      renderForm({ defaultValues: { proposer: PROPOSER } }, { [CHAIN_ID]: { [PROPOSER]: 'Al' } })

      await waitFor(() => expect(nameField()).toHaveValue('Al'))
      expect(screen.getByText('Names must be，时间 least 3 character(s) long')).toBeInTheDocument()
    })
  })

  describe('proposer field', () => {
    const proposerField = () => screen.getByRole('combobox', { name: '提案人' })

    afterEach(() => jest.restoreAllMocks())

    it('does not suggest the picked Safe account as proposer', async () => {
      jest.spyOn(useChainIdHook, 'default').mockReturnValue(CHAIN_ID)
      const { user } = renderForm(
        { safeAccount: treasury.id },
        { [CHAIN_ID]: { [SAFE]: 'Treasury', [PROPOSER]: 'Alice' } },
      )

      await user.click(screen.getByTestId('address-book-toggle'))
      const options = await screen.findAllByTestId('address-item')

      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent('Alice')
    })

    it('does not take focus when the form opens', () => {
      renderForm({ safeAccount: treasury.id })

      expect(proposerField()).not.toHaveFocus()
    })

    it('is not marked invalid when focus leaves it while still empty', async () => {
      jest.useFakeTimers()
      try {
        renderForm({ safeAccount: treasury.id })
        const field = proposerField()

        fireEvent.focus(field)
        fireEvent.blur(field)
        await act(async () => {
          jest.advanceTimersByTime(200)
        })
        await act(async () => {
          jest.advanceTimersByTime(1000)
        })

        expect(field).not.toHaveAttribute('aria-invalid')
      } finally {
        jest.useRealTimers()
      }
    })
  })

  describe('Safe account field', () => {
    it('shows the picked account on the trigger', () => {
      renderForm({ safeAccount: treasury.id })

      expect(accountField()).toHaveTextContent('Treasury')
    })

    it('states the signer-only rule below the field', () => {
      renderForm()

      expect(screen.getByText('仅显示您具有以下身份的账户：signer。')).toBeInTheDocument()
    })

    it('reports a picked account to onSafeAccountChange', async () => {
      const onSafeAccountChange = jest.fn()
      const { user } = renderForm({ onSafeAccountChange })

      await openAccountField(user)
      await user.click(await screen.findByRole('option'))

      expect(onSafeAccountChange).toHaveBeenCalledWith(treasury.id)
    })

    it('does not offer the Safe account entered as proposer', async () => {
      const ops: SafeAccountOption = {
        ...treasury,
        id: buildSafeAccountId(CHAIN_ID, PROPOSER),
        address: PROPOSER,
        name: 'Ops',
      }
      const { user } = renderForm({
        safeAccounts: { ...eligible, accounts: [treasury, ops] },
        defaultValues: { proposer: PROPOSER },
      })

      await openAccountField(user)
      const options = await screen.findAllByRole('option')

      expect(options).toHaveLength(1)
      expect(options[0]).toHaveTextContent('Treasury')
    })

    it('keeps the picked Safe account when it is entered as its own proposer', () => {
      renderForm({ safeAccount: treasury.id, defaultValues: { proposer: SAFE } })

      expect(accountField()).toHaveTextContent('Treasury')
    })

    it('passes the loading state through to the account field', () => {
      renderForm({ safeAccounts: { ...eligible, accounts: [], isLoading: true } })

      expect(accountField().querySelector('[data-testid="safe-account-avatar-skeleton"]')).toBeInTheDocument()
    })

    it('offers a retry when the accounts failed to load', async () => {
      const refetch = jest.fn()
      const { user } = renderForm({ safeAccounts: { ...eligible, accounts: [], isError: true, refetch } })

      await openAccountField(user)
      await user.click(await screen.findByRole('button', { name: /重试/i }))

      expect(refetch).toHaveBeenCalled()
    })
  })

  describe('wallet network', () => {
    beforeEach(() => {
      jest
        .spyOn(useChainsHook, 'useCurrentChain')
        .mockReturnValue(chainBuilder().with({ chainId: CHAIN_ID, chainName: 'Ethereum' }).build())
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('asks to change the wallet network when the wallet is on another chain than the picked Safe', () => {
      jest.spyOn(useIsWrongChainHook, 'default').mockReturnValue(true)

      renderForm({ safeAccount: treasury.id })

      expect(screen.getByText('切换钱包网络')).toBeInTheDocument()
      expect(screen.getByText(/You are trying to sign on Ethereum/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Switch to/ })).toBeInTheDocument()
    })

    it('shows no network warning when the wallet is on the picked Safe chain', () => {
      jest.spyOn(useIsWrongChainHook, 'default').mockReturnValue(false)

      renderForm({ safeAccount: treasury.id })

      expect(screen.queryByText('切换钱包网络')).not.toBeInTheDocument()
    })
  })

  it('surfaces a submission error without clearing the form', () => {
    renderForm({
      safeAccount: treasury.id,
      defaultValues: { proposer: PROPOSER, name: 'Nicole' },
      errorMessage: <span>Error adding proposer</span>,
    })

    expect(screen.getByText('添加提案人失败')).toBeInTheDocument()
    expect(accountField()).toHaveTextContent('Treasury')
  })
})
