import { translateMessage } from '@safe-global/views/i18n'
import { Alert, AlertAction, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'

const SafeLimitError = ({ onRetry }: { onRetry: () => void }) => (
  <Alert variant="destructive" className="shrink-0" data-testid="safe-limit-error">
    <AlertSeverityIcon variant="destructive" />
    <AlertDescription>{translateMessage('ui.weCouldnTLoadHowMany_7712790a')}</AlertDescription>
    <AlertAction>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        {translateMessage('ui.retry_2cd6945d')}
      </Button>
    </AlertAction>
  </Alert>
)

export default SafeLimitError
