import { translateMessage } from '@/i18n'
import type { SecurityScanner } from './types'
import { getSeverityFromScore } from './constants'

export const multichainSetupScanner: SecurityScanner = {
  id: 'multichain_setup',
  scan: async (ctx) => {
    const { isMultichain, multichainSignersConsistent, multichainDeviatingChains } = ctx
    const now = new Date().toISOString()

    if (!isMultichain) {
      const score = 100
      return {
        status: 'not_applicable',
        severity: getSeverityFromScore(score, { excluded: true }),
        score,
        evidence: [
          {
            label: translateMessage('ui.result_df9aef04'),
            value: translateMessage('ui.deployedOnASingleNetwork_6878e5c0'),
          },
        ],
        remediation: '',
        lastChecked: now,
      }
    }

    if (!multichainSignersConsistent) {
      const chainList =
        multichainDeviatingChains.length > 0
          ? multichainDeviatingChains.join(', ')
          : translateMessage('ui.multipleNetworks_9db80d86')

      const score = 30
      return {
        status: 'partial',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          {
            label: translateMessage('ui.result_df9aef04'),
            value: translateMessage('ui.signerSetupDiffersAcrossNetworks_a4c825b4'),
          },
          { label: translateMessage('ui.affected_7bfcfbbe'), value: chainList },
        ],
        remediation: translateMessage('ui.differentSignersAcrossNetworksCouldBreak_b5666330'),
        lastChecked: now,
      }
    }

    const score = 100
    return {
      status: 'clear',
      severity: getSeverityFromScore(score),
      score,
      evidence: [
        {
          label: translateMessage('ui.result_df9aef04'),
          value: translateMessage('ui.signerSetupIsConsistentAcrossAll_f11aaceb'),
        },
      ],
      remediation: '',
      lastChecked: now,
    }
  },
}
