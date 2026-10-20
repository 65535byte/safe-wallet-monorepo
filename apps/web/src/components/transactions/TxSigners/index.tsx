import { translateMessage } from '@/i18n'
import type { TransactionDetails, Transaction } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { type ReactElement } from 'react'
import { Copy } from 'lucide-react'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import TxConfirmations from '@safe-global/views/components/transactions/TxConfirmations'
import { AuditLog, AuditRow, AuditLogHeader, useCopyToClipboard } from '@/components/common/AuditLog'

import useWallet from '@/hooks/wallets/useWallet'
import useIsPending from '@/hooks/useIsPending'
import {
  isCancellationTxInfo,
  isExecutable,
  isModuleDetailedExecutionInfo,
  isMultisigDetailedExecutionInfo,
} from '@/utils/transaction-guards'
import ExplorerFallbackIcon from '@safe-global/views/assets/images/common/link.svg'
import HashIcon from '@/public/images/common/hash.svg'

import useSafeInfo from '@/hooks/useSafeInfo'
import useTransactionStatus from '@/hooks/useTransactionStatus'
import useAddressBook from '@/hooks/useAddressBook'
import { useCurrentChain } from '@/hooks/useChains'
import { getBlockExplorerLink } from '@safe-global/utils/utils/chains'
import { CopyDeeplinkLabels } from '@/services/analytics'
import TxShareLinkWrapper from '@/components/transactions/TxShareLink/TxShareLink'
import { useLoadFeature } from '@/features/__core__'
import { SafenetChecksFeature, useIsSafenetChecksEnabled } from '@/features/safenet-checks'
import { CheckStatus } from '@safe-global/utils/features/safenet-checks'
import { useSafenetCheck } from '@safe-global/utils/features/safenet-checks/hooks'
import ExplorerButton from '@safe-global/views/components/common/ExplorerButton'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3ReadOnly'
import useAsync from '@safe-global/utils/hooks/useAsync'

const WAITING_STATUSES = new Set([
  translateMessage('ui.awaitingConfirmations_8f51482e'),
  translateMessage('ui.awaitingExecution_028707aa'),
  translateMessage('ui.needsYourConfirmation_120ee18e'),
  translateMessage('ui.awaitingReview_8fc63464'),
])
const shortenAuditStatus = (status: string): string => (WAITING_STATUSES.has(status) ? 'Waiting' : status)

type TxSignersProps = {
  txDetails: TransactionDetails
  txSummary: Transaction
  isTxFromProposer: boolean
  proposer?: string
  isExpired?: boolean
}

const CopyTxHashButton = ({ txHash }: { txHash?: string | null }) => {
  const [copied, handleCopy] = useCopyToClipboard(txHash)

  if (!txHash) {
    return (
      <Tooltip>
        {/* A disabled button receives neither pointer nor focus events, so the tooltip has to hang
            off a wrapper or the hint is unreachable by every input method. */}
        <TooltipTrigger
          render={
            <span tabIndex={0}>
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-inherit"
                disabled
                aria-label={translateMessage('ui.copyTransactionHash_4345c3df')}
              >
                <HashIcon className="size-4" />
              </Button>
            </span>
          }
        />
        <TooltipContent side="top">{translateMessage('ui.availableAfterExecution_a3ad2a73')}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            data-testid="copy-tx-hash-btn"
            variant="ghost"
            size="icon-xs"
            className="text-inherit"
            onClick={handleCopy}
            // MUI's Tooltip put its `title` on the child as an aria-label; Base UI's wires no ARIA at
            // all, so an icon-only trigger needs its own name or it announces as just "button".
            aria-label={translateMessage('ui.copyTransactionHash_4345c3df')}
          >
            <HashIcon className="size-4" />
          </Button>
        }
      />
      <TooltipContent side="top">
        {copied ? translateMessage('ui.copied_6ec3e1e2') : translateMessage('ui.copyTransactionHash_4345c3df')}
      </TooltipContent>
    </Tooltip>
  )
}

