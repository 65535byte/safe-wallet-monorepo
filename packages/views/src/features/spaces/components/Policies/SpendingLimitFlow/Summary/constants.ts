import { translateMessage } from '@safe-global/views/i18n'
/** Row labels, verbatim from the frame. */
export const APPLIES_TO_LABEL = translateMessage('ui.appliesTo_4fadde80')
export const SPENDER_LABEL = translateMessage('ui.spender_77803664')
export const LIMITS_LABEL = translateMessage('ui.limits_6692cf92')

type CanonicalFrequency = {
  /** Row label, e.g. `Weekly`. */
  label: string
  /** Callout adjective, e.g. `weekly`. */
  adjective: string
}

/** The four production reset periods, keyed by minutes. Any other value falls back to the form's own option label. */
export const CANONICAL_FREQUENCIES: Readonly<Partial<Record<string, CanonicalFrequency>>> = {
  '0': { label: translateMessage('ui.oneTimeOnly_7a170170'), adjective: 'one-time' },
  '1440': { label: translateMessage('ui.daily_56d95462'), adjective: 'daily' },
  '10080': { label: translateMessage('ui.weekly_4cf15a14'), adjective: 'weekly' },
  '43200': { label: translateMessage('ui.monthly_a318002e'), adjective: 'monthly' },
}

export const CALLOUT_TITLE_PREFIX = translateMessage('ui.youAreGiving_49ff80f4')
export const EDIT_CALLOUT_DESCRIPTION = translateMessage('ui.nothingChangesOnChainUntilThis_c9dd0e68')
export const EDIT_CALLOUT_NO_CHANGES = translateMessage('ui.thisEditChangesNothing_a3a1fc69')
export const CALLOUT_NOUN_SINGULAR = translateMessage('ui.spendingLimit_ff0d50cc')
export const CALLOUT_NOUN_PLURAL = translateMessage('ui.spendingLimits_9350d8d5')
export const CALLOUT_DESCRIPTION_SINGULAR = translateMessage('ui.onceThisTransactionExecutesWithdrawalsUp_1e1b128f')
export const CALLOUT_DESCRIPTION_PLURAL = translateMessage('ui.onceThisTransactionExecutesWithdrawalsUp_4a8774f0')

/** How each row of an edit is labelled. The create flow sets no `change`, so none of these show there. */
export const CHANGE_BADGE = {
  added: { label: translateMessage('ui.added_62008174'), variant: 'success' },
  changed: { label: translateMessage('ui.changed_0bb7a626'), variant: 'warning' },
  unchanged: { label: translateMessage('ui.unchanged_c7ba7ef7'), variant: 'outline' },
  removed: { label: translateMessage('ui.removed_312f80f2'), variant: 'destructive' },
} as const satisfies Record<string, { label: string; variant: 'success' | 'warning' | 'outline' | 'destructive' }>
