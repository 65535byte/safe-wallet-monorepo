import { translateMessage } from '@/i18n'
export const SAFENET_RULE_IDS = ['R-4.1', 'R-4.2', 'R-4.3', 'R-4.4', 'R-4.5', 'R-4.6'] as const

export type SafenetRuleId = (typeof SAFENET_RULE_IDS)[number]

export type SafenetRuleCopy = {
  label: string
  description: string
}

/** User-facing label and description for each charter rule. Sentinels send only the code. */
export const SAFENET_RULES: Record<SafenetRuleId, SafenetRuleCopy> = {
  'R-4.1': {
    label: translateMessage('ui.accountSettingsChange_089b7096'),
    description: translateMessage('ui.thisTransactionChangesSignersThresholdModules_1eb81551'),
  },
  'R-4.2': {
    label: translateMessage('ui.unexpectedDelegateCall_6af6492b'),
    description: translateMessage('ui.thisTransactionRunsExternalCodeThat_da4a3258'),
  },
  'R-4.3': {
    label: translateMessage('ui.unknownRecipient_1c46329f'),
    description: translateMessage('ui.fundsGoToAnAddressOutside_2efa5d7f'),
  },
  'R-4.4': {
    label: translateMessage('ui.unknownSpender_15952fcf'),
    description: translateMessage('ui.thisTransactionLetsAnUnfamiliarAddress_a0912b11'),
  },
  'R-4.5': {
    label: translateMessage('ui.unlimitedApproval_16f9492a'),
    description: translateMessage('ui.thisTransactionApprovesAnUnlimitedToken_8c4a3140'),
  },
  'R-4.6': {
    label: translateMessage('ui.maliciousThreatDetected_18b2488a'),
    description: translateMessage('ui.thisTransactionInteractsWithAnAddress_f3e2fe06'),
  },
}

export const isSafenetRuleId = (value: string): value is SafenetRuleId =>
  (SAFENET_RULE_IDS as readonly string[]).includes(value)