const TxAuditLogActions = ({
  txId,
  txHash,
  explorerLink,
}: {
  txId: string
  txHash?: string | null
  explorerLink?: { title: string; href: string }
}) => (
  <>
    <CopyTxHashButton txHash={txHash} />
    {/* No Tooltip of its own: TxShareLinkWrapper wraps this in CopyTooltip, which already supplies a
        TooltipTrigger and its own "Copy the transaction URL" content. A second one nested inside
        opened two tooltips at once on hover. The aria-label carries the accessible name. */}
    <TxShareLinkWrapper id={txId} eventLabel={CopyDeeplinkLabels.shareBlock}>
      <Button
        data-testid="share-tx-link-btn"
        variant="ghost"
        size="icon-xs"
        className="text-inherit"
        aria-label={translateMessage('ui.copyTransactionLink_ad3fc406')}
      >
        <Copy className="size-4" />
      </Button>
    </TxShareLinkWrapper>
    {explorerLink ? (
      <ExplorerButton {...explorerLink} isCompact />
    ) : (
      <Tooltip>
        <TooltipTrigger
          render={
            <span tabIndex={0}>
              <Button
                variant="ghost"
                size="icon-xs"
                disabled
                aria-label={translateMessage('ui.viewOnBlockExplorer_4378f4ce')}
              >
                <ExplorerFallbackIcon className="size-4" />
              </Button>
            </span>
          }
        />
        <TooltipContent side="top">{translateMessage('ui.availableAfterExecution_a3ad2a73')}</TooltipContent>
      </Tooltip>
    )}
  </>
)

