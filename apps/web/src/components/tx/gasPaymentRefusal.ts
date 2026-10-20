import { translateMessage } from '@/i18n'
import { QuotaExceededError } from '@safe-global/utils/services/quotaErrors'
import {
  GasPaymentOptionUnavailableError,
  REFUNDING_TRANSACTION_REASON,
  RelayLimitReachedError,
  RelayerUnavailableError,
} from '@safe-global/utils/services/gasPaymentErrors'
import { SPONSORED_OPTIONS, type GasPayer, type SponsoredOption } from '@/utils/gasPayment'
import { sponsoredQuotaMessage } from '@/utils/quotaMessage'

const LIMIT_REACHED_MESSAGE = translateMessage('ui.noSponsoredTransactionsLeftChooseAnother_4b602344')
const UNAVAILABLE_MESSAGE = translateMessage('ui.thisGasPaymentOptionIsnT_bb2ab231')
const WALLET_ONLY_MESSAGE = translateMessage('ui.thisTransactionCanOnlyBeExecuted_292d766e')

/** Which sponsored options a backend refusal rules out, and what to tell the user. */
export const getGasPaymentRefusal = (
  err: Error,
  gasPayer: GasPayer,
): { excluded: SponsoredOption[]; message: string } | undefined => {
  if (gasPayer === 'WALLET') return undefined

  if (err instanceof QuotaExceededError) return { excluded: [gasPayer], message: sponsoredQuotaMessage(err) }
  if (err instanceof RelayLimitReachedError) return { excluded: [gasPayer], message: LIMIT_REACHED_MESSAGE }
  if (err instanceof GasPaymentOptionUnavailableError) {
    const isRefundTx = err.requested === 'PAY_FROM_SAFE' || err.reason === REFUNDING_TRANSACTION_REASON
    if (isRefundTx) return { excluded: SPONSORED_OPTIONS, message: WALLET_ONLY_MESSAGE }
    return { excluded: [gasPayer], message: UNAVAILABLE_MESSAGE }
  }
  if (err instanceof RelayerUnavailableError) return { excluded: [gasPayer], message: UNAVAILABLE_MESSAGE }

  return undefined
}
