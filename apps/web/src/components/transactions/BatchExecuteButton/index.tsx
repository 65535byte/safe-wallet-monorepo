import { translateMessage } from '@/i18n'
import { useCallback, useContext, useMemo, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@safe-global/views/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@safe-global/views/components/ui/alert-dialog'
import DialogActions from '@/components/common/DialogActions'
import { BatchExecuteHoverContext } from '@safe-global/views/components/transactions/BatchExecuteButton/BatchExecuteHoverProvider'
import { useAppSelector } from '@/store'
import { selectPendingTxs } from '@/store/pendingTxsSlice'
import useBatchedTxs from '@/hooks/useBatchedTxs'
import { ExecuteBatchFlow } from '@/components/tx-flow/flows'
import { trackEvent } from '@/services/analytics'
import { TX_LIST_EVENTS } from '@/services/analytics/events/txList'
import useWallet from '@/hooks/wallets/useWallet'
import useTxQueue from '@/hooks/useTxQueue'
import { TxModalContext } from '@/components/tx-flow'
import useChainId from '@/hooks/useChainId'
import { useTransactionsGetMultipleTransactionDetailsQuery } from '@safe-global/store/gateway/transactions'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'
import { isGtfSafePaid } from '@safe-global/utils/utils/isGtfSafePaid'

const ALL_SAFE_PAID_TOOLTIP = translateMessage('ui.bulkExecutionIsNotAvailableWhen_ea3ff858')

const NOT_BATCHABLE_TOOLTIP = translateMessage('ui.batchExecutionIsOnlyAvailableFor_35fc1563')

const BATCHABLE_TOOLTIP = translateMessage('ui.allHighlightedTransactionsWillBeIncluded_2388f9f9')

const BatchExecuteButton = () => {
  const { setTxFlow } = useContext(TxModalContext)
  const pendingTxs = useAppSelector(selectPendingTxs)
  const hoverContext = useContext(BatchExecuteHoverContext)
  const { page } = useTxQueue()
  const batchableTransactions = useBatchedTxs(page?.results || [])
  const wallet = useWallet()
  const chainId = useChainId()
  const [showMixedWarning, setShowMixedWarning] = useState(false)

  const isBatchable = batchableTransactions.length > 1
  const hasPendingTx = batchableTransactions.some((tx) => pendingTxs[tx.transaction.id])

  // Pre-fetch details so we can detect Safe-pays txs upfront (drives the disable / warn UX).
  // RTK Query caches this — the modal reuses the same data when opened.
  const { data: txsWithDetails } = useTransactionsGetMultipleTransactionDetailsQuery(
    { chainId, txIds: batchableTransactions.map((tx) => tx.transaction.id) },
    { skip: !isBatchable || !chainId },
  )

  const safePaidCount = useMemo(() => {
    if (!txsWithDetails) return 0
    return txsWithDetails.filter((tx) => {
      const exec = isMultisigDetailedExecutionInfo(tx.detailedExecutionInfo) ? tx.detailedExecutionInfo : null
      return (
        exec &&
        isGtfSafePaid({
          gasPrice: exec.gasPrice,
          baseGas: exec.baseGas,
          refundReceiver: exec.refundReceiver?.value,
        })
      )
    }).length
  }, [txsWithDetails])

  const allSafePaid =
    isBatchable && !!txsWithDetails && safePaidCount > 0 && safePaidCount === batchableTransactions.length
  const isMixed = isBatchable && safePaidCount > 0 && safePaidCount < batchableTransactions.length

  // Until details load we can't tell all-Safe-paid / mixed apart — keep the button disabled so a
  // fast click can't bypass the all-Safe-paid disable or the mixed-batch warning modal.
  const detailsLoading = isBatchable && !!chainId && txsWithDetails === undefined

  const isDisabled = !isBatchable || hasPendingTx || !wallet || allSafePaid || detailsLoading

  const tooltipTitle = allSafePaid ? ALL_SAFE_PAID_TOOLTIP : isDisabled ? NOT_BATCHABLE_TOOLTIP : BATCHABLE_TOOLTIP

  const handleOnMouseEnter = useCallback(() => {
    hoverContext.setActiveHover(batchableTransactions.map((tx) => tx.transaction.id))
  }, [batchableTransactions, hoverContext])

  const handleOnMouseLeave = useCallback(() => {
    hoverContext.setActiveHover([])
  }, [hoverContext])

  const openBulkFlow = useCallback(() => {
    trackEvent({
      ...TX_LIST_EVENTS.BATCH_EXECUTE,
      label: batchableTransactions.length,
    })

    setTxFlow(<ExecuteBatchFlow txs={batchableTransactions} />, undefined, false)
  }, [batchableTransactions, setTxFlow])

  const handleOpenModal = () => {
    if (isMixed) {
      setShowMixedWarning(true)
      return
    }
    openBulkFlow()
  }

  const handleConfirmMixed = () => {
    setShowMixedWarning(false)
    openBulkFlow()
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <span>
              <Button
                onMouseEnter={handleOnMouseEnter}
                onMouseLeave={handleOnMouseLeave}
                variant="outline"
                size="action"
                disabled={isDisabled}
                onClick={handleOpenModal}
              >
                {translateMessage('ui.bulkExecute_9d27f598')}
                {isBatchable && translateMessage('ui.transactions_cb302d64', { p0: batchableTransactions.length })}
              </Button>
            </span>
          }
        />
        <TooltipContent side="top" align="start">
          {tooltipTitle}
        </TooltipContent>
      </Tooltip>

      {showMixedWarning && (
        <AlertDialog open onOpenChange={(open) => !open && setShowMixedWarning(false)}>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <div className="flex items-center justify-center size-10 rounded-full bg-[var(--color-warning-main)]/10 text-[var(--color-warning-main)] shrink-0">
                <TriangleAlert className="size-5" />
              </div>
              <AlertDialogTitle>{translateMessage('ui.someTransactionsWillBeChargedGas_76d83026')}</AlertDialogTitle>
              <AlertDialogDescription>
                {safePaidCount}{' '}
                {safePaidCount === 1
                  ? translateMessage('ui.transaction_fda910e6')
                  : translateMessage('ui.transactions_679b16b1')}{' '}
                {translateMessage('ui.inThisBatch_e95c3918')} {safePaidCount === 1 ? 'pays' : 'pay'}{' '}
                {translateMessage('ui.gasFeesFromTheThoseFees_d583a0e2')}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <DialogActions
                onCancel={() => setShowMixedWarning(false)}
                confirmLabel={translateMessage('ui.executeAnyway_92a67968')}
                onConfirm={handleConfirmMixed}
              />
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}

export default BatchExecuteButton
