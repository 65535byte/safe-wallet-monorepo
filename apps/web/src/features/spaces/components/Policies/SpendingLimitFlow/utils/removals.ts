import { translateMessage } from '@/i18n'
import uniqWith from 'lodash/uniqWith'
import { sameAddress } from '@safe-global/utils/utils/addresses'
import type { SpendingLimitState } from '@/features/spending-limits'
import type {
  RemovalCopy,
  SpendingLimitPolicyFormValues,
} from '@safe-global/views/features/spaces/components/Policies/SpendingLimitFlow/types'
import { filledLimits } from '@safe-global/views/features/spaces/components/Policies/SpendingLimitFlow/utils/filledLimits'

/** What an edit would take away, counted for the notice that stands in for the removed rows. */
export type PendingRemovals = {
  /** On-chain spenders the form no longer carries at all. */
  spenders: string[]
  /** On-chain (spender, token) limits the form no longer carries. */
  limits: number
}

/**
 * Works out what the form has dropped since it opened.
 *
 * @param baseline - The limits the Safe holds, read over RPC.
 * @param values - The form as it stands, half-typed rows included.
 * @returns The spenders that would lose every limit, and how many limits would go in total.
 */
export const findPendingRemovals = (
  baseline: readonly SpendingLimitState[],
  values: SpendingLimitPolicyFormValues,
): PendingRemovals => {
  const rows = filledLimits(values)
  const carded = values.spenders.map((spender) => spender.address).filter(Boolean)
  const onChainSpenders = uniqWith(
    baseline.map((limit) => limit.beneficiary),
    sameAddress,
  )

  // Rows that left the page, counted per spender rather than matched by key: pointing a row at a
  // different token replaces a limit without removing one, and the row is still there to be read.
  const limits = onChainSpenders.reduce((total, spender) => {
    const before = baseline.filter((limit) => sameAddress(limit.beneficiary, spender)).length
    const after = rows.filter((row) => sameAddress(row.address, spender)).length
    return total + Math.max(0, before - after)
  }, 0)

  return { spenders: onChainSpenders.filter((spender) => !carded.some((kept) => sameAddress(kept, spender))), limits }
}

/** The notice's two lines: what goes, and what that means before the transaction executes. */
export type { RemovalCopy } from '@safe-global/views/features/spaces/components/Policies/SpendingLimitFlow/types'

const STAYS_IN_FORCE = translateMessage('ui.theyCanStillBeSpentUntil_d7b0c251')
const POLICY_GOES = translateMessage('ui.executingItRemovesTheSpendingLimit_e9e0369c')

/**
 * Puts what would be removed into words.
 *
 * @param removals - The counts from {@link findPendingRemovals}.
 * @param isEmptyPolicy - Whether the form has no spender left, which removes the policy itself and
 *   so earns a second sentence.
 * @returns The notice's title and description.
 */
export const describeRemovals = (removals: PendingRemovals, isEmptyPolicy: boolean): RemovalCopy => {
  const { spenders, limits } = removals
  const limitCopy = translateMessage('ui.limit_db7b22d6', { p0: limits })
  const title =
    spenders.length > 0
      ? translateMessage('ui.spenderAndWillBeRemoved_6a9d8fa7', { p0: spenders.length, p1: limitCopy })
      : translateMessage('ui.willBeRemoved_169ac918', { p0: limitCopy })

  return { title, description: isEmptyPolicy ? `${STAYS_IN_FORCE} ${POLICY_GOES}` : STAYS_IN_FORCE }
}
