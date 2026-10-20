import { fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import { asActivePolicy, MOCK_ADDRESSES, MOCK_SAFES, mockProposerPolicy } from '../../mocks/policies'
import ProposerDetails from '../index'

const mockUseWallet = jest.fn()
const mockConnectWallet = jest.fn()
const mockUseAddressBookItem = jest.fn()

jest.mock('@/hooks/wallets/useWallet', () => ({
  __esModule: true,
  default: () => mockUseWallet(),
}))

jest.mock('@/components/common/ConnectWallet/useConnectWallet', () => ({
  __esModule: true,
  default: () => mockConnectWallet,
}))

jest.mock('@/hooks/useAllAddressBooks', () => ({
  useAddressBookItem: (address: string, chainId: string) => mockUseAddressBookItem(address, chainId),
}))

const policy = asActivePolicy(mockProposerPolicy())
const proposer = policy.data.proposers[0]

describe('ProposerDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWallet.mockReturnValue({ address: '0x1111111111111111111111111111111111111111' })
    mockUseAddressBookItem.mockReturnValue(undefined)
  })

  it('should, when opened, name the proposer, the Safe it applies to and the owner who granted it', () => {
    mockUseAddressBookItem.mockImplementation((address: string) => {
      if (address === MOCK_ADDRESSES.bob) return { name: 'Robert' }
      if (address === MOCK_SAFES.treasury.address) return { name: 'Treasury' }
      if (address === MOCK_ADDRESSES.alice) return { name: 'Alice' }
      return undefined
    })

    render(<ProposerDetails policy={policy} proposer={proposer} onClose={jest.fn()} />)

    expect(screen.getByText('提案人角色')).toBeInTheDocument()
    expect(screen.getByText('Robert')).toBeInTheDocument()
    expect(screen.getByText('Treasury')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('8379')).toBeInTheDocument()
  })

  it('should, when the proposer has no address book entry, not show the grant label', () => {
    render(<ProposerDetails policy={policy} proposer={proposer} onClose={jest.fn()} />)

    expect(screen.queryByText('Bob')).not.toBeInTheDocument()
  })

  it('should, when no wallet is connected, offer to connect one', () => {
    mockUseWallet.mockReturnValue(null)

    render(<ProposerDetails policy={policy} proposer={proposer} onClose={jest.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '连接钱包' }))

    expect(mockConnectWallet).toHaveBeenCalledTimes(1)
  })

  it('should, when the wallet did not grant the role, keep the remove action out of reach', () => {
    render(<ProposerDetails policy={policy} proposer={proposer} onClose={jest.fn()} />)

    expect(screen.getByRole('button', { name: '移除提案人' })).toBeDisabled()
    expect(screen.getByText('仅授予此角色的签名人或提案人本人可以移除')).toBeInTheDocument()
  })

  it('should, when the wallet granted the role, enable the remove action', () => {
    mockUseWallet.mockReturnValue({ address: MOCK_ADDRESSES.alice })

    render(<ProposerDetails policy={policy} proposer={proposer} onClose={jest.fn()} />)

    expect(screen.getByRole('button', { name: '移除提案人' })).toBeEnabled()
    expect(screen.queryByText(/Only the signer who granted/)).not.toBeInTheDocument()
  })

  it('should, when the delegator clicks Remove proposer, open the remove confirmation', () => {
    mockUseWallet.mockReturnValue({ address: MOCK_ADDRESSES.alice })

    render(<ProposerDetails policy={policy} proposer={proposer} onClose={jest.fn()} />)

    expect(screen.queryByTestId('remove-proposer-modal')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '移除提案人' }))

    expect(screen.getByText('移除此提案人？')).toBeInTheDocument()
  })

  it('should, when the removal is kept, close the confirmation and leave the drawer open', async () => {
    mockUseWallet.mockReturnValue({ address: MOCK_ADDRESSES.alice })

    render(<ProposerDetails policy={policy} proposer={proposer} onClose={jest.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '移除提案人' }))
    fireEvent.click(screen.getByRole('button', { name: '否，保留' }))

    await waitFor(() => expect(screen.queryByTestId('remove-proposer-modal')).not.toBeInTheDocument())
    expect(screen.getByText('提案人角色')).toBeInTheDocument()
  })
})
