import { translateMessage } from '@/i18n'
import { getQuotaExceededError, type QuotaExceededError } from '@safe-global/utils/services/quotaErrors'
import { formatDate } from '@safe-global/utils/utils/date'

const seatLimitMessage = ({ quota, used }: QuotaExceededError): string =>
  translateMessage('ui.yourPlanCoversAccountsAndThis_c272e506', { p0: quota, p1: used })

/** For the relay path, which holds a QuotaExceededError instance rather than an RTK error. */
export const sponsoredQuotaMessage = ({ quota, resetsAt }: QuotaExceededError): string => {
  const reset = resetsAt ? Date.parse(resetsAt) : NaN
  const until = Number.isNaN(reset) ? '' : translateMessage('ui.until_045d6239', { p0: formatDate(reset) })
  return translateMessage('ui.yourWorkspaceHasUsedAllSponsored_1df7cdc1', { p0: quota, p1: until })
}

export const getQuotaExceededMessage = (error: unknown): string | undefined => {
  const quota = getQuotaExceededError(error)
  if (quota?.feature === 'safe_seats') return seatLimitMessage(quota)
  if (quota?.feature === 'sponsored_transactions') return sponsoredQuotaMessage(quota)
  return undefined
}
