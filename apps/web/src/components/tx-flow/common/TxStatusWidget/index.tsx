import { translateMessage } from '@/i18n'
import type { Transaction } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { TransactionStatus } from '@safe-global/store/gateway/types'
import { useContext, type ReactNode } from 'react'
import CreatedIcon from '@/public/images/messages/created.svg'
import SignedIcon from '@/public/images/messages/signed.svg'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionInfo, isSignableBy, isConfirmableBy, isOneSignatureShort } from '@/utils/transaction-guards'
import classnames from 'classnames'
import { cn } from '@safe-global/views/utils/cn'
import css from './styles.module.css'
import useWallet from '@/hooks/wallets/useWallet'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { useIsWalletProposer } from '@/hooks/useProposers'
import { useAlreadySigned } from '@/components/tx/shared/hooks'

/* Between 900px and 1200px the rail collapses to icons only so the transaction card — the point of
   the screen — keeps its width instead of the header wrapping mid-word. `sr-only` rather than
   `hidden` so the step names stay in the accessibility tree at every width. Below 900px
   TxLayoutBase drops the rail entirely. */
const StatusLabel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span
    className={cn('sr-only min-[1200px]:not-sr-only min-[1200px]:truncate text-xs leading-4 font-normal', className)}
  >
    {children}
  </span>
)

const TxStatusWidget = ({
  txSummary,
  isBatch = false,
  isMessage = false,
  isLastStep = false,
}: {
  txSummary?: Transaction
  isBatch?: boolean
  isMessage?: boolean
  isLastStep?: boolean
}) => {
  const wallet = useWallet()
  const { safe } = useSafeInfo()
  const { nonceNeeded, safeTx } = useContext(SafeTxContext)
  const { threshold } = safe
  const isSafeOwner = useIsSafeOwner()
  const isProposer = useIsWalletProposer()
  const isProposing = isProposer && !isSafeOwner
  const isAwaitingExecution = txSummary?.txStatus === TransactionStatus.AWAITING_EXECUTION

  const { executionInfo = undefined } = txSummary || {}
  const { confirmationsSubmitted = 0 } = isMultisigExecutionInfo(executionInfo) ? executionInfo : {}

  const canConfirm = txSummary
    ? isConfirmableBy(txSummary, wallet?.address || '')
    : safe.threshold === 1 && !isProposing

  const canSign = txSummary ? isSignableBy(txSummary, wallet?.address || '') : !isProposing
  const hasSigned = useAlreadySigned(safeTx)
  const showSignStep = canSign && isOneSignatureShort(confirmationsSubmitted, threshold) && !isBatch && !isMessage

  return (
    <div className="bg-transparent">
      <ul className={css.status}>
        <li className={css.item}>
          <span className={css.itemIcon}>
            <CreatedIcon />
          </span>

          <StatusLabel>
            {isBatch ? translateMessage('ui.queueTransactions_ccbfaee8') : translateMessage('ui.create_2e386efa')}
          </StatusLabel>
        </li>

        <li className={classnames(css.item, { [css.incomplete]: !canConfirm && !isBatch })}>
          <span className={css.itemIcon}>
            <SignedIcon />
          </span>

          <StatusLabel>
            {isBatch ? (
              translateMessage('ui.createBatch_711211c4')
            ) : !nonceNeeded ? (
              translateMessage('ui.confirmed_2a0ef702')
            ) : isMessage ? (
              translateMessage('ui.collectSignatures_89b1793f')
            ) : (
              <>
                {translateMessage('ui.confirmed_e03df75f')}
                {confirmationsSubmitted} / {threshold}){canSign && <span className={css.badge}>+1</span>}
              </>
            )}
          </StatusLabel>
        </li>

        {showSignStep && (
          <li className={classnames(css.item, { [css.incomplete]: !hasSigned })}>
            <span className={css.itemIcon}>
              <SignedIcon />
            </span>

            <StatusLabel>{translateMessage('ui.sign_1e67e9a4')}</StatusLabel>
          </li>
        )}

        <li className={classnames(css.item, { [css.incomplete]: !(isAwaitingExecution && isLastStep) })}>
          <span className={css.itemIcon}>
            <SignedIcon />
          </span>

          <StatusLabel>
            {isMessage ? translateMessage('ui.done_23c91b78') : translateMessage('ui.execute_eea2eb83')}
          </StatusLabel>
        </li>
      </ul>
    </div>
  )
}

export default TxStatusWidget
