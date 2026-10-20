import { translateMessage } from '@/i18n'
import type { MessageItem } from '@safe-global/store/gateway/AUTO_GENERATED/messages'
import { type ReactElement } from 'react'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'
import { Copy as CopyIcon } from 'lucide-react'
import TxConfirmations from '@safe-global/views/components/transactions/TxConfirmations'
import { AuditLog, AuditRow, AuditLogHeader } from '@/components/common/AuditLog'
import CopyTooltip from '@/components/common/CopyTooltip'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import useOrigin from '@/hooks/useOrigin'
import useAddressBook from '@/hooks/useAddressBook'
import { withSpaceIdInUrl, useUrlSpaceId } from '@/hooks/useUrlSpaceId'

const MsgAuditLog = ({ msg }: { msg: MessageItem }): ReactElement => {
  const addressBook = useAddressBook()
  const router = useRouter()
  const { safe = '' } = router.query
  const spaceId = useUrlSpaceId()
  const origin = useOrigin()
  const msgUrl = withSpaceIdInUrl(
    `${origin}${AppRoutes.transactions.msg}?safe=${safe}&messageHash=${msg.messageHash}`,
    spaceId,
  )
  const { confirmations, confirmationsRequired, confirmationsSubmitted, proposedBy, creationTimestamp } = msg
  const isConfirmed = msg.status === 'CONFIRMED'

  const resolveName = (address: string | undefined, apiFallback?: string | null): string | undefined =>
    address ? addressBook[address] || apiFallback || undefined : undefined

  const signingLabel = (idx: number) =>
    translateMessage('ui.signed_1a0692d9', { p0: idx + 1, p1: confirmationsRequired })

  return (
    <AuditLog className="mb-4" data-testid="msg-audit-log">
      <AuditLogHeader
        chip={
          <TxConfirmations
            submittedConfirmations={confirmationsSubmitted}
            requiredConfirmations={confirmationsRequired}
          />
        }
        actions={
          <CopyTooltip text={msgUrl} initialToolTipText={translateMessage('ui.copyMessageLink_bc8be17d')}>
            <Button variant="ghost" size="icon-xs" className="text-inherit">
              <CopyIcon className="size-4" />
            </Button>
          </CopyTooltip>
        }
      />

      {proposedBy && (
        <AuditRow
          label={translateMessage('ui.created_d8278ec8')}
          actionType="created"
          address={proposedBy.value}
          name={resolveName(proposedBy.value, proposedBy.name)}
          timestamp={creationTimestamp}
          isLast={confirmations.length === 0 && !isConfirmed}
        />
      )}

      {confirmations.map(({ owner }, idx) => (
        <AuditRow
          key={owner.value}
          label={signingLabel(idx)}
          actionType="signed"
          address={owner.value}
          name={resolveName(owner.value, owner.name)}
          isLast={idx === confirmations.length - 1 && !isConfirmed}
        />
      ))}

      {isConfirmed && (
        <AuditRow
          label={translateMessage('ui.confirmed_2a0ef702')}
          actionType="confirmed"
          timestamp={msg.modifiedTimestamp}
          isLast
        />
      )}

      {!isConfirmed && (
        <Alert variant="info" className="mt-4">
          <AlertSeverityIcon variant="info" />
          <AlertDescription>{translateMessage('ui.canBeConfirmedOnceTheThreshold_95866e7d')}</AlertDescription>
        </Alert>
      )}
    </AuditLog>
  )
}

export default MsgAuditLog
