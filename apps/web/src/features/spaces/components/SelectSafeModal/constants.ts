import { translateMessage } from '@/i18n'
import { ESafeAction } from '@/features/spaces/store'

export const safeModalTitles: Record<ESafeAction, string> = {
  [ESafeAction.Send]: translateMessage('ui.sendFrom_1c8d5849'),
  [ESafeAction.Receive]: translateMessage('ui.receiveTo_e2581414'),
  [ESafeAction.Swap]: translateMessage('ui.swapFrom_39317da9'),
  [ESafeAction.BuildTransaction]: translateMessage('ui.buildTransactionFrom_e814ab86'),
}