const TxSigners = ({
  txDetails,
  txSummary,
  isTxFromProposer,
  proposer,
  isExpired,
}: TxSignersProps): ReactElement | null => {
  const { detailedExecutionInfo, txInfo, txId } = txDetails
  const isPending = useIsPending(txId)
  const txStatus = useTransactionStatus(txSummary)
  const wallet = useWallet()
  const { safe } = useSafeInfo()
  const addressBook = useAddressBook()
  const chain = useCurrentChain()
  const safenet = useLoadFeature(SafenetChecksFeature)
  const isSafenetEnabled = useIsSafenetChecksEnabled()

  const isMultisig = isMultisigDetailedExecutionInfo(detailedExecutionInfo)
  const isModule = isModuleDetailedExecutionInfo(detailedExecutionInfo)

  // Subscribed here as well as inside the row (same cache entry, one chain
  // read) so the sibling rows' isLast can account for the Safenet step. The
  // undefined hash skips the read entirely while the flag is off.
  const safenetHash = isSafenetEnabled && isMultisig ? detailedExecutionInfo.safeTxHash : undefined
  const safenetCheck = useSafenetCheck(safenetHash, isMultisig ? detailedExecutionInfo.submittedAt : null, {
    chainId: safe.chainId,
    safeAddress: safe.address.value,
  })
  // Must mirror SafenetAuditRow's own render gate, or the connector math drifts.
  const showsSafenetRow =
    !!safenetHash && !!safenetCheck.snapshot && safenetCheck.publicStatus !== CheckStatus.UNAVAILABLE

  // Lookup the EOA that submitted the transaction on-chain (for module and incoming txs)
  const readOnlyProvider = useWeb3ReadOnly()
  const [onChainFrom] = useAsync(async () => {
    if (isMultisig || !txDetails.txHash || !readOnlyProvider) return undefined
    const tx = await readOnlyProvider.getTransaction(txDetails.txHash)
    return tx?.from
  }, [isMultisig, txDetails.txHash, readOnlyProvider])

  const explorerLink = chain && txDetails.txHash ? getBlockExplorerLink(chain, txDetails.txHash) : undefined

  const resolveName = (address: string | undefined, apiFallback?: string | null): string | undefined =>
    address ? addressBook[address] || apiFallback || undefined : undefined

  if (!isMultisig && !isModule) {
    if (!txDetails.executedAt) return null

    return (
      <AuditLog data-testid="transaction-actions-list">
        <AuditLogHeader
          actions={<TxAuditLogActions txId={txId} txHash={txDetails.txHash} explorerLink={explorerLink} />}
        />
        <AuditRow
          label={translateMessage('ui.executed_5762f231')}
          actionType="executed"
          address={onChainFrom}
          name={resolveName(onChainFrom)}
          timestamp={txDetails.executedAt}
          isLast
        />
      </AuditLog>
    )
  }

  // Module-executed transaction: Created (initiator EOA) + Executed (module)
  if (isModule && detailedExecutionInfo) {
    const moduleAddress = detailedExecutionInfo.address.value
    // "AllowanceModule" → "Allowance Module"
    const moduleName = detailedExecutionInfo.address.name?.replace(/([a-z])([A-Z])/g, '$1 $2')

    return (
      <AuditLog data-testid="transaction-actions-list">
        <AuditLogHeader
          actions={<TxAuditLogActions txId={txId} txHash={txDetails.txHash} explorerLink={explorerLink} />}
        />

        <AuditRow
          label={translateMessage('ui.created_d8278ec8')}
          actionType="created"
          address={onChainFrom}
          name={resolveName(onChainFrom)}
          timestamp={txDetails.executedAt}
        />

        <AuditRow
          label={translateMessage('ui.executed_5762f231')}
          actionType="executed"
          address={moduleAddress}
          name={resolveName(moduleAddress, moduleName)}
          timestamp={txDetails.executedAt}
          isLast
        />
      </AuditLog>
    )
  }

  // Multisig transaction: full audit log with confirmations
  // At this point isMultisig is true and both !isMultisig and isModule branches have returned
  const multisigInfo = detailedExecutionInfo!
  const { confirmations, confirmationsRequired, executor, submittedAt } = multisigInfo

  const canExecute = wallet?.address ? isExecutable(txSummary, wallet.address, safe) : false
  const confirmationsNeeded = confirmationsRequired - confirmations.length
  const isConfirmed = confirmationsNeeded <= 0 || canExecute

  const isCancellation = isCancellationTxInfo(txInfo)

  const creationLabel = isTxFromProposer ? 'Proposed' : translateMessage('ui.created_d8278ec8')
  const signingLabel = (idx: number) =>
    translateMessage('ui.signed_1a0692d9', { p0: idx + 1, p1: confirmationsRequired })

  const executionStatus = executor
    ? translateMessage('ui.executed_5762f231')
    : isPending
      ? txStatus
      : shortenAuditStatus(isTxFromProposer && !isConfirmed ? translateMessage('ui.awaitingReview_8fc63464') : txStatus)

  const showExecutionRow = isConfirmed || !!executor || txDetails.txStatus !== 'AWAITING_CONFIRMATIONS'

  return (
    <AuditLog data-testid="transaction-actions-list">
      <AuditLogHeader
        chip={
          <TxConfirmations
            submittedConfirmations={confirmations.length}
            requiredConfirmations={confirmationsRequired}
          />
        }
        actions={<TxAuditLogActions txId={txId} txHash={txDetails.txHash} explorerLink={explorerLink} />}
      />

      <AuditRow
        label={creationLabel}
        actionType="created"
        address={proposer}
        name={resolveName(proposer, multisigInfo.proposer?.name || multisigInfo.proposedByDelegate?.name)}
        timestamp={submittedAt}
        isLast={confirmations.length === 0 && !showsSafenetRow && !showExecutionRow}
      />

      {confirmations.map(({ signer, submittedAt: signedAt }, idx) => (
        <AuditRow
          key={signer.value}
          label={signingLabel(idx)}
          actionType="signed"
          address={signer.value}
          name={resolveName(signer.value, signer.name)}
          timestamp={signedAt}
          isLast={idx === confirmations.length - 1 && !showsSafenetRow && !showExecutionRow}
        />
      ))}

      {/* Safenet check step (PRD: between the signatures and execution). The
          feature registry stubs this to null while the flag is off; the row
          itself renders nothing unless a check was observed for this hash. */}
      <safenet.SafenetAuditRow
        safeTxHash={multisigInfo.safeTxHash}
        chainId={safe.chainId}
        timestampMs={submittedAt}
        isLast={!showExecutionRow}
      />

      {showExecutionRow && (
        <AuditRow
          label={executionStatus}
          actionType="executed"
          address={executor?.value}
          name={resolveName(executor?.value, executor?.name)}
          timestamp={txDetails.executedAt}
          isLast
        />
      )}

      {confirmationsNeeded > 0 && !executor && !isExpired && (
        <Alert variant="info" className="mt-4">
          <AlertSeverityIcon variant="info" />
          <AlertDescription>
            {isCancellation
              ? translateMessage('ui.cancellationCanBeExecutedOnceThe_46afc983')
              : translateMessage('ui.canBeExecutedOnceTheThreshold_8e028187')}
          </AlertDescription>
        </Alert>
      )}

      {isTxFromProposer && !executor && !isExpired && (
        <Alert variant="info" className="mt-4">
          <AlertSeverityIcon variant="info" />
          <AlertDescription>
            {isCancellation
              ? translateMessage('ui.thisOnChainRejectionWasInitiated_b9216014')
              : translateMessage('ui.thisTransactionWasCreatedByA_c313bfec')}
          </AlertDescription>
        </Alert>
      )}

      {isExpired && !executor && (
        <Alert variant="warning" outlined={false} className="mt-4">
          <AlertSeverityIcon variant="warning" />
          <AlertDescription>{translateMessage('ui.thisOrderHasExpiredRejectThis_d32ba91f')}</AlertDescription>
        </Alert>
      )}
    </AuditLog>
  )
}

export default TxSigners
