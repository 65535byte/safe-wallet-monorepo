import { translateMessage } from '@/i18n'
import { trackEvent } from '@/services/analytics'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useContext } from 'react'
import type { PropsWithChildren, ReactElement } from 'react'

import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { getRecoverySkipTransaction } from '../../services/transaction'
import { createTx } from '@/services/tx/tx-sender'
import ErrorMessage from '@/components/tx/ErrorMessage'
import type { RecoveryQueueItem } from '../../services/recovery-state'
import useAsync from '@safe-global/utils/hooks/useAsync'
import ReviewTransaction from '@/components/tx/ReviewTransactionV2'

function CancelRecoveryReview({
  recovery,
  onSubmit,
  children,
}: PropsWithChildren<{
  recovery: RecoveryQueueItem
  onSubmit: () => void
}>): ReactElement {
  const web3ReadOnly = useWeb3ReadOnly()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useAsync(async () => {
    if (!web3ReadOnly) {
      return
    }
    const transaction = await getRecoverySkipTransaction(recovery, web3ReadOnly)
    createTx(transaction).then(setSafeTx).catch(setSafeTxError)
  }, [setSafeTx, setSafeTxError, recovery, web3ReadOnly])

  const handleSubmit = () => {
    trackEvent({ ...RECOVERY_EVENTS.SUBMIT_RECOVERY_CANCEL })
    onSubmit()
  }

  return (
    <ReviewTransaction onSubmit={handleSubmit}>
      <Typography className="mb-2">{translateMessage('ui.allActionsInitiatedByTheRecoverer_883b14dd')}</Typography>

      <ErrorMessage level="info">
        {translateMessage('ui.thisTransactionWillInitiateTheCancellation_fd2f1d77')}
        {recovery.isMalicious
          ? translateMessage('ui.maliciousTransaction_0a248ef1')
          : translateMessage('ui.recoveryProposal_0bf13280')}
        {translateMessage('ui.itRequiresOtherSignerSignaturesIn_1c813a16')}
      </ErrorMessage>

      {children}
    </ReviewTransaction>
  )
}

export default CancelRecoveryReview
