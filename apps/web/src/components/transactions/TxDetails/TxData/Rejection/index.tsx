import { translateMessage } from '@/i18n'
import type { MultisigExecutionDetails } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { NOT_AVAILABLE } from '@/components/transactions/TxDetails'
import { Typography } from '@safe-global/views/components/ui/typography'
import React from 'react'

import { HelpCenterArticle } from '@safe-global/utils/config/constants'

interface Props {
  nonce?: MultisigExecutionDetails['nonce']
  isTxExecuted: boolean
}

const RejectionTxInfo = ({ nonce, isTxExecuted }: Props) => {
  const txNonce = nonce ?? NOT_AVAILABLE
  const message = isTxExecuted
    ? translateMessage('ui.thisIsAnOnChainRejection_685c5803', { p0: txNonce })
    : translateMessage('ui.thisIsAnOnChainRejection_5469fbbd', { p0: txNonce })

  const title = translateMessage('ui.whyDoINeedToPay_21abcba9')

  return (
    <>
      <Typography data-testid="onchain-rejection" className="mr-4">
        {message}
      </Typography>
      {!isTxExecuted && (
        <div className="mt-4 w-fit">
          <ExternalLink href={HelpCenterArticle.CANCELLING_TRANSACTIONS} title={title}>
            <div className="flex items-center gap-1.5">
              <Typography className="underline">{title}</Typography>
            </div>
          </ExternalLink>
        </div>
      )}
    </>
  )
}

export default RejectionTxInfo
