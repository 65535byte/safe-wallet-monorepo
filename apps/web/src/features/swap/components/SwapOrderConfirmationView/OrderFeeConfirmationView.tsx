import { translateMessage } from '@/i18n'
import type {
  SwapOrderTransactionInfo,
  TwapOrderTransactionInfo,
} from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { getOrderFeeBps } from '@safe-global/utils/features/swap/helpers/utils'
import { DataRow } from '@safe-global/views/components/common/Table/DataRow'
import { BRAND_NAME } from '@/config/constants'
import { HelpIconTooltip } from '@safe-global/views/features/swap/components/HelpIconTooltip'
import { Link } from '@safe-global/views/components/ui/link'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'

export const OrderFeeConfirmationView = ({
  order,
}: {
  order: Pick<SwapOrderTransactionInfo | TwapOrderTransactionInfo, 'fullAppData'>
}) => {
  const bps = getOrderFeeBps(order)

  if (Number(bps) === 0) {
    return null
  }

  const title = (
    <>
      {translateMessage('ui.widgetFee_f20e6afa')}{' '}
      <HelpIconTooltip
        title={
          <>
            {translateMessage('ui.theTieredWidgetFeeIncurredHere_156d137d')}
            {translateMessage('ui.text_235b1dbc', { p0: BRAND_NAME })}{' '}
            {translateMessage('ui.operateTheCoWSwapWidgetAnd_f4a287c4')}
            <Link href={HelpCenterArticle.SWAP_WIDGET_FEES} target="_blank" rel="noopener noreferrer">
              {translateMessage('ui.learnMore_0c11daba')}
            </Link>
          </>
        }
      />
    </>
  )

  return (
    <DataRow datatestid="widget-fee" title={title} key="widget_fee">
      {Number(bps) / 100} %
    </DataRow>
  )
}
