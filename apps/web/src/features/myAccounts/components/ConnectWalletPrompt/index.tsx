import { translateMessage } from '@/i18n'
import { Alert, AlertTitle, AlertDescription } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'
import { WalletIcon } from 'lucide-react'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'

/**
 * Prompt displayed when user is not connected to a wallet
 * Guides them to connect to see their Safes
 */
const ConnectWalletPrompt = () => {
  const connectWallet = useConnectWallet()

  return (
    <Alert data-testid="connect-wallet-prompt" className="mb-4">
      <WalletIcon />
      <AlertTitle>{translateMessage('ui.connectYourWallet_18e55c51')}</AlertTitle>
      <AlertDescription className="mb-4">{translateMessage('ui.connectYourWalletToViewAnd_1d7696b5')}</AlertDescription>
      <div>
        <Button size="sm" onClick={connectWallet} data-testid="connect-wallet-button">
          <WalletIcon />
          {translateMessage('ui.connectWallet_301090ba')}
        </Button>
      </div>
    </Alert>
  )
}

export default ConnectWalletPrompt
