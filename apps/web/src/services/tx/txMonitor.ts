import { translateMessage } from '@/i18n'
import { didRevert, type EthersError } from '@/utils/ethers-utils'

import { txDispatch, TxEvent } from '@/services/tx/txEvents'

import { POLLING_INTERVAL } from '@/config/constants'
import { getSafeTransaction } from '@/utils/transactions'
import { asError } from '@safe-global/utils/services/exceptions/utils'
import { type JsonRpcProvider, type TransactionReceipt } from 'ethers'
import { SimpleTxWatcher } from '@/utils/SimpleTxWatcher'
import { getRelayTxStatus, RelayStatus } from '@safe-global/utils/services/RelayTxWatcher'
import { getBaseUrl } from '@safe-global/store/gateway/cgwClient'

export function _getRemainingTimeout(defaultTimeout: number, submittedAt?: number) {
  const timeoutInMs = defaultTimeout * 60_000
  const timeSinceSubmission = submittedAt !== undefined ? Date.now() - submittedAt : 0

  return Math.max(timeoutInMs - timeSinceSubmission, 1)
}

// Provider must be passed as an argument as it is undefined until initialised by `useInitWeb3`
export const waitForTx = async (
  provider: JsonRpcProvider,
  txIds: string[],
  txHash: string,
  safeAddress: string,
  walletAddress: string,
  walletNonce: number,
  nonce: number,
  chainId: string,
) => {
  const processReceipt = (receipt: TransactionReceipt | null, txIds: string[]) => {
    if (receipt === null) {
      txIds.forEach((txId) => {
        txDispatch(TxEvent.FAILED, {
          nonce,
          txId,
          chainId,
          safeAddress,
          error: new Error(translateMessage('ui.transactionNotFoundItMightHave_803b77d9')),
        })
      })
    } else if (didRevert(receipt)) {
      txIds.forEach((txId) => {
        txDispatch(TxEvent.REVERTED, {
          nonce,
          txId,
          chainId,
          safeAddress,
          error: new Error(translateMessage('ui.transactionRevertedByEVM_3d1d4ee1')),
        })
      })
    } else {
      txIds.forEach((txId) => {
        txDispatch(TxEvent.PROCESSED, {
          nonce,
          txId,
          chainId,
          safeAddress,
          txHash,
        })
      })
    }
  }

  const processError = (err: any, txIds: string[]) => {
    const error = err as EthersError

    txIds.forEach((txId) => {
      txDispatch(TxEvent.FAILED, {
        nonce,
        txId,
        chainId,
        safeAddress,
        error: asError(error),
      })
    })
  }

  try {
    const isSafeTx = !!(await getSafeTransaction(txHash, chainId, safeAddress))
    if (isSafeTx) {
      // Poll for the transaction until it has a transactionHash and start the watcher
      const interval = setInterval(async () => {
        const safeTx = await getSafeTransaction(txHash, chainId, safeAddress)
        if (!safeTx?.txHash) return

        clearInterval(interval)

        const receipt = await SimpleTxWatcher.getInstance().watchTxHash(
          safeTx.txHash,
          walletAddress,
          walletNonce,
          provider,
        )
        processReceipt(receipt, txIds)
      }, POLLING_INTERVAL)
    } else {
      const receipt = await SimpleTxWatcher.getInstance().watchTxHash(txHash, walletAddress, walletNonce, provider)
      processReceipt(receipt, txIds)
    }
  } catch (error) {
    processError(error, txIds)
  }
}

const WAIT_FOR_RELAY_TIMEOUT = 3 * 60_000 // 3 minutes

export const waitForRelayedTx = (
  taskId: string,
  txIds: string[],
  chainId: string,
  safeAddress: string,
  nonce: number,
  groupKey?: string,
): void => {
  const baseUrl = getBaseUrl()
  if (!baseUrl) {
    txIds.forEach((txId) =>
      txDispatch(TxEvent.FAILED, {
        nonce,
        txId,
        chainId,
        safeAddress,
        error: new Error('CGW base URL not configured'),
        groupKey,
      }),
    )
    return
  }

  let intervalId: NodeJS.Timeout
  let failAfterTimeoutId: NodeJS.Timeout

  intervalId = setInterval(async () => {
    const relayStatus = await getRelayTxStatus(baseUrl, chainId, taskId)

    // Request failed or not found yet
    if (!relayStatus) {
      return
    }

    switch (relayStatus.status) {
      case RelayStatus.Included:
        txIds.forEach((txId) =>
          txDispatch(TxEvent.PROCESSED, {
            nonce,
            txId,
            groupKey,
            chainId,
            safeAddress,
            txHash: relayStatus.receipt?.transactionHash,
          }),
        )
        break
      case RelayStatus.Reverted:
        txIds.forEach((txId) =>
          txDispatch(TxEvent.REVERTED, {
            nonce,
            txId,
            chainId,
            safeAddress,
            error: new Error(translateMessage('ui.relayedTransactionReverted_708b5cfb')),
            groupKey,
          }),
        )
        break
      case RelayStatus.Rejected:
        txIds.forEach((txId) =>
          txDispatch(TxEvent.FAILED, {
            nonce,
            txId,
            chainId,
            safeAddress,
            error: new Error(translateMessage('ui.relayedTransactionWasRejectedByRelay_41a64231')),
            groupKey,
          }),
        )
        break
      default:
        // Pending or Submitted — keep polling
        return
    }

    clearTimeout(failAfterTimeoutId)
    clearInterval(intervalId)
  }, POLLING_INTERVAL)

  failAfterTimeoutId = setTimeout(() => {
    txIds.forEach((txId) =>
      txDispatch(TxEvent.FAILED, {
        nonce,
        txId,
        chainId,
        safeAddress,
        error: new Error(
          translateMessage('ui.transactionNotRelayedInMinutesBe_0cb92b66', { p0: WAIT_FOR_RELAY_TIMEOUT / 60_000 }),
        ),
        groupKey,
      }),
    )

    clearInterval(intervalId)
  }, WAIT_FOR_RELAY_TIMEOUT)
}
