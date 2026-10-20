import { translateMessage } from '@/i18n'
import { useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { Spinner } from '@safe-global/views/components/ui/spinner'
import PromoBanner from '@/components/common/PromoBanner/PromoBanner'
import { useOpenSafenetStakingApp } from '@/hooks/useOpenSafenetStakingApp'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import css from './styles.module.css'

const LEARN_MORE_LINK =
  'https://forum.safefoundation.org/t/sep-55-phase-2-fund-safenet-beta-for-safe-token-utility/6967'

const StakingPromoBanner = ({ onDismiss }: { onDismiss: () => void }) => {
  const { openSafenetStakingApp, isNavigating } = useOpenSafenetStakingApp()

  useEffect(() => {
    trackEvent(OVERVIEW_EVENTS.SHOW_STAKING_BANNER)
  }, [])

  const onStake = () => {
    openSafenetStakingApp()
  }

  const onLearnMore = () => {
    trackEvent(OVERVIEW_EVENTS.OPEN_LEARN_MORE_STAKING_BANNER)
  }

  return (
    <div className={css.stakingPromoBanner}>
      <PromoBanner
        title={translateMessage('ui.stakeSAFETokensAndEarnUp_5774156b')}
        description={
          <>
            {translateMessage('ui.earnByStakingYourSAFETokens_9b453202')}{' '}
            <ExternalLink
              href={LEARN_MORE_LINK}
              noIcon
              onClick={onLearnMore}
              className="font-bold text-inherit [&>span]:underline"
            >
              {translateMessage('ui.learnMore_0c11daba')}
            </ExternalLink>
          </>
        }
        ctaLabel={translateMessage('ui.stakeNow_5cc7ed7b')}
        onCtaClick={onStake}
        ctaVariant="text"
        endIcon={isNavigating ? <Spinner className="size-4" /> : <ArrowRight className="size-4" />}
        imageSrc="/images/common/staking-promo/safe-coin.svg"
        imageAlt={translateMessage('ui.safeToken_27c72d43')}
        trackingEvents={OVERVIEW_EVENTS.OPEN_STAKING_WIDGET}
        trackHideProps={OVERVIEW_EVENTS.HIDE_STAKING_BANNER}
        onDismiss={onDismiss}
      />
    </div>
  )
}

export default StakingPromoBanner
