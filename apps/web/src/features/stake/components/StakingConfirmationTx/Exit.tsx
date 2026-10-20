import { translateMessage } from '@/i18n'
import type { NativeStakingValidatorsExitTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Typography } from '@safe-global/views/components/ui/typography'
import FieldsGrid from '@safe-global/views/components/tx/FieldsGrid'
import { formatDurationFromMilliseconds } from '@safe-global/utils/utils/formatters'
import ConfirmationOrderHeader from '@/components/tx/ConfirmationOrder/ConfirmationOrderHeader'
import { InfoTooltip } from '@safe-global/views/components/common/InfoTooltip'

type StakingOrderConfirmationViewProps = {
  order: NativeStakingValidatorsExitTransactionInfo
}

const StakingConfirmationTxExit = ({ order }: StakingOrderConfirmationViewProps) => {
  const withdrawIn = formatDurationFromMilliseconds(order.estimatedExitTime + order.estimatedWithdrawalTime, [
    'days',
    'hours',
  ])

  return (
    <div className="flex flex-col gap-4">
      <ConfirmationOrderHeader
        blocks={[
          {
            value: translateMessage('ui.validators_d9346825', { p0: order.numValidators }),
            label: translateMessage('ui.exit_8ca0834c'),
          },
          {
            value: order.value,
            tokenInfo: order.tokenInfo,
            label: translateMessage('ui.receive_ae91e583'),
          },
        ]}
      />
      <FieldsGrid
        title={
          <>
            {translateMessage('ui.withdrawIn_4e4bce2c')}
            <InfoTooltip
              title={
                <>
                  {translateMessage('ui.withdrawalTimeIsTheSumOf_bc28631d')}
                  <ul>
                    <li>{translateMessage('ui.timeUntilYourValidatorIsSuccessfully_735345ab')}</li>
                    <li>{translateMessage('ui.timeForAStakeToReceive_add39e02')}</li>
                  </ul>
                </>
              }
            />
          </>
        }
      >
        {translateMessage('ui.upTo_638e131c')}
        {withdrawIn}
      </FieldsGrid>
      <Typography variant="paragraph-small" color="muted" className="block mt-4">
        {translateMessage('ui.theSelectedAmountAndAnyRewards_6a82834a')}
      </Typography>
      <Alert variant="warning" outlined={false} className="mb-2">
        <AlertSeverityIcon variant="warning" />
        <AlertDescription>{translateMessage('ui.thisTransactionIsAWithdrawalRequest_84ab2759')}</AlertDescription>
      </Alert>
    </div>
  )
}

export default StakingConfirmationTxExit
