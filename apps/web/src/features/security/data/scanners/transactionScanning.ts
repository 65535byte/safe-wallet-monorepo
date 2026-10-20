import { translateMessage } from '@/i18n'
import type { SecurityScanner } from './types'
import { getSeverityFromScore } from './constants'

export const transactionScanningScanner: SecurityScanner = {
  id: 'transaction_scanning',
  scan: async (ctx) => {
    const { chainSupportsTransactionScanning } = ctx
    const now = new Date().toISOString()

    if (chainSupportsTransactionScanning) {
      const score = 100
      return {
        status: 'clear',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          {
            label: translateMessage('ui.status_8042eaf1'),
            value: translateMessage('ui.transactionsAreScannedBeforeExecution_ba508d92'),
          },
        ],
        remediation: '',
        lastChecked: now,
      }
    }

    const score = 70
    return {
      status: 'not_applicable',
      severity: getSeverityFromScore(score, { excluded: true }),
      score,
      evidence: [
        {
          label: translateMessage('ui.status_8042eaf1'),
          value: translateMessage('ui.transactionScanningNotAvailableOnThis_f63fea4f'),
        },
      ],
      remediation: '',
      lastChecked: now,
    }
  },
}
