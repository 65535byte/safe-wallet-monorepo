import { translateMessage } from '@/i18n'
import { NativeStakingStatus } from '@safe-global/store/gateway/types'
import type { SvgrComponent } from '@safe-global/views/components/common/icons/types'
import CheckIcon from '@/public/images/common/circle-check.svg'
import ClockIcon from '@/public/images/common/clock.svg'
import SlashShield from '@/public/images/common/shield-off.svg'
import SignatureIcon from '@/public/images/common/document_signature.svg'
import TxStatusChip, { type TxStatusChipProps } from '@safe-global/views/components/transactions/TxStatusChip'
import type { NativeStakingValidatorsExitTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'

const ColorIcons: Record<
  NativeStakingStatus,
  | {
      color: TxStatusChipProps['color']
      icon?: SvgrComponent
      text: string
    }
  | undefined
> = {
  [NativeStakingStatus.NOT_STAKED]: {
    color: 'warning',
    icon: SignatureIcon,
    text: translateMessage('ui.inactive_402ad6c0'),
  },
  [NativeStakingStatus.ACTIVATING]: {
    color: 'info',
    icon: ClockIcon,
    text: translateMessage('ui.activating_a907caf8'),
  },
  [NativeStakingStatus.DEPOSIT_IN_PROGRESS]: {
    color: 'info',
    icon: ClockIcon,
    text: translateMessage('ui.awaitingEntry_cbba0b27'),
  },
  [NativeStakingStatus.ACTIVE]: {
    color: 'success',
    icon: CheckIcon,
    text: translateMessage('ui.validating_caec6fb0'),
  },
  [NativeStakingStatus.EXIT_REQUESTED]: {
    color: 'info',
    icon: ClockIcon,
    text: translateMessage('ui.requestedExit_051eefaf'),
  },
  [NativeStakingStatus.EXITING]: {
    color: 'info',
    icon: ClockIcon,
    text: translateMessage('ui.requestPending_4ed13dcc'),
  },
  [NativeStakingStatus.EXITED]: {
    color: 'success',
    icon: CheckIcon,
    text: translateMessage('ui.withdrawn_486cd160'),
  },
  [NativeStakingStatus.SLASHED]: {
    color: 'warning',
    icon: SlashShield,
    text: translateMessage('ui.slashed_091c92eb'),
  },
}

const capitalizedStatus = (status: string) =>
  status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^\w/g, (l) => l.toUpperCase())

const StakingStatus = ({ status }: { status: NativeStakingValidatorsExitTransactionInfo['status'] }) => {
  const config = ColorIcons[status]

  return (
    <TxStatusChip color={config?.color}>
      {config?.icon && <config.icon />}
      {config?.text || capitalizedStatus(status)}
    </TxStatusChip>
  )
}

export default StakingStatus
