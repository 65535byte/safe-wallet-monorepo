import { translateMessage } from '@/i18n'
import ErrorMessage from '@/components/tx/ErrorMessage'

const NonOwnerError = () => {
  return <ErrorMessage>{translateMessage('ui.youAreCurrentlyNotASigner_8a73c1ee')}</ErrorMessage>
}

export default NonOwnerError
