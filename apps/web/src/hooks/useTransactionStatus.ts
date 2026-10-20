import { translateMessage } from '@/i18n'
import { TransactionStatus } from '@safe-global/store/gateway/types'
import type { Transaction } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { ReplaceTxHoverContext } from '@/components/transactions/GroupedTxListItems/ReplaceTxHoverProvider'
import { useAppSelector } from '@/store'
import { PendingStatus, selectPendingTxById } from '@/store/pendingTxsSlice'
import { isCancelledSwapOrder, isSignableBy } from '@/utils/transaction-guards'
import { useContext } from 'react'
import useWallet from './wallets/useWallet'

const ReplacedStatus = 'WILL_BE_REPLACED'
const AwaitingParentStatus = 'AWAITING_PARENT_SIGNATURE'

type TxLocalStatus = TransactionStatus | PendingStatus | typeof ReplacedStatus | typeof AwaitingParentStatus

export const STATUS_LABELS: Record<TxLocalStatus, string> = {
  [TransactionStatus.AWAITING_CONFIRMATIONS]: translateMessage('ui.awaitingConfirmations_8f51482e'),
  [TransactionStatus.AWAITING_EXECUTION]: translateMessage('ui.awaitingExecution_028707aa'),
  [TransactionStatus.CANCELLED]: translateMessage('ui.cancelled_8d952832'),
  [TransactionStatus.FAILED]: translateMessage('ui.failed_1dad4921'),
  [TransactionStatus.SUCCESS]: translateMessage('ui.success_47959c37'),
  [PendingStatus.SUBMITTING]: 'Submitting',
  [PendingStatus.PROCESSING]: translateMessage('ui.processing_cf0ea9ec'),
  [PendingStatus.RELAYING]: 'Relaying',
  [PendingStatus.INDEXING]: 'Indexing',
  [PendingStatus.SIGNING]: 'Signing',
  [PendingStatus.NESTED_SIGNING]: 'Signing',
  [ReplacedStatus]: translateMessage('ui.transactionWillBeReplaced_760b97a5'),
  [AwaitingParentStatus]: translateMessage('ui.awaitingParentSignature_c5752927'),
}

const WALLET_STATUS_LABELS: Record<TxLocalStatus, string> = {
  ...STATUS_LABELS,
  [TransactionStatus.AWAITING_CONFIRMATIONS]: translateMessage('ui.needsYourConfirmation_120ee18e'),
}

const useTransactionStatus = (txSummary: Transaction): string => {
  const { txStatus, id } = txSummary

  const { replacedTxIds } = useContext(ReplaceTxHoverContext)
  const wallet = useWallet()
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, id))

  if (isCancelledSwapOrder(txSummary.txInfo)) {
    return STATUS_LABELS['CANCELLED']
  }

  if (replacedTxIds.includes(id)) {
    return STATUS_LABELS[ReplacedStatus]
  }

  const statuses = wallet?.address && isSignableBy(txSummary, wallet.address) ? WALLET_STATUS_LABELS : STATUS_LABELS

  // The child tx is only queued in the parent Safe; nothing happens until the parent's owners execute
  if (pendingTx?.status === PendingStatus.NESTED_SIGNING && !pendingTx.executed) {
    return statuses[AwaitingParentStatus]
  }

  return statuses[pendingTx?.status || txStatus] || ''
}

export default useTransactionStatus
