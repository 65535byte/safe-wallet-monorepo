import { translateMessage } from '@safe-global/views/i18n'
import type { PlanTier } from './types'

export const PLAN_ORDER = ['Starter', 'Business', 'Enterprise']

/** The plan the trial and lapsed-Workspace modals lead with. */
export const RECOMMENDED_PLAN = 'Business'

// TODO(safe-pro): Enterprise has no payment link; static card until sales flow is defined.
export const ENTERPRISE_TIER: PlanTier = {
  id: 'enterprise',
  name: 'Enterprise',
  currency: 'eur',
  billingCycle: null,
  options: [
    {
      paymentLinkId: null,
      priceId: null,
      label: translateMessage('ui.accounts_e2f6ed24'),
      price: null,
      originalPrice: null,
    },
  ],
  features: [
    translateMessage('ui.unlimitedSponsoredTransactions_246afdd4'),
    translateMessage('ui.sharedAddressBook_18574206'),
    translateMessage('ui.activityLog_178128e0'),
    translateMessage('ui.advancedThreatAnalysis_e385d601'),
    translateMessage('ui.transactionSimulation_1e0bcc02'),
    translateMessage('ui.workspaceFA_0d393882'),
    translateMessage('ui.policies_34ff1e6a'),
    translateMessage('ui.customSafeCapacity_5281f742'),
    translateMessage('ui.multipleWorkspaces_fece081e'),
    translateMessage('ui.tailoredContractBillingTerms_70761754'),
    translateMessage('ui.customContractAndBillingTerms_42371788'),
    translateMessage('ui.dedicatedSupportAndCustomizedOnboarding_9bf6193c'),
  ],
}
