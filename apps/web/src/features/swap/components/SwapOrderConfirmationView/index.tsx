import { translateMessage } from '@/i18n'
import { TransactionInfoType } from '@safe-global/store/gateway/types'
import type {
  DataDecoded,
  SwapOrderTransactionInfo,
  SwapTransferTransactionInfo,
  TwapOrderTransactionInfo,
} from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { StartTimeValue } from '@safe-global/store/gateway/types'
import OrderId from '../OrderId'
import { formatDateTime, formatTimeInWords } from '@safe-global/utils/utils/date'
import { getPeriod } from '@safe-global/views/utils/formatPeriod'
import { Fragment, type ReactElement } from 'react'
import { DataRow } from '@safe-global/views/components/common/Table/DataRow'
import { DataTable } from '@safe-global/views/components/common/Table/DataTable'
import { compareAsc } from 'date-fns'
import { Alert, AlertDescription } from '@safe-global/views/components/ui/alert'
import { Typography } from '@safe-global/views/components/ui/typography'
import { formatAmount } from '@safe-global/utils/utils/formatNumber'
import { getLimitPrice, getOrderClass, getSlippageInPercent } from '../../helpers/utils'
import SwapTokens from '../SwapTokens'
import AlertIcon from '@/public/images/common/alert.svg'
import EthHashInfo from '@/components/common/EthHashInfo'
import css from './styles.module.css'
import NamedAddress from '@/components/common/NamedAddressInfo'
import { PartDuration } from '@safe-global/views/features/swap/components/SwapOrder/rows/PartDuration'
import { PartSellAmount } from '@safe-global/views/features/swap/components/SwapOrder/rows/PartSellAmount'
import { PartBuyAmount } from '@safe-global/views/features/swap/components/SwapOrder/rows/PartBuyAmount'
import { OrderFeeConfirmationView } from './OrderFeeConfirmationView'
import { isSettingTwapFallbackHandler } from '../../helpers/utils'
import { TwapFallbackHandlerWarning } from '@safe-global/views/features/swap/components/TwapFallbackHandlerWarning'

type SwapOrderProps = {
  order: SwapOrderTransactionInfo | SwapTransferTransactionInfo | TwapOrderTransactionInfo
  settlementContract: string
  decodedData?: DataDecoded | null
}

