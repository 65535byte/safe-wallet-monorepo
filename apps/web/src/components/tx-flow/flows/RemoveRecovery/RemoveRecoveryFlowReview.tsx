import { translateMessage } from '@/i18n'
import { trackEvent } from '@/services/analytics'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { useCallback, useContext, useEffect } from 'react'
import type { PropsWithChildren, ReactElement } from 'react'

import { createRemoveModuleTx } from '@/services/tx/tx-sender'
import { OwnerList } from '../../common/OwnerList'
import { SafeTxContext } from '../../SafeTxProvider'
import type { RecoveryFlowProps } from '.'
import ReviewTransaction from '@/components/tx/ReviewTransactionV2'
import { Typography } from '@safe-global/views/components/ui/typography'

export function RemoveRecoveryFlowReview({
  delayModifier,
  onSubmit,
  children,
}: PropsWithChildren<RecoveryFlowProps & { onSubmit: () => void }>): ReactElement {
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  useEffect(() => {
    createRemoveModuleTx(delayModifier.address).then(setSafeTx).catch(setSafeTxError)
  }, [delayModifier.address, setSafeTx, setSafeTxError])

  const onFormSubmit = useCallback(() => {
    trackEvent({ ...RECOVERY_EVENTS.SUBMIT_RECOVERY_REMOVE })
    onSubmit()
  }, [onSubmit])

  return (
    <ReviewTransaction onSubmit={onFormSubmit}>
      <Typography>{translateMessage('ui.thisTransactionWillRemoveTheRecovery_1d7617c0')}</Typography>

      <OwnerList
        title={translateMessage('ui.removingRecoverer_9cf0179f')}
        owners={delayModifier.recoverers.map((recoverer) => ({ value: recoverer }))}
        className="bg-[var(--color-warning-background)]"
      />

      {children}
    </ReviewTransaction>
  )
}
