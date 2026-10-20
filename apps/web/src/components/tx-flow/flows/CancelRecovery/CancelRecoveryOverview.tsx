import { translateMessage } from '@/i18n'
import { trackEvent } from '@/services/analytics'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { useContext } from 'react'
import type { ReactElement } from 'react'

import ReplaceTxIcon from '@/public/images/transactions/replace-tx.svg'
import { TxModalContext } from '../..'
import TxCard from '@safe-global/views/components/tx-flow/common/TxCard'
import { TxFlowContext } from '../../TxFlowProvider'
import { Typography } from '@safe-global/views/components/ui/typography'
import DialogActions from '@/components/common/DialogActions'

export function CancelRecoveryOverview(): ReactElement {
  const { setTxFlow } = useContext(TxModalContext)
  const { onNext } = useContext(TxFlowContext)

  const onClose = () => {
    setTxFlow(undefined)
    trackEvent(RECOVERY_EVENTS.GO_BACK)
  }

  return (
    <TxCard>
      <div className="flex flex-col items-center md:p-10">
        {/* TODO: Replace with correct icon when provided */}
        <ReplaceTxIcon />

        <Typography variant="h4" align="center" className="mt-10 mb-2">
          {translateMessage('ui.doYouWantToCancelThe_63ef8035')}
        </Typography>

        <Typography variant="paragraph-small" align="center" className="mb-6 block">
          {translateMessage('ui.ifItIsAnUnwantedRecovery_088c7b27')}
        </Typography>

        <DialogActions
          onCancel={onClose}
          cancelLabel={translateMessage('ui.goBack_15f672dc')}
          onConfirm={onNext}
          confirmLabel={translateMessage('ui.yesCancelProposal_2c308c10')}
          confirmTestId="cancel-proposal-btn"
        />
      </div>
    </TxCard>
  )
}
