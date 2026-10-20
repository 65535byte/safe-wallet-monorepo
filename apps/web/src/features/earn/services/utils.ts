import { translateMessage } from '@/i18n'
import { EligibleEarnTokens } from '../constants'

export const vaultTypeToLabel = {
  VaultDeposit: translateMessage('ui.deposit_99d820fe'),
  VaultRedeem: translateMessage('ui.withdraw_e0a8b34b'),
}

export const isEligibleEarnToken = (chainId: string, tokenAddress: string) => {
  return EligibleEarnTokens[chainId]?.includes(tokenAddress)
}
