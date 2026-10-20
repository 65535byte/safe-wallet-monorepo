import { translateMessage } from '@/i18n'
import { Alert, AlertTitle, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { useCurrentChain } from '@/hooks/useChains'
import ChainSwitcher from '@/components/common/ChainSwitcher'
import useIsWrongChain from '@/hooks/useIsWrongChain'

const NetworkWarning = ({ action }: { action?: string }) => {
  const chain = useCurrentChain()
  const isWrongChain = useIsWrongChain()

  if (!chain || !isWrongChain) return null

  return (
    <Alert variant="warning" outlined={false}>
      <AlertSeverityIcon variant="warning" />
      <AlertTitle className="font-bold">{translateMessage('ui.changeYourWalletNetwork_f0d80d7e')}</AlertTitle>
      <AlertDescription>
        {translateMessage('ui.youAreTryingTo_dd35c5b6')}
        {action || 'sign or execute a transaction'} {translateMessage('ui.on_ba88d5c1')}
        {chain.chainName}
        {translateMessage('ui.makeSureThatYourWalletIs_b1421d69')}
        <div className="mt-4">
          <ChainSwitcher />
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default NetworkWarning
