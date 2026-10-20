import { translateMessage } from '@safe-global/views/i18n'
import type { TwapOrderTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { Typography } from '@safe-global/views/components/ui/typography'
import { formatVisualAmount } from '@safe-global/utils/utils/formatters'
import { DataRow } from '@safe-global/views/components/common/Table/DataRow'

export const PartSellAmount = ({
  order,
  addonText = '',
}: {
  order: Pick<TwapOrderTransactionInfo, 'partSellAmount' | 'sellToken'>
  addonText?: string
}) => {
  const { partSellAmount, sellToken } = order
  return (
    <DataRow title={translateMessage('ui.sellAmount_b2810b7f')} key="sell_amount_part">
      <div>
        <Typography variant="paragraph-bold" className="inline">
          {formatVisualAmount(partSellAmount, sellToken.decimals)} {sellToken.symbol}
        </Typography>
        <Typography className="inline text-[var(--color-primary-light)]">
          {translateMessage('ui.text_0879433c', { p0: addonText })}
        </Typography>
      </div>
    </DataRow>
  )
}
