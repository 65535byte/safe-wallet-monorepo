import { translateMessage } from '@/i18n'
import { ArrowUpRight } from 'lucide-react'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import { cn } from '@safe-global/views/utils/cn'
import { SAFE_PRO_ANNOUNCEMENT_URL } from '@/config/constants'
import { MixpanelEventParams } from '@/services/analytics'
import { useTrackOnce } from '@/services/analytics/useTrackOnce'
import { SAFE_PRO_EVENTS } from '@/services/analytics/events/safe-pro'
import { trackSafeProBannerClick, type SafeProBannerLocation } from '../../utils/trackSafeProBannerClick'
import SafeProHero from '@safe-global/views/components/common/SafeProHero'
import css from './styles.module.css'

const SafeProAnnouncement = ({ location, onDismiss }: { location: SafeProBannerLocation; onDismiss?: () => void }) => {
  useTrackOnce(SAFE_PRO_EVENTS.SAFE_PRO_BANNER_VIEWED, { [MixpanelEventParams.LOCATION]: location })

  return (
    <div className="p-1">
      <SafeProHero />

      <div className="flex flex-col items-center gap-6 px-8 py-6">
        <div className="flex flex-col items-center gap-3">
          <Typography variant="h4" align="center">
            {translateMessage('ui.yourWorkspaceMovesTo_99cc5b21')}
            <span className={css.highlight}>8379</span>
          </Typography>

          <Typography variant="paragraph" color="muted" align="center">
            {translateMessage('ui.willAddAdvancedSecurityChecksSponsored_8eacc712')}
          </Typography>
        </div>

        <div className="flex shrink-0 gap-3">
          {onDismiss && (
            <Button size="lg" variant="secondary" onClick={onDismiss}>
              {translateMessage('ui.gotIt_008f9813')}
            </Button>
          )}

          <Button
            size="lg"
            render={
              <a
                onClick={() => trackSafeProBannerClick(location)}
                href={SAFE_PRO_ANNOUNCEMENT_URL}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            {translateMessage('ui.learnMore_0c11daba')}
            <ArrowUpRight data-icon="inline-end" className={cn('text-green-400', css.arrow)} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SafeProAnnouncement
