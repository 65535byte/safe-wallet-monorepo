import { translateMessage } from '@/i18n'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useMemo } from 'react'
import type { ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import { InfoDetails } from '@safe-global/views/components/transactions/InfoDetails'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { useIsRecoverer } from '../../hooks/useIsRecoverer'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getRecoveredSafeInfo } from '../../services/transaction-list'
import type { RecoveryQueueItem } from '../../services/recovery-state'

export default function RecoveryDescription({ item }: { item: RecoveryQueueItem }): ReactElement {
  const { args, isMalicious } = item
  const { safe } = useSafeInfo()
  const isRecoverer = useIsRecoverer()

  // Keyed on the owner addresses, not the array: a safe-info refresh rebuilds the array.
  const ownersKey = safe.owners.map((owner) => owner.value).join(',')

  const newSetup = useMemo(
    () => getRecoveredSafeInfo(safe, { to: args.to, value: args.value.toString(), data: args.data }),
    // We only render the threshold and owners
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [args.data, args.to, args.value, safe.threshold, ownersKey],
  )

  if (isMalicious) {
    return (
      <ErrorMessage>{translateMessage('ui.thisTransactionPotentiallyCallsMaliciousActions_740f0a43')}</ErrorMessage>
    )
  }

  // TODO: Improve by using Tenderly to check if the proposal will fail
  if (!newSetup || newSetup.owners.length === 0) {
    return (
      <ErrorMessage>
        {translateMessage('ui.thisRecoveryProposalWillFailAs_5a503d78')}
        {isRecoverer ? translateMessage('ui.andTryingAgain_3053f58a') : ''}.
      </ErrorMessage>
    )
  }

  return (
    <InfoDetails title={translateMessage('ui.addSignerS_c859d792')}>
      {newSetup.owners.map((owner) => (
        <EthHashInfo key={owner.value} address={owner.value} shortAddress={false} showCopyButton hasExplorer />
      ))}

      <div>
        <Typography variant="paragraph-bold" className="mb-2">
          {translateMessage('ui.requiredConfirmationsForNewTransactions_5c5fcf18')}
        </Typography>
        <Typography>
          {newSetup.threshold} {translateMessage('ui.outOf_d22acd25')}
          {newSetup.owners.length} {translateMessage('ui.ownerS_b0ef869e')}
        </Typography>
      </div>
    </InfoDetails>
  )
}
