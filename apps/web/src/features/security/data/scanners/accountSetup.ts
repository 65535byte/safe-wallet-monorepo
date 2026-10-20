import { translateMessage } from '@/i18n'
import type { SecurityScanner } from './types'
import { getSeverityFromScore } from './constants'
import { hasRecoverySetup } from './recoveryDetection'

export const accountSetupScanner: SecurityScanner = {
  id: 'account_setup',
  scan: async (ctx) => {
    const { owners, threshold, modules, chainId, chainSupportsRecovery } = ctx
    const ownerCount = owners.length
    const now = new Date().toISOString()

    if (ownerCount === 0) {
      // Owner data hasn't loaded — distinct from "loaded and shows 0 owners" (impossible
      // for a real Safe). Return inconclusive so a transient missing-data state during
      // scan doesn't penalize the score or flag the Safe with a "weak threshold" entry
      // that flips on rescan once `safeInfo.owners` populates.
      const score = 50
      return {
        status: 'inconclusive',
        severity: getSeverityFromScore(score, { excluded: true }),
        score,
        evidence: [translateMessage('ui.signerDataNotYetAvailable_16febc0a')],
        remediation: translateMessage('ui.signerInformationWillLoadShortly_2d857210'),
        lastChecked: now,
      }
    }

    const baseEvidence = [
      { label: translateMessage('ui.signers_e1137966'), value: String(ownerCount) },
      { label: translateMessage('ui.threshold_60fbd8eb'), value: `${threshold} / ${ownerCount}` },
    ]

    // Simple majority = strictly more than half. For even N this is N/2 + 1, not N/2.
    const simpleMajority = Math.floor(ownerCount / 2) + 1

    // n/n Safe (threshold === owner count, incl. 1/1): losing any single signer permanently
    // locks the Safe. Acceptable only when account recovery mitigates that lockout risk.
    if (threshold === ownerCount) {
      // Recovery isn't available on this chain — the lockout risk can't be mitigated, so this
      // is the most severe case.
      if (!chainSupportsRecovery) {
        const score = 10
        return {
          status: 'issue',
          severity: getSeverityFromScore(score),
          score,
          evidence: [...baseEvidence, translateMessage('ui.losingAnySignerWouldPermanentlyLock_60b82430')],
          remediation: translateMessage('ui.addAnotherSignerAndLowerThe_f8fed010'),
          lastChecked: now,
        }
      }

      // Recovery configured → the lockout risk is mitigated.
      if (hasRecoverySetup(chainId, modules)) {
        const score = 100
        return {
          status: 'clear',
          severity: getSeverityFromScore(score),
          score,
          evidence: baseEvidence,
          remediation: '',
          lastChecked: now,
        }
      }

      // Recovery is available but not configured — fixable, so flag as a (non-critical) risk.
      const score = 40
      const remediation =
        ownerCount === 1
          ? translateMessage('ui.setUpAccountRecoveryOrAdd_4e60e8bb')
          : translateMessage('ui.setUpAccountRecoverySoThis_9cc254e5')
      return {
        status: 'issue',
        severity: getSeverityFromScore(score),
        score,
        evidence: [...baseEvidence, translateMessage('ui.losingAnySignerWouldPermanentlyLock_60b82430')],
        remediation,
        lastChecked: now,
      }
    }

    // Threshold of 1 with multiple owners = any single signer can execute.
    if (threshold === 1) {
      const score = 15
      // For a 2-owner Safe, recommending threshold = 2 would create a single point of failure
      // (losing any one key permanently locks the Safe). Recommend adding a signer instead.
      const remediation =
        ownerCount === 2
          ? translateMessage('ui.addAnotherSignerAndIncreaseThe_b1974d8f')
          : translateMessage('ui.increaseTheThresholdToAtLeast_40aacbbe', { p0: simpleMajority, p1: ownerCount })
      return {
        status: 'issue',
        severity: getSeverityFromScore(score),
        score,
        evidence: [...baseEvidence, translateMessage('ui.anySingleSignerCanApproveTransactions_774a6076')],
        remediation,
        lastChecked: now,
      }
    }

    // Threshold below simple majority = suboptimal
    if (threshold < simpleMajority) {
      const score = 60
      return {
        status: 'partial',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          ...baseEvidence,
          {
            label: translateMessage('ui.recommended_99a8fb6a'),
            value: translateMessage('ui.atLeastOf_59df1934', { p0: simpleMajority, p1: ownerCount }),
          },
        ],
        remediation: translateMessage('ui.considerIncreasingTheThresholdToOf_550ca413', {
          p0: simpleMajority,
          p1: ownerCount,
        }),
        lastChecked: now,
      }
    }

    // Good setup: threshold >= simple majority
    const score = 100
    return {
      status: 'clear',
      severity: getSeverityFromScore(score),
      score,
      evidence: baseEvidence,
      remediation: '',
      lastChecked: now,
    }
  },
}
