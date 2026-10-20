import { translateMessage } from '@/i18n'
import React from 'react'
import { X } from 'lucide-react'
import { Alert, AlertTitle, AlertAction, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'

import { HelpCenterArticle } from '@safe-global/utils/config/constants'

type ThirdPartyCookiesWarningProps = {
  onClose: () => void
}

export const ThirdPartyCookiesWarning = ({ onClose }: ThirdPartyCookiesWarningProps): React.ReactElement => {
  return (
    <Alert
      variant="warning"
      outlined={false}
      className="rounded-none border-0 border-b border-[var(--color-warning-main)]"
    >
      <AlertSeverityIcon variant="warning" />
      <AlertTitle>
        {translateMessage('ui.thirdPartyCookiesAreDisabledSafe_c782d77c')}{' '}
        <ExternalLink href={HelpCenterArticle.COOKIES}>{translateMessage('ui.here_134b2f0e')}</ExternalLink>
      </AlertTitle>
      <AlertAction>
        <Button variant="ghost" size="icon-sm" aria-label={translateMessage('ui.close_fbd8cee0')} onClick={onClose}>
          <X />
        </Button>
      </AlertAction>
    </Alert>
  )
}
