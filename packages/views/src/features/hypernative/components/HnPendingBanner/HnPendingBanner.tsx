import { translateMessage } from '@safe-global/views/i18n'
import { X as CloseIcon } from 'lucide-react'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import StatusPendingIcon from '@safe-global/views/assets/images/hypernative/status-pending.svg'
import type { WithHnSignupFlowProps } from '@safe-global/views/features/hypernative/components/withHnSignupFlow/types'
import css from './styles.module.css'
import type { ReactElement } from 'react'

export interface HnPendingBannerProps extends WithHnSignupFlowProps {
  onDismiss?: () => void
}

/**
 * Pure HnPendingBanner component without side effects.
 * Receives onDismiss callback from parent wrapper.
 */
export const HnPendingBanner = ({ onDismiss }: HnPendingBannerProps): ReactElement => {
  return (
    <div className={css.banner}>
      <div className={`flex flex-row items-start gap-2 ${css.content}`}>
        <div className={css.iconContainer}>
          <StatusPendingIcon className={css.icon} />
        </div>
        <div className={css.textContainer}>
          <Typography variant="paragraph-bold" className={css.title}>
            {translateMessage('ui.guardianSetupInProgress_2bda4f1e')}
          </Typography>
          <Typography variant="paragraph-small" className={css.description}>
            {translateMessage('ui.weVeReceivedYourRequestAnd_1c057a35')}
          </Typography>
        </div>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          className={css.closeButton}
          aria-label={translateMessage('ui.close_aaaeeafe')}
          onClick={onDismiss}
        >
          <CloseIcon />
        </Button>
      )}
    </div>
  )
}
