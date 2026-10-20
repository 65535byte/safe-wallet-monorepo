import { translateMessage } from '@/i18n'
import { X as CloseIcon } from 'lucide-react'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import Image from 'next/image'
import Track from '@/components/common/Track'
import type { WithHnSignupFlowProps } from '../withHnSignupFlow'
import css from './styles.module.css'
import { HYPERNATIVE_EVENTS, HYPERNATIVE_SOURCE, MixpanelEventParams } from '@/services/analytics'

export interface HnMiniTxBannerProps extends WithHnSignupFlowProps {
  onDismiss: () => void
}

/**
 * Mini Hypernative banner component for transaction flows.
 * Compact, clickable banner that opens the Hypernative signup flow.
 * Uses the same custom background and theme as HnBanner.
 */
export const HnMiniTxBanner = ({ onHnSignupClick, onDismiss }: HnMiniTxBannerProps) => {
  const handleClick = () => {
    onHnSignupClick()
  }

  const handleDismissClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDismiss()
  }

  return (
    <Track
      {...HYPERNATIVE_EVENTS.GUARDIAN_FORM_VIEWED}
      label={HYPERNATIVE_SOURCE.NewTransaction}
      mixpanelParams={{
        [MixpanelEventParams.SOURCE]: HYPERNATIVE_SOURCE.NewTransaction,
      }}
    >
      <div className={css.banner} onClick={handleClick}>
        <div className={`flex flex-row items-center gap-3 ${css.bannerStack}`}>
          <Image
            className={css.bannerImage}
            src="/images/hypernative/guardian-badge.svg"
            alt={translateMessage('ui.guardianBadge_ddb92c27')}
            width={32}
            height={32}
          />
          <div className={css.bannerContent}>
            <Typography variant="paragraph-small" className={css.bannerTitle}>
              {translateMessage('ui.enforceEnterpriseGradeSecurity_47eda011')}
            </Typography>
            <Typography variant="paragraph-mini" className={css.bannerDescription}>
              {translateMessage('ui.learnMore_0c11daba')}
            </Typography>
          </div>
        </div>

        <Button
          variant="ghost"
          className={css.closeButton}
          aria-label={translateMessage('ui.close_aaaeeafe')}
          onClick={handleDismissClick}
        >
          <CloseIcon className={`${css.closeIcon} text-[var(--color-text-secondary)]`} />
        </Button>
      </div>
    </Track>
  )
}
