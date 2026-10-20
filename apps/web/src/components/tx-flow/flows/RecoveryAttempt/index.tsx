import { translateMessage } from '@/i18n'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import RecoveryAttemptReview from './RecoveryAttemptReview'
import type { RecoveryQueueItem } from '@/features/recovery'

const RecoveryAttemptFlow = ({ item }: { item: RecoveryQueueItem }) => {
  return (
    <TxLayout
      title={translateMessage('ui.recovery_bda1d9ba')}
      subtitle={translateMessage('ui.executeRecovery_bfa46e12')}
      icon={SaveAddressIcon}
      step={0}
      hideNonce
      hideSafeShield
    >
      <RecoveryAttemptReview item={item} />
    </TxLayout>
  )
}

export default RecoveryAttemptFlow
