import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'
import { createRejectTx } from '@/services/tx/tx-sender'
import { useContext, useEffect } from 'react'
import { SafeTxContext } from '../../SafeTxProvider'
import ReviewTransaction from '@/components/tx/ReviewTransactionV2'
import type { ReviewTransactionProps } from '@/components/tx/ReviewTransactionV2'
import { TxFlowContext } from '../../TxFlowProvider'

const RejectTx = ({ onSubmit, children }: ReviewTransactionProps): ReactElement => {
  const { txNonce } = useContext(TxFlowContext)
  const { setSafeTx, setSafeTxError, setNonce } = useContext(SafeTxContext)

  useEffect(() => {
    if (txNonce == undefined) return

    setNonce(txNonce)

    createRejectTx(txNonce).then(setSafeTx).catch(setSafeTxError)
  }, [txNonce, setNonce, setSafeTx, setSafeTxError])

  return (
    <ReviewTransaction onSubmit={onSubmit}>
      <Typography className="mb-4">{translateMessage('ui.toRejectTheTransactionASeparate_cef801e7')}</Typography>

      <Typography className="mb-4">
        {translateMessage('ui.transactionNonce_cce6f766')}
        <b>{txNonce}</b>
      </Typography>

      <Typography className="mb-4">{translateMessage('ui.youWillNeedToConfirmThe_5f842d4e')}</Typography>

      {children}
    </ReviewTransaction>
  )
}

export default RejectTx
