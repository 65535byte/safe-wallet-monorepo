import { translateMessage } from '@/i18n'
import EthHashInfo from '@/components/common/EthHashInfo'
import StatusStep from '@/components/new-safe/create/steps/StatusStep/StatusStep'
import useSafeInfo from '@/hooks/useSafeInfo'
import { PendingStatus } from '@/store/pendingTxsSlice'
import { Typography } from '@safe-global/views/components/ui/typography'

const StatusStepper = ({ status, txHash }: { status?: PendingStatus; txHash?: string }) => {
  const { safeAddress } = useSafeInfo()

  const isProcessing = status === PendingStatus.PROCESSING || status === PendingStatus.INDEXING || status === undefined
  const isProcessed = status === PendingStatus.INDEXING || status === undefined
  const isSuccess = status === undefined

  const steps = [
    <StatusStep key="tx" isLoading={!isProcessing} safeAddress={safeAddress} isFirst>
      <div>
        <Typography variant="paragraph-small-bold">{translateMessage('ui.yourTransaction_37c9e8c9')}</Typography>
        {txHash && (
          <div className="font-mono">
            <EthHashInfo
              address={txHash}
              hasExplorer
              showCopyButton
              showName={false}
              shortAddress={false}
              showAvatar={false}
            />
          </div>
        )}
      </div>
    </StatusStep>,
    <StatusStep key="processing" isLoading={!isProcessed} safeAddress={safeAddress}>
      <div>
        <Typography variant="paragraph-small-bold">
          {isProcessed ? 'Processed' : translateMessage('ui.processing_cf0ea9ec')}
        </Typography>
      </div>
    </StatusStep>,
    <StatusStep key="indexing" isLoading={!isSuccess} safeAddress={safeAddress}>
      <Typography variant="paragraph-small-bold">{isSuccess ? 'Indexed' : 'Indexing'}</Typography>
    </StatusStep>,
    <StatusStep key="executed" isLoading={!isSuccess} safeAddress={safeAddress}>
      <Typography variant="paragraph-small-bold">{translateMessage('ui.transactionIsExecuted_6f33eb46')}</Typography>
    </StatusStep>,
  ]

  return (
    <div data-testid="status-stepper" className="flex flex-col">
      {steps}
    </div>
  )
}

export default StatusStepper
