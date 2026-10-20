import { translateMessage } from '@safe-global/views/i18n'
import { Alert, AlertTitle, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'

interface MigrationPromptProps {
  /** Callback when user wants to proceed with selecting safes */
  onProceed: () => void
}

/**
 * Migration prompt displayed to existing users who have safes but none pinned
 * Explains the new pinned-only security feature and guides them to select trusted safes
 */
const MigrationPrompt = ({ onProceed }: MigrationPromptProps) => {
  return (
    <Alert data-testid="migration-prompt" variant="info" className="mb-4">
      <AlertSeverityIcon variant="info" />
      <AlertTitle>{translateMessage('ui.addToMyAccounts_35ee2ac1')}</AlertTitle>
      <AlertDescription>{translateMessage('ui.onlyAccountsYouAddWillAppear_3b6d79c8')}</AlertDescription>
      <div className="mt-4">
        <Button size="sm" onClick={onProceed} data-testid="select-safes-button">
          {translateMessage('ui.addAccounts_78bc710c')}
        </Button>
      </div>
    </Alert>
  )
}

export default MigrationPrompt
