import { translateMessage } from '@/i18n'
import ErrorMessage from '@/components/tx/ErrorMessage'

const WalletRejectionError = () => {
  return <ErrorMessage>{translateMessage('ui.userRejectedSigning_d1a98a28')}</ErrorMessage>
}

export default WalletRejectionError
