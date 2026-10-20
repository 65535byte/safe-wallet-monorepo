import { translateMessage } from '@/i18n'
import { AbiCoder, parseUnits } from 'ethers'

export const NO_TOKEN_SELECTED_ERROR = translateMessage('ui.selectAToken_13973247')

/**
 * The AllowanceModule stores amounts as uint96
 * (https://github.com/safe-global/safe-modules/blob/main/modules/allowances/contracts/AllowanceModule.sol#L52),
 * so an amount that does not fit is rejected before it reaches the contract.
 */
export const validateSpendingLimitAmount = (value: string, decimals?: number | null): string | undefined => {
  // Without a selected token the decimals are unknown, so the amount cannot be valid yet.
  if (decimals == null) return NO_TOKEN_SELECTED_ERROR
  try {
    const amount = parseUnits(value, decimals)
    AbiCoder.defaultAbiCoder().encode(['int96'], [amount])
  } catch {
    return Number(value) > 1
      ? translateMessage('ui.amountIsTooBig_129bb5a1')
      : translateMessage('ui.amountIsTooSmall_97faf384')
  }
}
