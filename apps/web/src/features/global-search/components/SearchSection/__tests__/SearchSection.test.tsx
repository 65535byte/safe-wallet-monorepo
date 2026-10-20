import { render, screen } from '@/tests/test-utils'
import SearchSection from '../SearchSection'

// `useIsQualifiedSafe` resolves asynchronously in the app: it is false until the space
// and space-safes queries settle, then flips to true when the Safe belongs to a space.
let mockIsQualifiedSafe = false

jest.mock('@/hooks/wallets/useWallet')

jest.mock('@/features/swap', () => ({
  useIsSwapFeatureEnabled: () => true,
}))

jest.mock('@/features/spaces', () => ({
  useIsQualifiedSafe: () => mockIsQualifiedSafe,
  useCurrentSpaceId: () => null,
  useSpaceSafes: () => ({
    allSafes: [
      {
        chainId: '1',
        address: '0x1111111111111111111111111111111111111111',
        isReadOnly: false,
        isPinned: false,
        lastVisited: 0,
        name: 'Space safe',
      },
    ],
    isLoading: false,
  }),
  SafeCardReadOnly: () => null,
}))

jest.mock('@/hooks/safes', () => ({
  useAllSafesGrouped: () => ({
    allMultiChainSafes: [],
    allSingleSafes: [
      {
        chainId: '1',
        address: '0x2222222222222222222222222222222222222222',
        isReadOnly: false,
        isPinned: true,
        lastVisited: 0,
        name: 'Pinned safe',
      },
    ],
  }),
  isMultiChainSafeItem: () => false,
  flattenSafeItems: (items: unknown[]) => items,
}))

describe('SearchSection', () => {
  beforeEach(() => {
    mockIsQualifiedSafe = false
  })

  it('renders the always-active section', () => {
    render(<SearchSection query="" />)

    expect(screen.getByText('前往')).toBeInTheDocument()
  })

  it('swaps sections when the Safe is resolved as part of a space', () => {
    const { rerender } = render(<SearchSection query="" />)

    expect(screen.getByText('我的账户')).toBeInTheDocument()
    expect(screen.queryByText('8379 账户')).not.toBeInTheDocument()

    mockIsQualifiedSafe = true
    rerender(<SearchSection query="" />)

    expect(screen.getByText('8379 账户')).toBeInTheDocument()
    expect(screen.queryByText('我的账户')).not.toBeInTheDocument()
  })
})
