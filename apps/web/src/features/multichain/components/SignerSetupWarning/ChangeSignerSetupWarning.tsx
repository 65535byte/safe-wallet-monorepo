import { translateMessage } from '@/i18n'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { useIsMultichainSafe } from '../../hooks/useIsMultichainSafe'
import { useCurrentChain } from '@/hooks/useChains'

export const ChangeSignerSetupWarning = () => {
  const isMultichainSafe = useIsMultichainSafe()
  const currentChain = useCurrentChain()

  if (!isMultichainSafe) return

  return (
    <Alert variant="info" className="my-0 border-none">
      <AlertSeverityIcon variant="info" />
      <AlertDescription>
        {translateMessage('ui.signersAreNotConsistentAcrossNetworks_c71cd5b5', { p0: currentChain?.chainName })}
      </AlertDescription>
    </Alert>
  )
}
