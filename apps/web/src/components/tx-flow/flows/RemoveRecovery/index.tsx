import { translateMessage } from '@/i18n'
import { useCallback, type ReactElement } from 'react'
import RecoveryPlus from '@safe-global/views/assets/images/common/recovery-plus.svg'
import { RemoveRecoveryFlowOverview } from './RemoveRecoveryFlowOverview'
import { RemoveRecoveryFlowReview } from './RemoveRecoveryFlowReview'
import type { RecoveryStateItem } from '@/features/recovery'
import { TxFlowType } from '@/services/analytics'
import { TxFlow } from '../../TxFlow'
import { TxFlowStep } from '../../TxFlowStep'
import type { ReviewTransactionProps } from '@/components/tx/ReviewTransactionV2'

export type RecoveryFlowProps = {
  delayModifier: RecoveryStateItem
}

function RemoveRecoveryFlow({ delayModifier }: RecoveryFlowProps): ReactElement {
  const RemoveRecoveryReviewStep = useCallback(
    (props: ReviewTransactionProps) => <RemoveRecoveryFlowReview delayModifier={delayModifier} {...props} />,
    [delayModifier],
  )

  return (
    <TxFlow
      eventCategory={TxFlowType.REMOVE_RECOVERY}
      icon={RecoveryPlus}
      subtitle={translateMessage('ui.removeRecoverer_64a5384d')}
      ReviewTransactionComponent={RemoveRecoveryReviewStep}
    >
      <TxFlowStep title={translateMessage('ui.removeAccountRecovery_537308e2')}>
        <RemoveRecoveryFlowOverview delayModifier={delayModifier} />
      </TxFlowStep>
    </TxFlow>
  )
}

export default RemoveRecoveryFlow
