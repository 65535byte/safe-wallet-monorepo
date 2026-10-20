import { translateMessage } from '@/i18n'
import { useMemo } from 'react'
import type { WalletKitTypes } from '@reown/walletkit'
import useChains from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { capitalize } from '@safe-global/utils/utils/formatters'
import { getPeerName, isBlockedBridge, isWarnedBridge } from '../../services/utils'
import { BRAND_NAME } from '@/config/constants'

const NAME_FALLBACK = translateMessage('ui.thisDApp_af63ff28')
const NAME_PLACEHOLDER = '%%name%%'
const CHAIN_PLACEHOLDER = '%%chain%%'

export type CompatibilityWarningSeverity = 'error' | 'warning' | 'info'

const Warnings: Record<string, { severity: CompatibilityWarningSeverity; message: string }> = {
  BLOCKED_BRIDGE: {
    severity: 'error',
    message: translateMessage('ui.isABridgeThatIsIncompatible_865d56d7', { p0: NAME_PLACEHOLDER, p1: BRAND_NAME }),
  },
  WARNED_BRIDGE: {
    severity: 'warning',
    message: translateMessage('ui.whileBridgingViaPleaseMakeSure_e4dc0346', { p0: NAME_PLACEHOLDER }),
  },
  UNSUPPORTED_CHAIN: {
    severity: 'error',
    message: translateMessage('ui.doesNotSupportThisAccountS_6db7ab52', {
      p0: NAME_PLACEHOLDER,
      p1: CHAIN_PLACEHOLDER,
    }),
  },
  WRONG_CHAIN: {
    severity: 'info',
    message: translateMessage('ui.pleaseMakeSureThatTheDApp_1de26b21', { p0: CHAIN_PLACEHOLDER }),
  },
}

export const _getWarning = (origin: string, name: string, isUnsupportedChain: boolean) => {
  if (isUnsupportedChain) {
    return Warnings.UNSUPPORTED_CHAIN
  }

  if (isBlockedBridge(origin)) {
    return Warnings.BLOCKED_BRIDGE
  }

  if (isWarnedBridge(origin, name)) {
    return Warnings.WARNED_BRIDGE
  }

  return Warnings.WRONG_CHAIN
}

export const useCompatibilityWarning = (
  proposal: WalletKitTypes.SessionProposal,
  isUnsupportedChain: boolean,
): (typeof Warnings)[string] => {
  const { configs } = useChains()
  const { safe } = useSafeInfo()

  return useMemo(() => {
    const name = getPeerName(proposal.params.proposer) || NAME_FALLBACK
    const { origin } = proposal.verifyContext.verified
    let { message, severity } = _getWarning(origin, name, isUnsupportedChain)

    if (message.includes(NAME_PLACEHOLDER)) {
      message = message.replaceAll(NAME_PLACEHOLDER, name)
      if (message.startsWith(NAME_FALLBACK)) {
        message = capitalize(message)
      }
    }

    if (message.includes(CHAIN_PLACEHOLDER)) {
      const chainName = configs.find((chain) => chain.chainId === safe.chainId)?.chainName ?? 'this network'
      message = message.replaceAll(CHAIN_PLACEHOLDER, chainName)
    }

    return {
      message,
      severity,
    }
  }, [configs, isUnsupportedChain, proposal.params, proposal.verifyContext.verified, safe.chainId])
}