const SwapOrderConfirmation = ({ order, decodedData, settlementContract }: SwapOrderProps): ReactElement => {
  const { owner, kind, validUntil, sellToken, buyToken, sellAmount, buyAmount, receiver } = order

  const isTwapOrder = order.type === TransactionInfoType.TWAP_ORDER

  const limitPrice = getLimitPrice(order)
  const orderClass = getOrderClass(order)
  const expires = new Date(validUntil * 1000)
  const now = new Date()

  const slippage = getSlippageInPercent(order)
  const isSellOrder = kind === 'sell'
  const isChangingFallbackHandler = decodedData && isSettingTwapFallbackHandler(decodedData)
  const explorerUrl = !isTwapOrder ? order.explorerUrl : undefined

  return (
    <>
      {isChangingFallbackHandler && <TwapFallbackHandlerWarning />}

      <DataTable
        header={translateMessage('ui.orderDetails_ee45c9cb')}
        rows={[
          <div key="amount" className={css.amount}>
            <SwapTokens
              first={{
                value: sellAmount,
                label: isSellOrder ? translateMessage('ui.sell_aa061cbb') : translateMessage('ui.forAtMost_158e8b71'),
                tokenInfo: sellToken,
              }}
              second={{
                value: buyAmount,
                label: isSellOrder
                  ? translateMessage('ui.forAtLeast_3747e14a')
                  : translateMessage('ui.buyExactly_4944de3c'),
                tokenInfo: buyToken,
              }}
            />
          </div>,

          <DataRow datatestid="limit-price" key="Limit price" title={translateMessage('ui.limitPrice_557871e0')}>
            1 {buyToken.symbol} = {formatAmount(limitPrice)} {sellToken.symbol}
          </DataRow>,

          compareAsc(now, expires) !== 1 ? (
            <DataRow datatestid="expiry" key="Expiry" title={translateMessage('ui.expiry_e71a3433')}>
              <Typography>
                <span className="font-bold">{formatTimeInWords(validUntil * 1000)}</span> (
                {formatDateTime(validUntil * 1000)})
              </Typography>
            </DataRow>
          ) : (
            <DataRow key="Expiry" title={translateMessage('ui.expiry_e71a3433')}>
              {formatDateTime(validUntil * 1000)}
            </DataRow>
          ),
          orderClass !== 'limit' ? (
            <DataRow datatestid="slippage" key="Slippage" title={translateMessage('ui.slippage_802afc6a')}>
              {slippage}%
            </DataRow>
          ) : (
            <Fragment key="none" />
          ),
          !isTwapOrder ? (
            <DataRow datatestid="order-id" key="Order ID" title={translateMessage('ui.orderID_fcbc2319')}>
              <OrderId orderId={order.uid} href={explorerUrl!} />
            </DataRow>
          ) : (
            <Fragment key="no-order-id" />
          ),
          <OrderFeeConfirmationView
            key="SurplusFee"
            order={order as { fullAppData?: Record<string, unknown> | null }}
          />,
          <DataRow datatestid="interact-wth" key="Interact with" title={translateMessage('ui.interactWith_9eefaee7')}>
            <NamedAddress address={settlementContract} onlyName hasExplorer shortAddress={false} avatarSize={24} />
          </DataRow>,
          receiver && owner !== receiver ? (
            <Fragment key="recipient-block">
              <DataRow datatestid="recipient" key="recipient-address" title={translateMessage('ui.recipient_f737f260')}>
                <EthHashInfo address={receiver} hasExplorer={true} avatarSize={24} />
              </DataRow>
              <div key="recipient">
                <Alert data-testid="recipient-alert" variant="warning" outlined={false}>
                  <AlertIcon />
                  <AlertDescription>
                    <Typography variant="paragraph-small">
                      <Typography variant="paragraph-small-bold" className="inline">
                        {translateMessage('ui.orderRecipientAddressDiffersFromOrder_edcb6821')}
                      </Typography>{' '}
                      {translateMessage('ui.doubleCheckTheAddressToPrevent_669a23e5')}
                    </Typography>
                  </AlertDescription>
                </Alert>
              </div>
            </Fragment>
          ) : (
            <Fragment key="no-recipient" />
          ),
        ]}
      />

      {isTwapOrder && (
        <div className={css.partsBlock}>
          <DataTable
            rows={[
              <Typography key="title" variant="paragraph" className={css.partsBlockTitle}>
                <strong>
                  {translateMessage('ui.orderWillBeSplitIn_86bc3e44')}
                  <span className={css.numberOfPartsLabel}>
                    {order.numberOfParts} {translateMessage('ui.equalParts_c788f98e')}
                  </span>
                </strong>
              </Typography>,
              <PartSellAmount order={order} addonText={translateMessage('ui.perPart_cd72b0c9')} key="sell_part" />,
              <PartBuyAmount order={order} addonText={translateMessage('ui.perPart_cd72b0c9')} key="buy_part" />,
              <DataRow title={translateMessage('ui.startTime_778384c0')} key="Start time">
                {order.startTime.startType === StartTimeValue.AT_MINING_TIME && 'Now'}
                {order.startTime.startType === StartTimeValue.AT_EPOCH &&
                  translateMessage('ui.atBlockNumber_dbbc936a', { p0: order.startTime.epoch })}
              </DataRow>,
              <PartDuration order={order} key="part_duration" />,
              <DataRow title={translateMessage('ui.totalDuration_cad839b0')} key="total_duration">
                {getPeriod(+order.timeBetweenParts * +order.numberOfParts)}
              </DataRow>,
            ]}
          />
        </div>
      )}
    </>
  )
}

export default SwapOrderConfirmation
