import { translateMessage } from '@/i18n'
import { Alert, AlertTitle, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import useWallet from '@/hooks/wallets/useWallet'
import ConnectWalletButton from '@/components/common/ConnectWallet/ConnectWalletButton'

const NoWalletConnectedWarning = () => {
  const wallet = useWallet()

  if (wallet) {
    return null
  }

  return (
    <Alert variant="warning" outlined={false} className="mt-6">
      <AlertSeverityIcon variant="warning" />
      <AlertTitle className="font-bold">{translateMessage('ui.noWalletConnected_c948712d')}</AlertTitle>
      <AlertDescription>
        {translateMessage('ui.youNeedToConnectAWallet_9d74b2e3')}
        <div className="mt-4">
          <ConnectWalletButton variant="outline" className="text-foreground" />
        </div>
      </AlertDescription>
    </Alert>
  )
}

export default NoWalletConnectedWarning
