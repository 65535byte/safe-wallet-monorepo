import { translateMessage } from '@safe-global/views/i18n'
import { LockKeyholeOpen, MessageSquarePlus, UserRoundPen, WalletCards, type LucideIcon } from 'lucide-react'

export type AddPolicyId = 'spending-limit' | 'proposer' | 'suggestion' | 'recovery'

export interface AddPolicyOption {
  id: AddPolicyId
  title: string
  description: string
  Icon: LucideIcon
  disabled?: boolean
  disabledTooltip?: string
}

export const ADD_POLICY_OPTIONS: AddPolicyOption[] = [
  {
    id: 'spending-limit',
    title: translateMessage('ui.spendingLimit_26abdb30'),
    description: translateMessage('ui.letSpendersAccessAssetsWithoutCollecting_4450464f'),
    Icon: WalletCards,
  },
  {
    id: 'proposer',
    title: translateMessage('ui.proposerRole_1d90df3b'),
    description: translateMessage('ui.letTeammatesWithoutSigningRightsPropose_65ac3715'),
    Icon: UserRoundPen,
  },
  {
    id: 'suggestion',
    title: translateMessage('ui.suggestTheNextPolicy_d5805219'),
    description: translateMessage('ui.tellUsWhichRulesWouldHelp_d9d757d7'),
    Icon: MessageSquarePlus,
  },
]

export const RECOVERY_POLICY_OPTION: AddPolicyOption = {
  id: 'recovery',
  title: translateMessage('ui.accountRecovery_a5ed5ee0'),
  description: translateMessage('ui.letRecoverersRestoreAccessToYour_8ffef710'),
  Icon: LockKeyholeOpen,
}
