import { translateMessage } from '@/i18n'
import { ZERO_ADDRESS } from '@safe-global/utils/utils/constants'
import type { SecurityScanner } from './types'
import { getSeverityFromScore } from './constants'
import { isDelayModifier } from './recoveryDetection'

export const recoveryScanner: SecurityScanner = {
  id: 'recovery',
  scan: async (ctx) => {
    const { chainSupportsRecovery, modules, chainId } = ctx
    const now = new Date().toISOString()

    if (!chainSupportsRecovery) {
      const score = 100
      return {
        status: 'not_applicable',
        severity: getSeverityFromScore(score, { excluded: true }),
        score,
        evidence: [
          {
            label: translateMessage('ui.status_8042eaf1'),
            value: translateMessage('ui.notAvailableOnThisNetwork_9d67ca28'),
          },
        ],
        remediation: '',
        lastChecked: now,
      }
    }

    const activeModules = (modules ?? []).filter((m) => m.value !== ZERO_ADDRESS)

    // No modules at all — recovery is definitely not configured
    if (activeModules.length === 0) {
      const score = 20
      return {
        status: 'issue',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          {
            label: translateMessage('ui.status_8042eaf1'),
            value: translateMessage('ui.noRecoveryConfigured_a81545d0'),
          },
        ],
        remediation: translateMessage('ui.ifAllSignersLoseAccessThis_17dec1dd'),
        lastChecked: now,
      }
    }

    // Check if any module is a known Delay Modifier
    const hasDelayModifier = activeModules.some((m) => isDelayModifier(chainId, m.value, m.name))

    if (hasDelayModifier) {
      const score = 100
      return {
        status: 'clear',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          {
            label: translateMessage('ui.status_8042eaf1'),
            value: translateMessage('ui.recoveryModuleConfigured_c12dd6af'),
          },
        ],
        remediation: '',
        lastChecked: now,
      }
    }

    // Modules exist but none are a recognized Delay Modifier
    const score = 60
    return {
      status: 'partial',
      severity: getSeverityFromScore(score),
      score,
      evidence: [
        { label: translateMessage('ui.status_8042eaf1'), value: translateMessage('ui.recoveryNotConfirmed_70317e40') },
      ],
      remediation: translateMessage('ui.thisHasModulesInstalledButNone_eb998b04'),
      lastChecked: now,
    }
  },
}
