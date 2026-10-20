import { translateMessage } from '@safe-global/views/i18n'
import type { PendingPolicyOperation } from '../types'
import type { PendingTxOutcome } from './resolveState'
import { formatAwaitingSignatures } from './format'

export const PENDING_BANNER_TITLE: Record<PendingPolicyOperation, string> = {
  create: translateMessage('ui.theSpendingLimitIsNotActive_9262eebb'),
  remove: translateMessage('ui.thisSpendingLimitIsStillActive_7aaec758'),
  update: translateMessage('ui.theCurrentLimitsStillApplyUntil_199e7700'),
}

const OPERATION_TAIL: Record<PendingPolicyOperation, string> = {
  create: translateMessage('ui.toActivate_54cb3f04'),
  remove: translateMessage('ui.toRemoveIt_7409a9cf'),
  update: translateMessage('ui.toApplyTheChange_0e330302'),
}

export const signAndExecuteLine = (operation: PendingPolicyOperation): string =>
  translateMessage('ui.signAndExecuteTheTransaction_9bbe7ffd', { p0: OPERATION_TAIL[operation] })

export const executeLine = (operation: PendingPolicyOperation): string =>
  translateMessage('ui.executeTheTransaction_849a3dbd', { p0: OPERATION_TAIL[operation] })

export const CONNECT_TO_SIGN_LINE = translateMessage('ui.connectASignerWalletToSign_aa5cb5ef')

export const connectHelper = (safeName: string): string =>
  translateMessage('ui.connectASignerWalletOfTo_723ac0da', { p0: safeName })

export const ACTIVE_CONNECT_HELPER = translateMessage('ui.connectASignerWalletToEdit_bc25bbae')

export const NOT_A_SIGNER_HELPER = translateMessage('ui.onlySignersOfThisAccountCan_161fcb50')

export const UNENFORCED_BANNER_TITLE = translateMessage('ui.spendingLimitModuleDeleted_56ce2c3d')

export const UNENFORCED_BANNER_LINE = translateMessage('ui.spendingLimitNotAppliedAsModule_fd92448a')

export const UNENFORCED_CONNECT_HELPER = translateMessage('ui.connectASignerWalletToAdd_95285583')

export const UNENFORCED_NOT_A_SIGNER_HELPER = translateMessage('ui.onlySignersOfThisAccountCan_2aa62e62')

export const TX_LOAD_FAILED_HELPER = translateMessage('ui.theTransactionCouldnTBeLoaded_5d8ece53')

/** The page withholds `onEdit` and `onEnableModule` only when the Workspace's plan does not include policies. */
export const EDIT_LOCKED_HELPER = translateMessage('ui.upgradeToBusinessToEditSpending_47ac6149')

export const ENABLE_LOCKED_HELPER = translateMessage('ui.upgradeToBusinessToAddThe_2d21b213')

/** The trailing full stop lives here, not at the call site, so the sentence is punctuated in one place. */
export const signedAndWaitingLine = (missing: number): string =>
  translateMessage('ui.youVeSigned_6d65ded2', { p0: formatAwaitingSignatures(missing) })

export const PENDING_OUTCOME_TITLE: Record<PendingTxOutcome, string> = {
  executed: translateMessage('ui.theTransactionWasExecuted_fd5ee323'),
  failed: translateMessage('ui.theTransactionFailedAndCanNo_aea68680'),
  replaced: translateMessage('ui.anotherTransactionUsedThisNonceSo_df7e3a6d'),
  deleted: translateMessage('ui.theTransactionWasDeleted_2c29a9f6'),
}

const EXECUTED_LINE: Record<PendingPolicyOperation, string> = {
  create: translateMessage('ui.theSpendingLimitWillShowAs_98d49849'),
  update: translateMessage('ui.theNewLimitsWillShowShortly_8727d358'),
  remove: translateMessage('ui.theSpendingLimitWillDisappearShortly_7c9042d1'),
}

export const outcomeLine = (outcome: PendingTxOutcome, operation: PendingPolicyOperation): string =>
  outcome === 'executed' ? EXECUTED_LINE[operation] : translateMessage('ui.closeThisPanelToSeeThe_909e3e53')
