import { translateMessage } from '@safe-global/views/i18n'
import { MessageSquarePlus, UserRoundPen, WalletCards, type LucideIcon } from 'lucide-react'

export type PolicyCatalogueId = 'spending-limit' | 'proposer' | 'suggestion'

/** The tiles that stand for a policy, as opposed to the suggestion tile. */
export type PolicyId = Exclude<PolicyCatalogueId, 'suggestion'>

export interface PolicyCatalogueEntry {
  id: PolicyCatalogueId
  title: string
  description: string
  Icon: LucideIcon
  action: string
}

export const POLICY_CATALOGUE: PolicyCatalogueEntry[] = [
  {
    id: 'spending-limit',
    title: translateMessage('ui.spendingLimit_26abdb30'),
    description: translateMessage('ui.letSpendersAccessAssetsWithoutCollecting_4450464f'),
    Icon: WalletCards,
    action: translateMessage('ui.setPolicy_24438b8b'),
  },
  {
    id: 'proposer',
    title: translateMessage('ui.proposerRole_1d90df3b'),
    description: translateMessage('ui.letTeammatesWithoutSigningRightsPropose_65ac3715'),
    Icon: UserRoundPen,
    action: translateMessage('ui.setPolicy_24438b8b'),
  },
  {
    id: 'suggestion',
    title: translateMessage('ui.somethingMissing_02feaa53'),
    description: translateMessage('ui.tellUsWhichRulesWouldHelp_bf3530b2'),
    Icon: MessageSquarePlus,
    action: translateMessage('ui.giveFeedback_024afe87'),
  },
]
