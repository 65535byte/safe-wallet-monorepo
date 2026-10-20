import { translateMessage } from '@/i18n'
// Be careful what you import here as it will increase the service worker bundle size

import { formatUnits } from 'ethers'
import { type Balance } from '@safe-global/store/gateway/AUTO_GENERATED/balances'
import type { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'

import { WebhookType } from './webhook-types'
import type { WebhookEvent } from './webhook-types'
import { getBalances } from './gateway-utils'

type PushNotificationsMap<T extends WebhookEvent = WebhookEvent> = {
  [P in T['type']]: (
    data: Extract<T, { type: P }>,
    chain?: Chain,
  ) => Promise<{ title: string; body: string }> | { title: string; body: string } | null
}

const getChainName = (chainId: string, chain?: Chain): string => {
  return chain?.chainName ?? `chain ${chainId}`
}

const getCurrencyName = (chain?: Chain): string => {
  return chain?.nativeCurrency?.name ?? 'Ether'
}

const getCurrencySymbol = (chain?: Chain): string => {
  return chain?.nativeCurrency?.symbol ?? 'ETH'
}

const getTokenInfo = async (
  chainId: string,
  safeAddress: string,
  tokenAddress: string,
  tokenValue?: string,
): Promise<{ symbol: string; value: string; name: string }> => {
  const DEFAULT_CURRENCY = 'USD'

  const DEFAULT_INFO = {
    symbol: 'tokens',
    value: 'some',
    name: 'Token',
  }

  let tokenInfo: Balance['tokenInfo'] | undefined

  try {
    const balances = await getBalances({ chainId, safeAddress, fiatCode: DEFAULT_CURRENCY })
    tokenInfo = balances.items.find((token: Balance) => token.tokenInfo.address === tokenAddress)?.tokenInfo
  } catch {
    // Swallow error
  }

  if (!tokenInfo) {
    return DEFAULT_INFO
  }

  const symbol = tokenInfo?.symbol ?? DEFAULT_INFO.symbol
  const value =
    tokenValue && tokenInfo ? formatUnits(tokenValue, tokenInfo.decimals ?? 0).toString() : DEFAULT_INFO.value
  const name = tokenInfo?.name ?? DEFAULT_INFO.name

  return {
    symbol,
    value,
    name,
  }
}

const shortenAddress = (address: string, length = 4): string => {
  if (!address) {
    return ''
  }

  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
}

export const Notifications: PushNotificationsMap = {
  [WebhookType.EXECUTED_MULTISIG_TRANSACTION]: ({ address, failed, txHash, chainId }, chain) => {
    const didFail = failed === 'true'
    return {
      title: translateMessage('ui.transaction_6f78b752', { p0: didFail ? 'failed' : 'executed' }),
      body: translateMessage('ui.onTransaction_c22ee73e', {
        p0: shortenAddress(address),
        p1: getChainName(chainId, chain),
        p2: didFail ? translateMessage('ui.failedToExecute_47f0934c') : translateMessage('ui.executed_9436b795'),
        p3: shortenAddress(txHash),
      }),
    }
  },
  [WebhookType.INCOMING_ETHER]: ({ address, txHash, value, chainId }, chain) => {
    return {
      title: translateMessage('ui.received_add1d244', { p0: getCurrencyName(chain) }),
      body: translateMessage('ui.onReceivedInTransaction_68b80b6e', {
        p0: shortenAddress(address),
        p1: getChainName(chainId, chain),
        p2: formatUnits(value, chain?.nativeCurrency?.decimals).toString(),
        p3: getCurrencySymbol(chain),
        p4: shortenAddress(txHash),
      }),
    }
  },
  [WebhookType.INCOMING_TOKEN]: async ({ address, txHash, tokenAddress, value, chainId }, chain) => {
    const token = await getTokenInfo(chainId, address, tokenAddress, value)
    return {
      title: translateMessage('ui.received_add1d244', { p0: token.name }),
      body: translateMessage('ui.onReceivedInTransaction_68b80b6e', {
        p0: shortenAddress(address),
        p1: getChainName(chainId, chain),
        p2: token.value,
        p3: token.symbol,
        p4: shortenAddress(txHash),
      }),
    }
  },
  [WebhookType.MODULE_TRANSACTION]: ({ address, module, txHash, chainId }, chain) => {
    return {
      title: translateMessage('ui.moduleTransaction_e403ffd3'),
      body: translateMessage('ui.onExecutedAModuleTransactionFrom_cfc7466d', {
        p0: shortenAddress(address),
        p1: getChainName(chainId, chain),
        p2: shortenAddress(txHash),
        p3: shortenAddress(module),
      }),
    }
  },
  [WebhookType.CONFIRMATION_REQUEST]: ({ address, safeTxHash, chainId }, chain) => {
    return {
      title: translateMessage('ui.confirmationRequest_4ef0c471'),
      body: translateMessage('ui.onHasANewConfirmationRequest_f61fe2a3', {
        p0: shortenAddress(address),
        p1: getChainName(chainId, chain),
        p2: shortenAddress(safeTxHash),
      }),
    }
  },
  [WebhookType.SAFE_CREATED]: () => {
    // We do not preemptively subscribe to Safes before they are created
    return null
  },
  // Disabled on the Transaction Service
  [WebhookType._PENDING_MULTISIG_TRANSACTION]: () => {
    // We don't send notifications for pending transactions
    // @see https://github.com/safe-global/safe-transaction-service/blob/master/safe_transaction_service/notifications/tasks.py#L34
    return null
  },
  [WebhookType._NEW_CONFIRMATION]: () => {
    // Disabled for now
    // @see https://github.com/safe-global/safe-transaction-service/blob/master/safe_transaction_service/notifications/tasks.py#L43
    return null
  },
  [WebhookType._OUTGOING_TOKEN]: () => {
    // We don't sen as we have execution notifications
    // @see https://github.com/safe-global/safe-transaction-service/blob/master/safe_transaction_service/notifications/tasks.py#L48
    return null
  },
  [WebhookType._OUTGOING_ETHER]: () => {
    // We don't sen as we have execution notifications
    // @see https://github.com/safe-global/safe-transaction-service/blob/master/safe_transaction_service/notifications/tasks.py#L48
    return null
  },
}
