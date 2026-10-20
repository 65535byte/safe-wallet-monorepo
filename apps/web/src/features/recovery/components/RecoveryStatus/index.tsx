import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'

import { Spinner } from '@safe-global/views/components/ui/spinner'
import ClockIcon from '@/public/images/common/clock.svg'
import { useRecoveryTxState } from '../../hooks/useRecoveryTxState'
import { RecoveryEvent } from '../../services/recoveryEvents'
import store from '../RecoveryContext'
import type { RecoveryQueueItem } from '../../services/recovery-state'
import TxStatusChip from '@safe-global/views/components/transactions/TxStatusChip'

const STATUS_LABELS: Partial<Record<RecoveryEvent, string>> = {
  [RecoveryEvent.PROCESSING]: translateMessage('ui.processing_cf0ea9ec'),
  [RecoveryEvent.PROCESSED]: translateMessage('ui.loading_e61bb78c'),
}

const RecoveryStatus = ({ recovery }: { recovery: RecoveryQueueItem }): ReactElement => {
  const { isExecutable, isExpired } = useRecoveryTxState(recovery)
  const pending = store.useStore()?.pending

  const pendingTxStatus = pending?.[recovery.args.txHash]?.status

  const status = pendingTxStatus ? (
    <>
      <Spinner className="size-3.5" />
      {STATUS_LABELS[pendingTxStatus]}
    </>
  ) : isExecutable ? (
    translateMessage('ui.awaitingExecution_028707aa')
  ) : isExpired ? (
    translateMessage('ui.expired_b75ba2e1')
  ) : (
    <>
      <ClockIcon className="size-[1em] fill-current" />
      {translateMessage('ui.pending_c096ae70')}
    </>
  )

  return <TxStatusChip color={isExpired ? 'error' : 'warning'}>{status}</TxStatusChip>
}

export default RecoveryStatus
