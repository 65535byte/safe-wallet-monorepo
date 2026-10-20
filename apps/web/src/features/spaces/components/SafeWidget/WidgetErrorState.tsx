import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { CircleAlert } from 'lucide-react'
import { Button } from '@safe-global/views/components/ui/button'
import { WidgetEmptyState } from './WidgetEmptyState'

interface WidgetErrorStateProps {
  message?: string
  onRefresh?: () => void
}

const WidgetErrorState = ({
  message = translateMessage('ui.unableToLoadContent_b6cc4694'),
  onRefresh,
}: WidgetErrorStateProps): ReactElement => {
  return (
    <WidgetEmptyState
      icon={<CircleAlert className="size-6" />}
      text={message}
      subtitle={translateMessage('ui.tryToReloadThePage_7c862d7c')}
      action={
        onRefresh && (
          <Button variant="secondary" size="action" onClick={onRefresh}>
            {translateMessage('ui.reloadPage_e7e8388c')}
          </Button>
        )
      }
    />
  )
}

export { WidgetErrorState }
export type { WidgetErrorStateProps }
