import { translateMessage } from '@/i18n'
import type { TransactionDetails } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Typography } from '@safe-global/views/components/ui/typography'

import React from 'react'
import useSafeInfo from '@/hooks/useSafeInfo'
import { ChangeSignerSetupWarning } from '@/features/multichain'
import { isChangeThresholdView } from '../utils'

interface ChangeThresholdProps {
  txInfo?: TransactionDetails['txInfo']
}

function ChangeThreshold({ txInfo }: ChangeThresholdProps) {
  const { safe } = useSafeInfo()
  const threshold = txInfo && isChangeThresholdView(txInfo) && txInfo.settingsInfo?.threshold

  return (
    <>
      <ChangeSignerSetupWarning />

      <div>
        <Typography variant="paragraph-small" className="block text-muted-foreground mb-1">
          {translateMessage('ui.anyTransactionWillRequireTheConfirmation_3995efd5')}
        </Typography>

        <Typography aria-label={translateMessage('ui.threshold_3b1d451d')}>
          <b>{threshold}</b> {translateMessage('ui.outOf_c83e560c')}
          <b>
            {safe.owners.length} {translateMessage('ui.signer_efab2dcb')}
          </b>
        </Typography>
      </div>
      <div className="my-2">
        <Separator bleed="6" />
      </div>
    </>
  )
}

export default ChangeThreshold
