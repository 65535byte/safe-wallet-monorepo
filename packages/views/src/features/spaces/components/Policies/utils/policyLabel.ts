import { translateMessage } from '@safe-global/views/i18n'
import { formatVisualAmount, shortenAddress } from '@safe-global/utils/utils/formatters'
import {
  hasRecoveryData,
  isPendingPolicy,
  isSpendingLimitPolicy,
  type Policy,
  type PolicyAllowance,
  type PolicyTokenInfo,
} from '../types'

/**
 * Labels are derived from the policy. CGW returns no policy name, so a row cannot fall back to an
 * empty or placeholder label. The table column and the detail panel title use the same functions
 * here, which is what keeps the two consistent.
 */

const MINUTES_PER_DAY = 1_440
/** Recovery windows are seconds, unlike allowance periods. */
const SECONDS_PER_DAY = 86_400

const RESET_PERIOD_LABELS: Record<number, string> = {
  0: translateMessage('ui.oneTime_f717c934'),
  5: translateMessage('ui.minutes_05a438cb'),
  30: translateMessage('ui.minutes_0c775585'),
  60: translateMessage('ui.hour_51445eea'),
  [MINUTES_PER_DAY]: translateMessage('ui.day_12fd6a70'),
  [MINUTES_PER_DAY * 7]: translateMessage('ui.week_db2da5cb'),
  [MINUTES_PER_DAY * 30]: translateMessage('ui.month_18523737'),
}

/** Returns the noun used after a slash, as in `5,000 USDC / day`. Takes MINUTES. */
export const getResetPeriodLabel = (resetPeriodMinutes: number): string =>
  RESET_PERIOD_LABELS[resetPeriodMinutes] ?? translateMessage('ui.minutes_6de053b5', { p0: resetPeriodMinutes })

export const POLICY_TYPE_LABELS = {
  'spending-limit': translateMessage('ui.spendingLimit_26abdb30'),
  recovery: translateMessage('ui.accountRecovery_a5ed5ee0'),
  proposer: translateMessage('ui.proposer_7ebd3069'),
} as const

export const formatTokenAmount = (amount: string, token: PolicyTokenInfo): string =>
  `${formatVisualAmount(amount, token.decimals)} ${token.symbol}`

/** For example `5,000 USDC / month`, or `5,000 USDC one time` if the allowance does not repeat. */
export const formatAllowance = (allowance: PolicyAllowance): string => {
  const amount = formatTokenAmount(allowance.amount, allowance.token)
  const period = getResetPeriodLabel(allowance.resetPeriodMinutes)

  return allowance.resetPeriodMinutes === 0
    ? translateMessage('ui.oneTime_df54e49f', { p0: amount })
    : `${amount} / ${period}`
}

const formatDays = (seconds: number): string => {
  const days = Math.round(seconds / SECONDS_PER_DAY)
  return translateMessage('ui.text_c380f30c', { p0: days })
}

const getAllowances = (policy: Extract<Policy, { type: 'spending-limit' }>): PolicyAllowance[] =>
  policy.data.spenders.flatMap((spender) => spender.allowances)

const describeSpendingLimit = (policy: Extract<Policy, { type: 'spending-limit' }>): string => {
  const allowances = getAllowances(policy)

  if (allowances.length === 0) return translateMessage('ui.noLimitsSet_f6f52d97')
  if (allowances.length === 1) return formatAllowance(allowances[0])

  const spenderCount = policy.data.spenders.length
  const spenders = translateMessage('ui.spender_36386bcd', { p0: spenderCount })
  const tokens = translateMessage('ui.limit_db7b22d6', { p0: allowances.length })

  return `${spenders} · ${tokens}`
}

/**
 * The line shown under the policy type. A spending limit with several spenders and tokens has no
 * single allowance that represents it, so the summary counts them instead.
 */
export const getPolicySummary = (policy: Policy): string => {
  if (isSpendingLimitPolicy(policy)) {
    if (!isPendingPolicy(policy) || policy.operation !== 'remove') return describeSpendingLimit(policy)

    // Still enforced until the transaction executes, so the copy is in progress, not done.
    if (getAllowances(policy).length > 0)
      return translateMessage('ui.removing_706cb34f', { p0: describeSpendingLimit(policy) })

    const { spenders } = policy.data
    return translateMessage('ui.removingSpender_7fbb1a6e', { p0: spenders.length })
  }

  if (hasRecoveryData(policy)) {
    return translateMessage('ui.reviewWindow_507667e0', { p0: formatDays(policy.data.reviewWindowSeconds) })
  }

  return translateMessage('ui.neverExpires_0870c4dc')
}

/** The name shown in the RULE column and as the detail panel title. */
export const getPolicyLabel = (policy: Policy): string => POLICY_TYPE_LABELS[policy.type]

/** "Name (0x1234...abcd)" when the contact has a name, otherwise the shortened address alone. */
export const formatContactLabel = (address: string, name?: string): string =>
  name ? `${name} (${shortenAddress(address)})` : shortenAddress(address)
