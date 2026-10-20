import { translateMessage } from '@/i18n'
import { identifyOfficialFallbackHandler } from '@safe-global/utils/services/contracts/deployments'
import { sameAddress } from '@safe-global/utils/utils/addresses'
import { ZERO_ADDRESS } from '@safe-global/utils/utils/constants'
import type { SecurityScanner } from './types'
import { getSeverityFromScore } from './constants'
// Import directly from helpers/utils (not from '@/features/swap') to avoid pulling
// the swap feature handle (via createFeatureHandle) into the scanner module graph —
// that creates a circular dependency with @/features/__core__ in test environments.
import { TWAP_FALLBACK_HANDLER, TWAP_FALLBACK_HANDLER_NETWORKS } from '@/features/swap/helpers/utils'

type HandlerMatch = 'compatibility' | 'extensible' | 'twap' | null

const identifyFallbackHandler = (address: string, chainId: string): HandlerMatch => {
  const officialHandler = identifyOfficialFallbackHandler(address, chainId)
  if (officialHandler) return officialHandler
  if (TWAP_FALLBACK_HANDLER_NETWORKS.includes(chainId) && sameAddress(address, TWAP_FALLBACK_HANDLER)) return 'twap'
  return null
}

const HANDLER_LABELS: Record<Exclude<HandlerMatch, null>, string> = {
  compatibility: translateMessage('ui.officialFallbackHandler_2d611365'),
  extensible: translateMessage('ui.officialExtensibleFallbackHandler_ac740f04'),
  twap: translateMessage('ui.coWProtocolTWAPHandler_3f6a1261'),
}

export const fallbackHandlerScanner: SecurityScanner = {
  id: 'fallback_handler',
  scan: async (ctx) => {
    const { fallbackHandler, chainId } = ctx
    const now = new Date().toISOString()

    const hasHandler = fallbackHandler !== null && fallbackHandler.value !== ZERO_ADDRESS

    if (!hasHandler) {
      const score = 100
      return {
        status: 'clear',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          {
            label: translateMessage('ui.status_8042eaf1'),
            value: translateMessage('ui.noFallbackHandlerSet_44bed8fb'),
          },
        ],
        remediation: '',
        lastChecked: now,
      }
    }

    const handlerLabel = fallbackHandler.name ?? fallbackHandler.value
    const match = identifyFallbackHandler(fallbackHandler.value, chainId)

    if (match) {
      const score = 100
      return {
        status: 'clear',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          { label: translateMessage('ui.handler_e85e8767'), value: handlerLabel },
          { label: translateMessage('ui.status_8042eaf1'), value: HANDLER_LABELS[match] },
        ],
        remediation: '',
        lastChecked: now,
      }
    }

    const score = 20
    return {
      status: 'issue',
      severity: getSeverityFromScore(score),
      score,
      evidence: [
        { label: translateMessage('ui.handler_e85e8767'), value: handlerLabel },
        {
          label: translateMessage('ui.status_8042eaf1'),
          value: translateMessage('ui.unrecognizedFallbackHandler_8d592d19'),
        },
      ],
      remediation: translateMessage('ui.theFallbackHandlerIsNotA_1ba0dedd'),
      lastChecked: now,
    }
  },
}
