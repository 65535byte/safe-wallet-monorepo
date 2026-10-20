import { translateMessage } from '@/i18n'
import { type ReactElement } from 'react'
import RejectTx from './RejectTx'
import { TxFlowType } from '@/services/analytics'
import { TxFlow } from '../../TxFlow'

type RejectTxProps = {
  txNonce: number
}

const RejectTxFlow = ({ txNonce }: RejectTxProps): ReactElement => (
  <TxFlow
    subtitle={translateMessage('ui.reject_39589b77')}
    eventCategory={TxFlowType.REJECT_TX}
    ReviewTransactionComponent={RejectTx}
    isBatchable={false}
    txNonce={txNonce}
    isRejection
  />
)

export default RejectTxFlow
