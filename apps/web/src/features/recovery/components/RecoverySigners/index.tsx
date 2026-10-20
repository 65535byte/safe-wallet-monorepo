import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'

import { AuditLog, AuditRow, AuditLogHeader } from '@/components/common/AuditLog'
import { Countdown } from '@safe-global/views/components/common/Countdown'
import ExecuteRecoveryButton from '../ExecuteRecoveryButton'
import CancelRecoveryButton from '../CancelRecoveryButton'
import { useRecoveryTxState } from '../../hooks/useRecoveryTxState'
import { formatAuditDateTime } from '@/components/common/AuditLog'
import type { RecoveryQueueItem } from '../../services/recovery-state'
import useAddressBook from '@/hooks/useAddressBook'

import txDetailsCss from '@/components/transactions/TxDetails/styles.module.css'

export default function RecoverySigners({ item }: { item: RecoveryQueueItem }): ReactElement {
  const { isExecutable, isExpired, isNext, remainingSeconds } = useRecoveryTxState(item)
  const addressBook = useAddressBook()

  const executionLabel = isExpired
    ? translateMessage('ui.expired_b75ba2e1')
    : isExecutable
      ? translateMessage('ui.executable_340f4d3b')
      : 'Waiting'
  const executionActionType = isExpired ? 'expired' : isExecutable ? 'executed' : 'pending'

  const expiresAtFormatted = item.expiresAt !== null ? formatAuditDateTime(Number(item.expiresAt)) : null

  const desc = isExecutable
    ? expiresAtFormatted
      ? translateMessage('ui.theRecoveryProposalCanBeExecuted_fbfd1612', { p0: expiresAtFormatted })
      : translateMessage('ui.theRecoveryProposalCanBeExecuted_3a06256b')
    : isExpired
      ? translateMessage('ui.theRecoveryProposalHasExpiredAnd_cb513ae6')
      : translateMessage('ui.theRecoveryProposalCanBeExecuted_e7578168')

  return (
    <>
      <AuditLog>
        <AuditLogHeader />

        <AuditRow
          label={translateMessage('ui.created_d8278ec8')}
          actionType="created"
          address={item.executor}
          name={addressBook[item.executor]}
          timestamp={Number(item.timestamp)}
        />

        <AuditRow label={executionLabel} actionType={executionActionType} isLast />

        <Alert variant={isExpired ? 'warning' : 'info'} outlined={false} className="mt-4">
          <AlertSeverityIcon variant={isExpired ? 'warning' : 'info'} />
          <AlertDescription>{desc}</AlertDescription>
        </Alert>

        {isNext && remainingSeconds > 0 && (
          <div className="mt-4">
            <Countdown seconds={remainingSeconds} />
          </div>
        )}
      </AuditLog>

      <div className={txDetailsCss.buttons}>
        <ExecuteRecoveryButton recovery={item} />
        <CancelRecoveryButton recovery={item} />
      </div>
    </>
  )
}
