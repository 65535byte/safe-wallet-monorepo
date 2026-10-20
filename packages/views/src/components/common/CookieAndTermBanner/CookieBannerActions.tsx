import { translateMessage } from '@safe-global/views/i18n'
import type { ReactElement } from 'react'
import { Button } from '@safe-global/views/components/ui/button'

const CookieBannerActions = ({
  onAccept,
  onAcceptAll,
}: {
  onAccept: () => void
  onAcceptAll: () => void
}): ReactElement => {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <Button onClick={onAccept} variant="secondary" size="action">
        {translateMessage('ui.saveSettings_63fceb75')}
      </Button>

      <Button onClick={onAcceptAll} variant="default" size="action">
        {translateMessage('ui.acceptAll_66996f50')}
      </Button>
    </div>
  )
}

export default CookieBannerActions
