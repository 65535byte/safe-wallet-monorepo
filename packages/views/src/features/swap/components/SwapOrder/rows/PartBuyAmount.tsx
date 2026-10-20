import { translateMessage } from '@safe-global/views/i18n'
import type { TwapOrderTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { Typography } from '@safe-global/views/components/ui/typography'
import { formatVisualAmount } from '@safe-global/utils/utils/formatters'
import { DataRow } from '@safe-global/views/components/common/Table/DataRow'

export const PartBuyAmount = ({
  order,
  addonText = '',
}: {
  order: Pick<TwapOrderTransactionInfo, 'minPartLimit' | 'buyToken'>
  addonText?: string
}) => {
  const { minPartLimit, buyToken } = order
  return (
    <DataRow title={translateMessage('ui.buyAmount_6ff9e08a')} key="buy_amount_part">
      <div>
        <Typography variant="paragraph-bold" className="inline">
          {formatVisualAmount(minPartLimit, buyToken.decimals)} {buyToken.symbol}
        </Typography>
        <Typography className="inline text-[var(--color-primary-light)]">
          {translateMessage('ui.text_0879433c', { p0: addonText })}
        </Typography>
      </div>
    </DataRow>
  )
}
