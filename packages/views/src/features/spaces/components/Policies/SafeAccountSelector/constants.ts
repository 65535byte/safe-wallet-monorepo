import { translateMessage } from '@safe-global/views/i18n'
import type { SafeAccountIneligibility } from './types'

type EligibilityCopy = {
  rule: string
  helperText: string
  noEligibleAccountsText: string
}

/** Built from one rule wording so the helper text and the empty state cannot state different rules. */
const buildEligibilityCopy = (rule: string): EligibilityCopy => ({
  rule,
  helperText: translateMessage('ui.youOnlySeeAccountsWhereYou_58773328', { p0: rule }),
  noEligibleAccountsText:
    translateMessage('ui.yourConnectedWalletIsnTA_aee3f2c8', { p0: rule }) +
    translateMessage('ui.connectADifferentWalletToSet_23fa7f63'),
})

const DEFAULT_COPY = buildEligibilityCopy(translateMessage('ui.signerOrProposer_f677e407'))

export const SIGNERS_ONLY_COPY = buildEligibilityCopy(translateMessage('ui.signer_d8724b61'))

export const getEligibilityCopy = (signersOnly: boolean): EligibilityCopy =>
  signersOnly ? SIGNERS_ONLY_COPY : DEFAULT_COPY

export const ELIGIBILITY_RULE = DEFAULT_COPY.rule

export const ELIGIBILITY_HELPER_TEXT = DEFAULT_COPY.helperText

export const NO_ELIGIBLE_ACCOUNTS_TEXT = DEFAULT_COPY.noEligibleAccountsText

/** Used instead when no wallet is connected — there is none to blame or switch away from. */
export const NO_WALLET_TEXT = translateMessage('ui.connectAWalletToSeeThe_52bd962a')

export const LOAD_ERROR_TEXT = translateMessage('ui.failedToLoadAccounts_ce8b2ffb')

export const INELIGIBILITY_TEXT: Record<SafeAccountIneligibility, string> = {
  'not-activated': translateMessage('ui.youNeedToActivateThisBefore_b76371bf'),
  'unsupported-chain': translateMessage('ui.spendingLimitsOnThisNetworkAren_513abbec'),
  'no-spending-limits': translateMessage('ui.theSpendingLimitModuleIsnT_017cd910'),
}

export const SAFE_ACCOUNT_SELECTOR_LABEL = translateMessage('ui.whichAccountDoesThisApplyTo_50122358')

export const SAFE_ACCOUNT_SELECTOR_PLACEHOLDER = translateMessage('ui.selectAccount_d7ad1c5b')

export const NESTED_SAFES_NOTICE_TITLE = translateMessage('ui.nestedAccounts_3b13f337')

/** Each flow names what it manages, so the notice points at the right settings page. */
export const getNestedSafesNoticeText = (policy: 'proposers' | 'spending limits') =>
  translateMessage('ui.toManageForTheNestedAccounts_39ced67c', {
    p0:
      policy === 'proposers' ? translateMessage('ui.proposer_7ebd3069') : translateMessage('ui.spendingLimit_26abdb30'),
  })
