import { translateMessage } from '@/i18n'
// Extract status handling into separate components
import { useLoadFeature } from '@/features/__core__'
import { SpeedupFeature } from '@/features/speedup'
import { PendingStatus, type PendingTx } from '@/store/pendingTxsSlice'
import { Typography } from '@safe-global/views/components/ui/typography'

type Props = {
  txId: string
  pendingTx: PendingTx
  willDeploySafe: boolean
}
export const ProcessingStatus = ({ txId, pendingTx, willDeploySafe: isCreatingSafe }: Props) => {
  const { SpeedUpMonitor } = useLoadFeature(SpeedupFeature)

  return (
    <div className="mt-6 px-6">
      <Typography data-testid="transaction-status" variant="h4" className="mt-4">
        {!isCreatingSafe
          ? translateMessage('ui.transactionIsNowProcessing_b434e3d9')
          : translateMessage('ui.nestedIsNowBeingCreated_afd53d51')}
      </Typography>
      <Typography variant="paragraph-small" className="mb-6 block">
        {!isCreatingSafe ? translateMessage('ui.theTransaction_89d6b9a3') : translateMessage('ui.yourNested_2816dc03')}{' '}
        {translateMessage('ui.wasConfirmedAndIsNowBeing_8dd35d47')}
      </Typography>
      <div>
        {pendingTx.status === PendingStatus.PROCESSING && (
          <SpeedUpMonitor txId={txId} pendingTx={pendingTx} modalTrigger="alertBox" />
        )}
      </div>
    </div>
  )
}
