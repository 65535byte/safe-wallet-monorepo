import { translateMessage } from '@/i18n'
import { type ReactNode, useContext, useState } from 'react'
import { type NextRouter, useRouter } from 'next/router'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Typography } from '@safe-global/views/components/ui/typography'
import DeleteIcon from '@/public/images/common/delete.svg'
import CancelIcon from '@/public/images/common/cancel.svg'
import ReplaceTxIcon from '@/public/images/transactions/replace-tx.svg'
import { RefreshCw as CachedIcon } from 'lucide-react'
import { useQueuedTxByNonce } from '@/hooks/useTxQueue'
import { isCustomTxInfo } from '@/utils/transaction-guards'

import css from './styles.module.css'
import { TxModalContext } from '../..'
import TokenTransferFlow from '../TokenTransfer'
import RejectTx from '../RejectTx'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import TxCard from '@safe-global/views/components/tx-flow/common/TxCard'
import DeleteTxModal from './DeleteTxModal'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import ChoiceButton from '@safe-global/views/components/common/ChoiceButton'
import useWallet from '@/hooks/wallets/useWallet'
import { sameAddress } from '@safe-global/utils/utils/addresses'
import { AppRoutes } from '@/config/routes'
import { useHasFeature } from '@/hooks/useChains'
import Track from '@/components/common/Track'
import { REJECT_TX_EVENTS } from '@/services/analytics/events/reject-tx'
import { useRecommendedNonce } from '@/components/tx/shared/hooks'
import { FEATURES } from '@safe-global/utils/utils/chains'
import { withSpaceId } from '@/hooks/useUrlSpaceId'

const MaybeTooltip = ({ title, children }: { title: string; children: ReactNode }) => {
  if (!title) {
    return <span className="w-full">{children}</span>
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="w-full" />}>{children}</TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  )
}

const goToQueue = (router: NextRouter) => {
  if (router.pathname === AppRoutes.transactions.tx) {
    router.push({
      pathname: AppRoutes.transactions.queue,
      query: withSpaceId({ safe: router.query.safe }, router.query.spaceId),
    })
  }
}

/**
 * To avoid nonce gaps in the queue, we allow deleting the last transaction in the queue or duplicates.
 * The recommended nonce is used to calculate the last transaction in the queue.
 */
const useIsNonceDeletable = (txNonce: number) => {
  const queuedTxsByNonce = useQueuedTxByNonce(txNonce)
  const recommendedNonce = useRecommendedNonce() || 0
  const duplicateCount = queuedTxsByNonce?.length || 0
  return duplicateCount > 1 || txNonce === recommendedNonce - 1
}

const DeleteTxButton = ({
  safeTxHash,
  txNonce,
  onSuccess,
}: {
  safeTxHash: string
  txNonce: number
  onSuccess: () => void
}) => {
  const router = useRouter()
  const isDeletable = useIsNonceDeletable(txNonce)
  const [isDeleting, setIsDeleting] = useState(false)

  const onDeleteSuccess = () => {
    setIsDeleting(false)
    goToQueue(router)
    onSuccess()
  }
  const onDeleteClose = () => setIsDeleting(false)

  return (
    <>
      <Typography variant="paragraph-mini" className={css.or}>
        {translateMessage('ui.or_e3fa4951')}
      </Typography>

      <Typography variant="paragraph-small" className="mb-1 block">
        {translateMessage('ui.donTWantToHaveThis_0cd83335')}
      </Typography>

      <MaybeTooltip title={isDeletable ? '' : translateMessage('ui.youCanOnlyDeleteTheLast_ef1fe6d9')}>
        <Track {...REJECT_TX_EVENTS.DELETE_OFFCHAIN_BUTTON} as="div">
          <ChoiceButton
            icon={DeleteIcon}
            iconColor="error"
            onClick={() => setIsDeleting(true)}
            title={translateMessage('ui.deleteFromTheQueue_62f905d4')}
            description={translateMessage('ui.removeThisTransactionFromTheOff_e004874f')}
            disabled={!isDeletable}
          />
        </Track>
      </MaybeTooltip>

      {safeTxHash && isDeleting && (
        <DeleteTxModal onSuccess={onDeleteSuccess} onClose={onDeleteClose} safeTxHash={safeTxHash} />
      )}
    </>
  )
}

const ReplaceTxMenu = ({
  txNonce,
  safeTxHash,
  proposer,
}: {
  txNonce: number
  safeTxHash?: string
  proposer?: string
}) => {
  const wallet = useWallet()
  const { setTxFlow } = useContext(TxModalContext)
  const queuedTxsByNonce = useQueuedTxByNonce(txNonce)
  const canCancel = !queuedTxsByNonce?.some(
    (item) => isCustomTxInfo(item.transaction.txInfo) && item.transaction.txInfo.isCancellation,
  )

  const isDeleteEnabled = useHasFeature(FEATURES.DELETE_TX)
  const canDelete = safeTxHash && isDeleteEnabled && proposer && wallet && sameAddress(wallet.address, proposer)

  return (
    <TxLayout
      title={translateMessage('ui.rejectTransaction_57ee5489', { p0: txNonce })}
      step={0}
      hideNonce
      isReplacement
    >
      <TxCard>
        <div className="mt-4 flex justify-center">
          <ReplaceTxIcon />
        </div>

        <Typography variant="paragraph-small" className="-mt-2 mb-2 block">
          {translateMessage('ui.youCanReplaceOrRejectThis_5f045125')}{' '}
          <Track {...REJECT_TX_EVENTS.READ_MORE}>
            <ExternalLink href="https://help.safe.global/articles/4016097317-Why-do-I-need-to-pay-for-cancelling-a-transaction?">
              {translateMessage('ui.readMore_531b9432')}
            </ExternalLink>
          </Track>
        </Typography>

        <div className="flex flex-col gap-4">
          <Track {...REJECT_TX_EVENTS.REPLACE_TX_BUTTON} as="div">
            <ChoiceButton
              icon={CachedIcon}
              onClick={() => setTxFlow(<TokenTransferFlow txNonce={txNonce} />)}
              title={translateMessage('ui.replaceWithAnotherTransaction_d91bf3ff')}
              description={translateMessage('ui.proposeANewTransactionWithThe_be930751')}
              chip={translateMessage('ui.recommended_99a8fb6a')}
            />
          </Track>

          <MaybeTooltip
            title={canCancel ? '' : translateMessage('ui.transactionWithNonceAlreadyHasA_4bfc5090', { p0: txNonce })}
          >
            <Track {...REJECT_TX_EVENTS.REJECT_ONCHAIN_BUTTON} as="div">
              <ChoiceButton
                icon={CancelIcon}
                iconColor="warning"
                onClick={() => setTxFlow(<RejectTx txNonce={txNonce} />)}
                disabled={!canCancel}
                title={translateMessage('ui.rejectTransaction_856b22fe')}
                description={translateMessage('ui.proposeAnOnChainCancellationTransaction_741eb2f0')}
                chip={canDelete ? translateMessage('ui.recommended_99a8fb6a') : undefined}
              />
            </Track>
          </MaybeTooltip>

          {canDelete && (
            <DeleteTxButton
              data-testid="delete-tx"
              safeTxHash={safeTxHash}
              txNonce={txNonce}
              onSuccess={() => setTxFlow(undefined)}
            />
          )}
        </div>
      </TxCard>
    </TxLayout>
  )
}

export default ReplaceTxMenu
