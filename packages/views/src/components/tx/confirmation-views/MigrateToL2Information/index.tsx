import { translateMessage } from '@safe-global/views/i18n'
import { Alert, AlertTitle, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'

export const MigrateToL2Information = ({ variant }: { variant: 'history' | 'queue' }) => {
  return (
    <div>
      <Alert variant="info">
        <AlertSeverityIcon variant="info" />
        <AlertTitle>{translateMessage('ui.migrationToCompatibleBaseContract_2adeff0c')}</AlertTitle>
        <AlertDescription>
          {variant === 'history'
            ? translateMessage('ui.thisWasUsingAnIncompatibleBase_b8f17b66')
            : translateMessage('ui.thisIsCurrentlyUsingAnIncompatible_82d80ff9')}
        </AlertDescription>
      </Alert>
    </div>
  )
}
