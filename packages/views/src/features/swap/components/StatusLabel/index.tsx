import { translateMessage } from '@safe-global/views/i18n'
import type { OrderStatuses } from '@safe-global/store/gateway/types'
import type { ReactElement } from 'react'
import { Ban, CircleCheck, CircleX, Clock, Contrast, FileSignature, type LucideIcon } from 'lucide-react'
import TxStatusChip, { type TxStatusChipProps } from '@safe-global/views/components/transactions/TxStatusChip'

type CustomOrderStatuses = OrderStatuses | 'partiallyFilled'
type Props = {
  status: CustomOrderStatuses
}

type StatusProps = {
  label: string
  color: TxStatusChipProps['color']
  icon: LucideIcon
}

const statusMap: Record<CustomOrderStatuses, StatusProps> = {
  presignaturePending: {
    label: translateMessage('ui.executionNeeded_baa23b66'),
    color: 'warning',
    icon: FileSignature,
  },
  fulfilled: {
    label: translateMessage('ui.filled_68d52325'),
    color: 'success',
    icon: CircleCheck,
  },
  open: {
    label: translateMessage('ui.open_a211eefa'),
    color: 'warning',
    icon: Clock,
  },
  cancelled: {
    label: translateMessage('ui.cancelled_8d952832'),
    color: 'error',
    icon: Ban,
  },
  expired: {
    label: translateMessage('ui.expired_b75ba2e1'),
    color: 'primary',
    icon: Clock,
  },
  partiallyFilled: {
    label: translateMessage('ui.partiallyFilled_6695db7e'),
    color: 'success',
    icon: Contrast,
  },
  // CGW claims it can return unknown status, but in reality I've never seen it
  unknown: {
    label: translateMessage('ui.unknown_5e1302f9'),
    color: 'error',
    icon: CircleX,
  },
}
const StatusLabel = (props: Props): ReactElement => {
  const { status } = props
  const { label, color, icon: Icon } = statusMap[status]

  return (
    <TxStatusChip color={color}>
      <Icon />
      {label}
    </TxStatusChip>
  )
}

export default StatusLabel
