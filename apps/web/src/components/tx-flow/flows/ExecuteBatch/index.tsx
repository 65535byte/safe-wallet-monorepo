import { translateMessage } from '@/i18n'
import type { ModuleTransaction } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import { ReviewBatch } from './ReviewBatch'
import BatchIcon from '@/public/images/apps/batch-icon.svg'

export type ExecuteBatchFlowProps = {
  txs: ModuleTransaction[]
}

const ExecuteBatchFlow = (props: ExecuteBatchFlowProps) => {
  return (
    <TxLayout
      title={translateMessage('ui.confirmTransaction_bfd300c6')}
      subtitle={translateMessage('ui.batch_f201b6db')}
      icon={BatchIcon}
      hideNonce
      isBatch
    >
      <ReviewBatch params={props} />
    </TxLayout>
  )
}

export default ExecuteBatchFlow
