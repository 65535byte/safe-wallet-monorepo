import { translateMessage } from '@safe-global/views/i18n'
import { Alert, AlertDescription } from '@safe-global/views/components/ui/alert'
import InfoOutlinedIcon from '@safe-global/views/assets/images/notifications/info.svg'

export const TwapFallbackHandlerWarning = () => {
  return (
    <Alert variant="warning" outlined={false} className="mb-2">
      <InfoOutlinedIcon />
      <AlertDescription>
        <b>{translateMessage('ui.enableTWAPsAndSubmitOrder_bc9a993d')}</b>
        {` `}
        {translateMessage('ui.toEnableTWAPOrdersYouNeed_28ad36ab')}
      </AlertDescription>
    </Alert>
  )
}
