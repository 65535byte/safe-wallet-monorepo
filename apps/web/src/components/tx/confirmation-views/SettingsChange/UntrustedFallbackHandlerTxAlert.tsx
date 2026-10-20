import { translateMessage } from '@/i18n'
import type { TransactionDetails } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { useMemo } from 'react'
import { useHasUntrustedFallbackHandler } from '@/hooks/useHasUntrustedFallbackHandler'
import { FallbackHandlerWarning } from '@/components/settings/FallbackHandler'

export const useSetsUntrustedFallbackHandler = (txData: TransactionDetails['txData']): boolean => {
  // multiSend method receives one parameter `transactions`
  const multiSendTransactions =
    txData?.dataDecoded?.method === 'multiSend' && txData?.dataDecoded?.parameters?.[0]?.valueDecoded

  const fallbackHandlers = useMemo(() => {
    const transactions = Array.isArray(multiSendTransactions) ? multiSendTransactions : txData ? [txData] : []

    return Array.isArray(transactions)
      ? transactions
          .map(({ dataDecoded }) =>
            dataDecoded?.method === 'setFallbackHandler'
              ? dataDecoded?.parameters?.find(({ name }) => name === 'handler')?.value
              : undefined,
          )
          .filter((handler) => typeof handler === 'string')
      : []
  }, [multiSendTransactions, txData])

  return useHasUntrustedFallbackHandler(fallbackHandlers)
}

export const UntrustedFallbackHandlerTxText = ({ isTxExecuted = false }: { isTxExecuted?: boolean }) => (
  <>
    <FallbackHandlerWarning
      message={
        <>
          {translateMessage('ui.thisTransaction_250a118f')}
          {isTxExecuted ? translateMessage('ui.hasSet_16d4ace3') : 'sets'} {translateMessage('ui.an_eda6f3d7')}
          <b>{translateMessage('ui.unofficial_35ccf315')}</b> {translateMessage('ui.fallbackHandler_a12d0322')}
        </>
      }
      txBuilderLinkPrefix={isTxExecuted ? translateMessage('ui.itCanBeAlteredViaThe_a9f91b3b') : ''}
    />
    {!isTxExecuted && (
      <>
        <br />
        <b>{translateMessage('ui.proceedWithCaution_6bf72038')}</b>{' '}
        {translateMessage('ui.ensureTheFallbackHandlerAddressIs_96aa69b2')}
      </>
    )}
  </>
)
