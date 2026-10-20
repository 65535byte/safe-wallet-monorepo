import { extendedSafeInfoBuilder } from '@/tests/builders/safe'
import { renderHook, getAppName } from '@/tests/test-utils'
import type { WalletKitTypes } from '@reown/walletkit'
import { useCompatibilityWarning } from '../useCompatibilityWarning'
import * as wcUtils from '../../../services/utils'
import * as useChains from '@/hooks/useChains'
import { chainBuilder } from '@/tests/builders/chains'

describe('useCompatibilityWarning', () => {
  const mockEthereumChain = chainBuilder().with({ chainId: '1', chainName: 'Ethereum', shortName: 'eth' }).build()

  beforeEach(() => {
    jest.spyOn(useChains, 'default').mockImplementation(() => ({
      configs: [mockEthereumChain],
      error: undefined,
      loading: false,
    }))
  })
  describe('should return an error for a dangerous bridge', () => {
    it('if the dApp is named', () => {
      jest.spyOn(wcUtils, 'isBlockedBridge').mockReturnValue(true)

      const proposal = {
        params: { proposer: { metadata: { name: 'Fake Bridge' } } },
        verifyContext: { verified: { origin: '' } },
      } as unknown as WalletKitTypes.SessionProposal

      const { result } = renderHook(() => useCompatibilityWarning(proposal, false))

      const appName = getAppName()

      expect(result.current).toEqual({
        message: `Fake Bridge is a bridge that is incompatible with ${appName} — the bridged funds will be lost. Consider using a different bridge.`,
        severity: 'error',
      })
    })

    it('if the dApp is not named', () => {
      jest.spyOn(wcUtils, 'isBlockedBridge').mockReturnValue(true)

      const proposal = {
        params: { proposer: { metadata: { name: '' } } },
        verifyContext: { verified: { origin: '' } },
      } as unknown as WalletKitTypes.SessionProposal

      const { result } = renderHook(() => useCompatibilityWarning(proposal, false))

      const appName = getAppName()

      expect(result.current).toEqual({
        message: `This dApp is a bridge that is incompatible with ${appName} — the bridged funds will be lost. Consider using a different bridge.`,
        severity: 'error',
      })
    })
  })

  describe('should return a warning for a risky bridge', () => {
    it('if the dApp is named', () => {
      jest.spyOn(wcUtils, 'isBlockedBridge').mockReturnValue(false)
      jest.spyOn(wcUtils, 'isWarnedBridge').mockReturnValue(true)

      const proposal = {
        params: { proposer: { metadata: { name: 'Fake Bridge' } } },
        verifyContext: { verified: { origin: '' } },
      } as unknown as WalletKitTypes.SessionProposal

      const { result } = renderHook(() => useCompatibilityWarning(proposal, false))

      expect(result.current).toEqual({
        message: '通过 Fake Bridge 跨链时，请确保目标地址与目标链上的 Safe 地址一致，否则资金将会丢失。',
        severity: 'warning',
      })
    })

    it('if the dApp is not named', () => {
      jest.spyOn(wcUtils, 'isBlockedBridge').mockReturnValue(false)
      jest.spyOn(wcUtils, 'isWarnedBridge').mockReturnValue(true)

      const proposal = {
        params: { proposer: { metadata: { name: '' } } },
        verifyContext: { verified: { origin: '' } },
      } as unknown as WalletKitTypes.SessionProposal

      const { result } = renderHook(() => useCompatibilityWarning(proposal, false))

      expect(result.current).toEqual({
        message: '通过 this dApp 跨链时，请确保目标地址与目标链上的 Safe 地址一致，否则资金将会丢失。',
        severity: 'warning',
      })
    })
  })

  describe('it should return an error for an unsupported chain', () => {
    it('if the dApp is named', () => {
      jest.spyOn(wcUtils, 'isBlockedBridge').mockReturnValue(false)
      jest.spyOn(wcUtils, 'isWarnedBridge').mockReturnValue(false)

      const proposal = {
        params: { proposer: { metadata: { name: 'Fake dApp' } } },
        verifyContext: { verified: { origin: '' } },
      } as unknown as WalletKitTypes.SessionProposal

      const { result } = renderHook(() => useCompatibilityWarning(proposal, true))

      expect(result.current).toEqual({
        message:
          "Fake dApp does not support this 个 Safe 账户's network (this network). Please switch to a Safe account on one of the supported networks below.",
        severity: 'error',
      })
    })

    it('if the dApp is not named', () => {
      jest.spyOn(wcUtils, 'isBlockedBridge').mockReturnValue(false)
      jest.spyOn(wcUtils, 'isWarnedBridge').mockReturnValue(false)

      const proposal = {
        params: { proposer: { metadata: { name: '' } } },
        verifyContext: { verified: { origin: '' } },
      } as unknown as WalletKitTypes.SessionProposal

      const { result } = renderHook(() => useCompatibilityWarning(proposal, true))

      expect(result.current).toEqual({
        message:
          "This dApp does not support this 个 Safe 账户's network (this network). Please switch to a Safe account on one of the supported networks below.",
        severity: 'error',
      })
    })
  })

  describe('should otherwise return info', () => {
    it('if chains are loaded', () => {
      jest.spyOn(wcUtils, 'isBlockedBridge').mockReturnValue(false)
      jest.spyOn(wcUtils, 'isWarnedBridge').mockReturnValue(false)

      const proposal = {
        params: { proposer: { metadata: { name: 'Fake dApp' } } },
        verifyContext: { verified: { origin: '' } },
      } as unknown as WalletKitTypes.SessionProposal

      const { result } = renderHook(() => useCompatibilityWarning(proposal, false), {
        initialReduxState: {
          safeInfo: {
            loading: false,
            loaded: true,
            error: undefined,
            data: {
              ...extendedSafeInfoBuilder().build(),
              address: { value: '' },
              chainId: '1',
            },
          },
        },
      })

      expect(result.current).toEqual({
        message: '请确保 dApp 连接至 Ethereum。',
        severity: 'info',
      })
    })

    it("if chains aren't loaded", () => {
      jest.spyOn(wcUtils, 'isBlockedBridge').mockReturnValue(false)
      jest.spyOn(wcUtils, 'isWarnedBridge').mockReturnValue(false)

      const proposal = {
        params: { proposer: { metadata: { name: 'Fake dApp' } } },
        verifyContext: { verified: { origin: '' } },
      } as unknown as WalletKitTypes.SessionProposal

      const { result } = renderHook(() => useCompatibilityWarning(proposal, false))

      expect(result.current).toEqual({
        message: '请确保 dApp 连接至 this network。',
        severity: 'info',
      })
    })
  })
})
