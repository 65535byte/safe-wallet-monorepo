import { translateMessage } from '@/i18n'
import type { NativeStakingDepositTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { Typography } from '@safe-global/views/components/ui/typography'
import { cn } from '@safe-global/views/utils/cn'
import FieldsGrid from '@safe-global/views/components/tx/FieldsGrid'
import ConfirmationOrderHeader from '@/components/tx/ConfirmationOrder/ConfirmationOrderHeader'
import { formatDurationFromMilliseconds, formatVisualAmount } from '@safe-global/utils/utils/formatters'
import { formatCurrency } from '@safe-global/utils/utils/formatNumber'
import StakingStatus from './StakingStatus'
import { InfoTooltip } from '@safe-global/views/components/common/InfoTooltip'
import { BRAND_NAME } from '@/config/constants'

type StakingOrderConfirmationViewProps = {
  order: NativeStakingDepositTransactionInfo
  isTxDetails?: boolean
}

const CURRENCY = 'USD'

const StakingConfirmationTxDeposit = ({ order, isTxDetails }: StakingOrderConfirmationViewProps) => {
  const isOrder = !isTxDetails

  // the fee is returned in decimal format, so we multiply by 100 to get the percentage
  const fee = (order.fee * 100).toFixed(2)
  return (
    <div className={cn('flex flex-col', isOrder ? 'gap-4' : 'gap-2')}>
      {isOrder && (
        <ConfirmationOrderHeader
          blocks={[
            {
              value: order.value,
              tokenInfo: order.tokenInfo,
              label: translateMessage('ui.deposit_99d820fe'),
            },
            {
              value: order.annualNrr.toFixed(3) + '%',
              label: translateMessage('ui.rewardsRateAfterFees_853a5036'),
            },
          ]}
        />
      )}
      <FieldsGrid title={translateMessage('ui.netAnnualRewards_e4d6acdf')}>
        {formatVisualAmount(order.expectedAnnualReward, order.tokenInfo.decimals)} {order.tokenInfo.symbol}
        {' ('}
        {formatCurrency(order.expectedFiatAnnualReward, CURRENCY)})
      </FieldsGrid>
      <FieldsGrid title={translateMessage('ui.netMonthlyRewards_6b5e9670')}>
        {formatVisualAmount(order.expectedMonthlyReward, order.tokenInfo.decimals)} {order.tokenInfo.symbol}
        {' ('}
        {formatCurrency(order.expectedFiatMonthlyReward, CURRENCY)})
      </FieldsGrid>
      <FieldsGrid
        title={
          <>
            {translateMessage('ui.fee_26159a09')}
            <InfoTooltip title={translateMessage('ui.theWidgetFeeIncurredHereIs_c6717c2b', { p0: BRAND_NAME })} />
          </>
        }
      >
        {fee} %
      </FieldsGrid>
      <div
        className={cn(
          'border-border-light flex flex-col gap-2',
          isOrder ? 'rounded border p-4' : 'mt-2 border-t pt-4 pb-2',
        )}
      >
        {isOrder ? (
          <Typography className="mb-4 font-bold">
            {translateMessage('ui.youWillOwn_2d6e72a5')}{' '}
            <span className="bg-[var(--color-border-background)] rounded px-2 py-1">
              {order.numValidators} {translateMessage('ui.ethereumValidator_8a18cd00')}
            </span>
          </Typography>
        ) : (
          <FieldsGrid title={translateMessage('ui.validators_0de86bdd')}>{order.numValidators}</FieldsGrid>
        )}

        <FieldsGrid title={translateMessage('ui.activationTime_3e330e90')}>
          {formatDurationFromMilliseconds(order.estimatedEntryTime)}
        </FieldsGrid>

        <FieldsGrid title={translateMessage('ui.rewards_0a460c55')}>
          {translateMessage('ui.approxEveryDaysAfterActivation_1417a2ec')}
        </FieldsGrid>

        {!isOrder && (
          <FieldsGrid title={translateMessage('ui.validatorStatus_0717076f')}>
            <StakingStatus status={order.status} />
          </FieldsGrid>
        )}

        {isOrder && (
          <Typography variant="paragraph-small" className="block mt-4 text-muted-foreground">
            {translateMessage('ui.earnETHRewardsWithDedicatedValidators_b23664fa')}
          </Typography>
        )}
      </div>
    </div>
  )
}

export default StakingConfirmationTxDeposit
