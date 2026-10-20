import { translateMessage } from '@/i18n'
import type { SecurityScanner } from './types'
import { getSeverityFromScore } from './constants'

/** Up to this many queued txs is fine — clear status. */
const CLEAR_QUEUE_MAX = 2
/** From this many queued txs onwards the queue is treated as a high-severity issue. */
const LARGE_QUEUE_MIN = 5

export const pendingTxScanner: SecurityScanner = {
  id: 'pending_tx',
  scan: async (ctx) => {
    const { queuedTxCount } = ctx
    const now = new Date().toISOString()

    if (queuedTxCount <= CLEAR_QUEUE_MAX) {
      const score = 100
      return {
        status: 'clear',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          {
            label: translateMessage('ui.status_8042eaf1'),
            value:
              queuedTxCount === 0
                ? translateMessage('ui.noPendingTransactions_233bb81d')
                : translateMessage('ui.pendingTransaction_70946ba6', { p0: queuedTxCount }),
          },
        ],
        remediation: '',
        lastChecked: now,
      }
    }

    if (queuedTxCount >= LARGE_QUEUE_MIN) {
      const score = 25
      return {
        status: 'issue',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          {
            label: translateMessage('ui.queued_784b9d63'),
            value: translateMessage('ui.transactions_16ba87b0', { p0: queuedTxCount }),
          },
        ],
        remediation: translateMessage('ui.aLargeQueueIncreasesTheRisk_8bce9b0e'),
        lastChecked: now,
      }
    }

    const score = 60
    return {
      status: 'partial',
      severity: getSeverityFromScore(score),
      score,
      evidence: [
        {
          label: translateMessage('ui.queued_784b9d63'),
          value: translateMessage('ui.transactions_16ba87b0', { p0: queuedTxCount }),
        },
      ],
      remediation: translateMessage('ui.pendingTransactionsThatSitUnexecutedCan_cef62232'),
      lastChecked: now,
    }
  },
}
