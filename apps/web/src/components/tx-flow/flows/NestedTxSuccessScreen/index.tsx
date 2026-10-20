import { translateMessage } from '@/i18n'
import { useState, useEffect } from 'react'
import { PendingStatus, selectPendingTxById } from '@/store/pendingTxsSlice'
import EthHashInfo from '@/components/common/EthHashInfo'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useAddressBook from '@/hooks/useAddressBook'
import NestedSafeIcon from '@/public/images/transactions/nestedTx.svg'
import ArrowDownIcon from '@/public/images/common/arrow-down.svg'

import css from './styles.module.css'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import { useAppSelector } from '@/store'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { MODALS_EVENTS } from '@/services/analytics'
import Track from '@/components/common/Track'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useUrlSpaceId, withSpaceId } from '@/hooks/useUrlSpaceId'
import { useCurrentChain } from '@/hooks/useChains'
import { getExplorerLink } from '@safe-global/utils/utils/gateway'

type Props = {
  txId: string
}
const NestedTxSuccessScreen = ({ txId }: Props) => {
  const addressBook = useAddressBook()
  const spaceId = useUrlSpaceId()

  // _pendingTx eventually clears from the store, so we need to cache it
  const _pendingTx = useAppSelector((state) => (txId ? selectPendingTxById(state, txId) : undefined))
  const [cachedPendingTx, setCachedPendingTx] = useState(_pendingTx)
  useEffect(() => {
    if (_pendingTx) {
      setCachedPendingTx(_pendingTx)
    }
  }, [_pendingTx])

  const chain = useCurrentChain()

  // Executed → on-chain tx hash; queued → the parent's safeTxHash
  const isExecuted = cachedPendingTx?.status === PendingStatus.NESTED_SIGNING && cachedPendingTx.executed
  const explorerLink =
    isExecuted && chain
      ? getExplorerLink(cachedPendingTx.txHashOrParentSafeTxHash, chain.blockExplorerUriTemplate)
      : undefined

  if (cachedPendingTx?.status !== PendingStatus.NESTED_SIGNING) {
    return <ErrorMessage>{translateMessage('ui.noTransactionDataFound_302b0ff3')}</ErrorMessage>
  }

  const currentSafeAddress = addressBook[cachedPendingTx.safeAddress]
  const parentSafeAddress = addressBook[cachedPendingTx.signerAddress]
  const isExecTransaction = cachedPendingTx.method === 'execTransaction'

  return (
    <div className="mx-auto w-full max-w-[825px] rounded-lg bg-[var(--color-background-paper)] text-center">
      <div className="mt-6 flex flex-col items-center gap-4 p-6">
        <div className={css.icon}>
          <NestedSafeIcon className="size-9" aria-label={translateMessage('ui.nested_945d8f67')} />
        </div>
        <Typography data-testid="transaction-status" variant="h4" className="mt-4">
          {isExecuted
            ? translateMessage('ui.transactionSubmitted_a5db0a72')
            : translateMessage('ui.oneMoreStepInTheParent_d59ad674')}
        </Typography>
        <Typography variant="paragraph-small" className="mb-6 block">
          {isExecuted
            ? translateMessage('ui.theParentExecutedThisTransactionOn_2a45ed1e')
            : isExecTransaction
              ? translateMessage('ui.executingAsTheParentCreatedA_6dbec12f')
              : translateMessage('ui.signingAsTheParentCreatedAn_d72782ea')}
        </Typography>
        <div className="flex w-[70%] flex-col gap-4">
          <div className="flex flex-col items-start gap-2">
            <Typography variant="paragraph-small" className="text-[var(--color-text-secondary)]">
              {translateMessage('ui.parent_0517a13e')}
            </Typography>
            <EthHashInfo address={cachedPendingTx.signerAddress} name={parentSafeAddress} shortAddress={false} />
          </div>
          <div className="flex flex-row items-center gap-4 pl-2">
            <ArrowDownIcon className="size-6 text-[var(--color-border-main)]" />
            <Typography
              variant="code"
              className="rounded-sm bg-[var(--color-background-main)] px-2 py-0.5 font-mono whitespace-nowrap text-[var(--color-primary-light)]"
            >
              {cachedPendingTx.method}
            </Typography>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Typography variant="paragraph-small" className="text-[var(--color-text-secondary)]">
              {translateMessage('ui.current_7bfb35e9')}
            </Typography>
            <EthHashInfo address={cachedPendingTx.safeAddress} name={currentSafeAddress} shortAddress={false} />
          </div>
        </div>
        <Track {...MODALS_EVENTS.OPEN_PARENT_TX}>
          {explorerLink ? (
            <ExternalLink href={explorerLink.href} mode="button">
              {translateMessage('ui.openTheTransaction_c1f51ec2')}
            </ExternalLink>
          ) : (
            <Link
              href={{
                pathname: AppRoutes.transactions.tx,
                query: withSpaceId(
                  {
                    safe: cachedPendingTx.signerAddress,
                    chainId: cachedPendingTx.chainId,
                    id: cachedPendingTx.txHashOrParentSafeTxHash,
                  },
                  spaceId,
                ),
              }}
              passHref
              legacyBehavior
            >
              <ExternalLink mode="button">{translateMessage('ui.openTheTransaction_c1f51ec2')}</ExternalLink>
            </Link>
          )}
        </Track>
      </div>
    </div>
  )
}

export default NestedTxSuccessScreen
