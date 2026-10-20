import { translateMessage } from '@/i18n'
import type { TransactionData } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import type { ReactElement } from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'
import EthHashInfo from '@/components/common/EthHashInfo'
import TxDetailsRow from '@/components/tx/ConfirmTxDetails/TxDetailsRow'
import { SpendingLimits } from '.'
import type { SpendingLimitBatch } from './spendingLimitBatch'

type SpendingLimitBatchSummaryProps = {
  txData: TransactionData
  batch: SpendingLimitBatch
}

export const SpendingLimitBatchSummary = ({ txData, batch }: SpendingLimitBatchSummaryProps): ReactElement => (
  <div className="flex flex-col gap-4" data-testid="spending-limit-batch-summary">
    {batch.enablesModule && (
      <Typography>
        <b>{translateMessage('ui.enableTheSpendingLimitModule_6e5a96fe')}</b>
      </Typography>
    )}

    {batch.changes.map(({ method, dataDecoded, resetsSpent }, index) => (
      <SpendingLimits key={index} txData={{ ...txData, dataDecoded }} type={method} resetsSpent={resetsSpent} />
    ))}

    {batch.removedSpenders.map((spender, index) => (
      <div key={`${spender}-${index}`} className="flex flex-col gap-2">
        <Typography>
          <b>{translateMessage('ui.removeSpender_85c9f55b')}</b>
        </Typography>
        <TxDetailsRow label={translateMessage('ui.spender_77803664')} grid>
          <EthHashInfo address={spender} shortAddress={false} showCopyButton hasExplorer />
        </TxDetailsRow>
      </div>
    ))}
  </div>
)
