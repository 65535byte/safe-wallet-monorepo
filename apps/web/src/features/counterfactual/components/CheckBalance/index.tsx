import { translateMessage } from '@/i18n'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import ActivateAccountButton from '../ActivateAccountButton'
import Track from '@/components/common/Track'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { COUNTERFACTUAL_EVENTS } from '@/services/analytics/events/counterfactual'
import { getBlockExplorerLink } from '@safe-global/utils/utils/chains'
import { Alert, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Typography } from '@safe-global/views/components/ui/typography'

const CheckBalance = () => {
  const { safe, safeAddress } = useSafeInfo()
  const chain = useCurrentChain()

  if (safe.deployed) return null

  const blockExplorerLink = chain ? getBlockExplorerLink(chain, safeAddress) : undefined

  return (
    <Alert data-testid="no-tokens-alert" variant="info" className="mx-auto mt-6 flex max-w-[600px] flex-col px-6 py-4">
      <AlertSeverityIcon variant="info" />
      <Typography variant="paragraph-bold" className="mb-2">
        {translateMessage('ui.donTSeeYourTokens_78df7296')}
      </Typography>
      <Typography variant="paragraph-small" className="block mb-4">
        {translateMessage('ui.yourAccountIsNotActivatedYet_6d59727d')}{' '}
        {blockExplorerLink && (
          <>
            {translateMessage('ui.youCanAlwaysViewAllOf_506c5fc7')}{' '}
            <Track {...COUNTERFACTUAL_EVENTS.CHECK_BALANCES}>
              <ExternalLink href={blockExplorerLink.href}>{translateMessage('ui.blockExplorer_3edcd71e')}</ExternalLink>
            </Track>
          </>
        )}
      </Typography>

      <ActivateAccountButton />
    </Alert>
  )
}

export default CheckBalance
