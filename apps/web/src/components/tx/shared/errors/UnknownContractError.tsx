import { translateMessage } from '@/i18n'
import type { TransactionData } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { useMemo, type ReactElement } from 'react'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { isSafeMigrationCall } from '@/utils/safe-migrations'
import { getExplorerLink } from '@safe-global/utils/utils/gateway'
import { useMastercopyMigration } from '@/features/multichain'

const UnknownContractError = ({ txData }: { txData: TransactionData | undefined }): ReactElement | null => {
  const { safeAddress } = useSafeInfo()
  const currentChain = useCurrentChain()
  const { action } = useMastercopyMigration()

  const isMigrationTx = useMemo((): boolean => {
    return txData !== undefined && isSafeMigrationCall(txData)
  }, [txData])

  // Unsupported base contract
  const isUnknown = action === 'migrate' || action === 'cli'

  const isMigrationPossible = action === 'migrate'

  if (!isUnknown || isMigrationTx) return null

  return (
    <ErrorMessage level="error" title={translateMessage('ui.thisAccountWasCreatedWithAn_7ff5acf0')}>
      {isMigrationPossible ? (
        <>{translateMessage('ui.theAccountCanBeMigratedTo_16dac64e')}</>
      ) : (
        <>
          {translateMessage('ui.itShould_4ab1b165')}
          <b>{translateMessage('ui.oNLY_106e25d1')}</b>{' '}
          {translateMessage('ui.beUsedForFundRecoveryTransactions_ba833cd4')}{' '}
          <ExternalLink
            href={currentChain ? getExplorerLink(safeAddress, currentChain.blockExplorerUriTemplate).href : ''}
          >
            {currentChain?.chainName} {translateMessage('ui.explorer_7bf22594')}
          </ExternalLink>
          .
        </>
      )}
    </ErrorMessage>
  )
}

export default UnknownContractError
