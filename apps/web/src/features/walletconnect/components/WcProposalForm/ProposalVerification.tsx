import { translateMessage } from '@/i18n'
import type { WalletKitTypes } from '@reown/walletkit'
import { Alert, AlertDescription } from '@safe-global/views/components/ui/alert'
import AlertIcon from '@/public/images/notifications/alert.svg'
import type { ReactElement } from 'react'
import { getPeerName } from '../../services/utils'
import css from './styles.module.css'

const ProposalVerification = ({ proposal }: { proposal: WalletKitTypes.SessionProposal }): ReactElement | null => {
  const { isScam, validation } = proposal.verifyContext.verified

  if (validation === 'UNKNOWN' || validation === 'VALID') {
    return null
  }

  const appName = getPeerName(proposal.params.proposer)

  return (
    <Alert variant="destructive" className={css.alert}>
      <AlertIcon className="size-6 [&_path]:fill-[var(--color-error-main)]" />
      <AlertDescription>
        {isScam
          ? translateMessage('ui.wePreventConnectingToAsThey_7e19e1b9', { p0: appName || 'this dApp' })
          : translateMessage('ui.hasADomainThatDoesNot_2ea40928', { p0: appName || 'This dApp' })}
      </AlertDescription>
    </Alert>
  )
}
export default ProposalVerification
