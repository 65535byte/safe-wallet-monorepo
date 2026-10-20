import { translateMessage } from '@/i18n'
import {
  AttestationVerificationStatus,
  CheckEventType,
  type NormalizedCheckEvent,
  type SafenetCheckSnapshot,
  type SentinelRevealedEvent,
} from '@safe-global/utils/features/safenet-checks'
import {
  isSafenetRuleId,
  SAFENET_RULE_IDS,
  SAFENET_RULES,
  type SafenetRuleCopy,
  type SafenetRuleId,
} from './rejectionRules'

export type FlaggedRule = SafenetRuleCopy & {
  id: SafenetRuleId
  /** How many sentinels cited this rule. */
  citedBy: number
}

export type RejectionSummary = {
  /** Distinct rules cited, most-cited first. */
  rules: FlaggedRule[]
  /** Sentinels that rejected the transaction. */
  flagged: number
  /** Sentinels that revealed a vote either way. */
  revealed: number
  /** A rejecting sentinel gave a reason that is not a known rule code. */
  unrecognised: boolean
}

const isReveal = (event: NormalizedCheckEvent): event is SentinelRevealedEvent =>
  event.type === CheckEventType.SENTINEL_REVEALED

/** Folds the sentinel reveals of one check into the rules they cite and the "N of M" count. */
export const summariseRejection = (events: ReadonlyArray<NormalizedCheckEvent>): RejectionSummary => {
  // Events arrive sorted by (block, logIndex), so the latest reveal per sentinel wins.
  const votes = new Map<string, SentinelRevealedEvent>()
  for (const event of events) {
    if (isReveal(event)) votes.set(event.sentinel.toLowerCase(), event)
  }

  const citations = new Map<SafenetRuleId, number>()
  let flagged = 0
  let unrecognised = false

  for (const vote of votes.values()) {
    if (vote.approved) continue
    flagged++
    const reason = vote.reason.trim()
    if (isSafenetRuleId(reason)) {
      citations.set(reason, (citations.get(reason) ?? 0) + 1)
    } else {
      unrecognised = true
    }
  }

  const rules = [...citations.entries()]
    .map(([id, citedBy]) => ({ id, citedBy, ...SAFENET_RULES[id] }))
    .sort((a, b) => b.citedBy - a.citedBy || SAFENET_RULE_IDS.indexOf(a.id) - SAFENET_RULE_IDS.indexOf(b.id))

  return { rules, flagged, revealed: votes.size, unrecognised }
}

/** "3 of 4 sentinels flagged this." — null when no sentinel revealed a vote. */
export const formatFlaggedCount = ({ flagged, revealed }: RejectionSummary): string | null =>
  revealed > 0
    ? translateMessage('ui.ofFlaggedThis_208f2726', {
        p0: flagged,
        p1: revealed,
        p2: revealed === 1 ? 'sentinel' : 'sentinels',
      })
    : null

/** Checked in order: the furthest step a failed check reached names what was missing. */
const FAILURE_REASONS: ReadonlyArray<[ReadonlyArray<CheckEventType>, string]> = [
  [[CheckEventType.DISPUTE_OUT_OF_SCOPE], translateMessage('ui.safenetGaveNoRulingBecauseThis_91e1a372')],
  [
    [CheckEventType.DISPUTE_TRIGGERED, CheckEventType.ARBITRATION_TIMED_OUT],
    translateMessage('ui.sentinelsDisagreedAndTheDisputeGot_aad5e0d0'),
  ],
  [[CheckEventType.ORACLE_RESULT], translateMessage('ui.sentinelsVotedButTheValidatorsDid_596f5aaa')],
  [[CheckEventType.SENTINEL_REVEALED], translateMessage('ui.notEnoughSentinelsVotedBeforeThe_ced707c0')],
]

/** Why a check failed, read from the lifecycle step it never got past. */
export const explainFailure = ({
  events,
  attestation,
}: Pick<SafenetCheckSnapshot, 'events' | 'attestation'>): string => {
  if (attestation.status === AttestationVerificationStatus.INVALID) {
    return translateMessage('ui.theValidatorsSignatureCouldNotBe_17eb24e0')
  }
  const seen = new Set(events.map(({ type }) => type))
  const match = FAILURE_REASONS.find(([types]) => types.some((type) => seen.has(type)))
  return match ? match[1] : translateMessage('ui.noSentinelVotedBeforeTheDeadline_7b213cba')
}
