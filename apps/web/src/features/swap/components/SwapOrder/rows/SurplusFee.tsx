import { translateMessage } from '@/i18n'
import type { TwapOrderTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { getOrderFeeBps } from '@safe-global/utils/features/swap/helpers/utils'
import { DataRow } from '@safe-global/views/components/common/Table/DataRow'
import { formatVisualAmount } from '@safe-global/utils/utils/formatters'
import { HelpIconTooltip } from '@safe-global/views/features/swap/components/HelpIconTooltip'

export const SurplusFee = ({
  order,
}: {
  order: Pick<TwapOrderTransactionInfo, 'fullAppData' | 'executedFee' | 'executedFeeToken'>
}) => {
  const bps = getOrderFeeBps(order)
  const { executedFee, executedFeeToken } = order

  if (!executedFee || executedFee === '0') {
    return null
  }

  return (
    <DataRow
      title={
        <>
          {translateMessage('ui.totalFees_ab179b6c')}
          <HelpIconTooltip
            title={
              <>
                {translateMessage('ui.theAmountOfFeesPaidFor_55e2bdc3')}
                {bps > 0 && translateMessage('ui.thisIncludesAWidgetFeeOf_75d47765', { p0: bps / 100 })}
              </>
            }
          />
        </>
      }
      key="widget_fee"
    >
      {formatVisualAmount(BigInt(executedFee), executedFeeToken.decimals)} {executedFeeToken.symbol}
    </DataRow>
  )
}
