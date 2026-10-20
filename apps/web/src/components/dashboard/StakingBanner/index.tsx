import { translateMessage } from '@/i18n'
/**
 * @usedBy pages/balances/index.tsx (StakingBanner, useIsStakingBannerVisible)
 */
import { Typography } from '@safe-global/views/components/ui/typography'
import { Button } from '@safe-global/views/components/ui/button'
import { Link } from '@safe-global/views/components/ui/link'
import css from './styles.module.css'
import StakeIcon from '@/public/images/common/stake.svg'
import classNames from 'classnames'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { AppRoutes } from '@/config/routes'
import useIsStakingBannerVisible from '@/components/dashboard/StakingBanner/useIsStakingBannerVisible'
import { useSafeLinkQuery } from '@/hooks/useSafeLinkQuery'

const LEARN_MORE_LINK = 'https://help.safe.global/articles/7497206492-Safe{Staking}'

const StakingBanner = ({
  hideLocalStorageKey = 'hideStakingBanner',
}: { large?: boolean; hideLocalStorageKey?: string } = {}) => {
  const isDarkMode = useDarkMode()
  const router = useRouter()
  const safeLinkQuery = useSafeLinkQuery()
  const isStakingBannerVisible = useIsStakingBannerVisible()

  const [_, setWidgetHidden] = useLocalStorage<boolean>(hideLocalStorageKey)

  if (!isStakingBannerVisible) return null

  const onClick = () => {
    trackEvent(OVERVIEW_EVENTS.OPEN_STAKING_WIDGET)
  }

  const onHide = () => {
    setWidgetHidden(true)
    trackEvent(OVERVIEW_EVENTS.HIDE_STAKING_BANNER)
  }

  const onLearnMore = () => {
    trackEvent(OVERVIEW_EVENTS.OPEN_LEARN_MORE_STAKING_BANNER)
  }

  return (
    <>
      <div className={classNames(css.bannerWrapper, 'overflow-hidden rounded-md bg-[var(--color-background-paper)]')}>
        {!isDarkMode && <div className={classNames(css.gradientBackground)} />}

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="z-[1] flex flex-row items-center justify-center gap-4">
            <StakeIcon className="size-4" />

            <Typography variant="paragraph-small">
              <strong>{translateMessage('ui.stakeETHAndEarnRewardsUp_58d0de11')}</strong>{' '}
              {translateMessage('ui.lockETHToBecomeAValidator_5dc6a63b')}{' '}
              <Link
                render={
                  <NextLink
                    href={{ pathname: AppRoutes.apps.index, query: { ...router.query, categories: ['Staking'] } }}
                  />
                }
              >
                {translateMessage('ui.exploreSafeApps_c49239c2')}
              </Link>{' '}
              {translateMessage('ui.andHomeStakingForOtherOptions_d07bca71')}
              {LEARN_MORE_LINK && (
                <>
                  {' '}
                  <ExternalLink onClick={onLearnMore} href={LEARN_MORE_LINK}>
                    {translateMessage('ui.learnMore_0c11daba')}
                  </ExternalLink>
                </>
              )}
            </Typography>
          </div>

          <div className="flex flex-col items-center gap-4 md:flex-row md:items-end">
            <div>
              <Button variant="ghost" onClick={onHide} size="sm" className="whitespace-nowrap">
                {translateMessage('ui.donTShow_93b3215f')}
              </Button>
            </div>
            <Button
              size="sm"
              className={classNames(css.stakeButton, 'w-full')}
              render={
                <NextLink
                  href={
                    AppRoutes.stake && {
                      pathname: AppRoutes.stake,
                      query: safeLinkQuery,
                    }
                  }
                  rel="noreferrer"
                  onClick={onClick}
                />
              }
            >
              {translateMessage('ui.stake_0e1cdece')}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default StakingBanner
