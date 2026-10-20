import { translateMessage } from '@/i18n'
import { Severity } from '@safe-global/utils/features/safe-shield/types'
import {
  CheckStatus,
  SAFENET_EXPLORER_URL,
  type PublicCheckStatus,
  type UnavailableReason,
} from '@safe-global/utils/features/safenet-checks'

export type SafenetStatusPresentation = {
  /** Safe Shield severity vocabulary — drives SeverityIcon and its colors. */
  severity: Severity
  /** Short state name for compact placements. */
  label: string
  /** Full-sentence copy for the flow surface. */
  copy: string
}

/**
 * UNAVAILABLE has no verdict presentation — see {@link UNAVAILABLE_PRESENTATION},
 * which only the flow section renders.
 */
export const STATUS_PRESENTATION: Record<
  Exclude<PublicCheckStatus, CheckStatus.UNAVAILABLE>,
  SafenetStatusPresentation
> = {
  [CheckStatus.SUBMITTED]: {
    severity: Severity.INFO,
    label: translateMessage('ui.submitted_267f4ba8'),
    copy: translateMessage('ui.checkSubmittedToSafenet_ab2f0ec2'),
  },
  [CheckStatus.IN_PROGRESS]: {
    severity: Severity.INFO,
    label: translateMessage('ui.simulating_2930a886'),
    copy: translateMessage('ui.safenetIsSimulatingThisTransaction_9b95e08b'),
  },
  [CheckStatus.BENIGN]: {
    severity: Severity.OK,
    label: translateMessage('ui.noIssuesFound_caa28585'),
    copy: translateMessage('ui.safenetFoundNoIssues_005900b4'),
  },
  [CheckStatus.MALICIOUS]: {
    severity: Severity.CRITICAL,
    label: translateMessage('ui.riskDetected_7f12b903'),
    copy: translateMessage('ui.safenetFlaggedThisAddressTransactionAs_123353cd'),
  },
  [CheckStatus.TIMED_OUT]: {
    severity: Severity.ERROR,
    label: translateMessage('ui.checkFailed_9c0a0139'),
    copy: translateMessage('ui.safenetCheckIsUnavailableYouCan_5f2cd73f'),
  },
}

/**
 * None of the three UNAVAILABLE meanings is a verdict, so all stay neutral: a
 * muted icon and the default text colors, never error or warning ones. No
 * severity field: these states have no verdict to color from.
 */
export const UNAVAILABLE_PRESENTATION: Record<UnavailableReason, Pick<SafenetStatusPresentation, 'label' | 'copy'>> = {
  NO_CHECK: {
    label: translateMessage('ui.notChecked_13d9791c'),
    copy: translateMessage('ui.noSafenetCheckWasRequestedFor_edf36e11'),
  },
  READ_FAILED: {
    label: translateMessage('ui.couldnTReadSafenetStatus_0210fcd0'),
    copy: translateMessage('ui.weCouldnTReachSafenetTo_cf8a2f95'),
  },
  // Found nothing where it looked, which never proves that no check was requested.
  WINDOW_UNCERTAIN: {
    label: translateMessage('ui.safenetStatusUnknown_f58565d3'),
    copy: translateMessage('ui.weCouldnTConfirmWhetherSafenet_a7a2c005'),
  },
}

/** Shown before the first signature, while no check exists yet. */
export const SAFENET_ABOUT = translateMessage('ui.independentSentinelsSimulateThisTransactionAnd_009d837d')

export const PRE_CHECK_COPY = {
  multisig: translateMessage('ui.theCheckStartsAfterYouSign_ad87efcd'),
  single: translateMessage('ui.theCheckStartsAfterYouSign_a0332015'),
  executeNow: translateMessage('ui.theCheckStartsAfterYouSign_bd6e8ee6'),
}

export const CHIP_VARIANT = {
  [CheckStatus.SUBMITTED]: 'info',
  [CheckStatus.IN_PROGRESS]: 'info',
  [CheckStatus.BENIGN]: 'positive',
  [CheckStatus.MALICIOUS]: 'negative',
  [CheckStatus.TIMED_OUT]: 'warning',
} as const satisfies Record<Exclude<PublicCheckStatus, CheckStatus.UNAVAILABLE>, string>

export const STALE_NOTE = translateMessage('ui.statusMayBeOutOfDate_1c7acd0b')

export const MULTIPLE_RULES_TITLE = translateMessage('ui.risksDetected_06fc0df1')

export const SAFENET_DOCS_URL = 'https://docs.safefoundation.org/safenet'

/** The check's page on the Safenet explorer — per-sentinel detail, not proof of a verdict. */
export const getSafenetExplorerUrl = (chainId: string, safeTxHash: string): string =>
  `${SAFENET_EXPLORER_URL}/#/safeTx?chainId=${chainId}&safeTxHash=${safeTxHash}`

export type ResolvedPresentation = SafenetStatusPresentation & {
  /** Render the icon neutral — set for the non-verdict UNAVAILABLE states. */
  muted: boolean
}

/**
 * What the flow section renders, or `undefined` for the states it must skip:
 * an unresolved first read, and a pinned verdict whose snapshot a failed
 * refetch dropped (the next poll restores it).
 */
export const resolvePresentation = (
  publicStatus: PublicCheckStatus,
  unavailableReason: UnavailableReason | undefined,
  hasSnapshot: boolean,
): ResolvedPresentation | undefined => {
  if (publicStatus === CheckStatus.UNAVAILABLE) {
    if (!unavailableReason) return undefined
    return { ...UNAVAILABLE_PRESENTATION[unavailableReason], severity: Severity.INFO, muted: true }
  }

  if (!hasSnapshot) return undefined

  return { ...STATUS_PRESENTATION[publicStatus], muted: false }
}
