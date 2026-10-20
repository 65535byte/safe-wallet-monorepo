import { translateMessage } from '@/i18n'
import React from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'
import Image from 'next/image'
import css from './styles.module.css'
import Link from 'next/link'
import { useNoFeeCampaignEligibility, useIsNoFeeCampaignEnabled } from '@/features/no-fee-campaign'
import BlockedAddress from '@/components/common/BlockedAddress'
import { useDarkMode } from '@/hooks/useDarkMode'

const NoFeeCampaignTransactionCard = () => {
  const isEnabled = useIsNoFeeCampaignEnabled()
  const { isEligible, isLoading, error, blockedAddress } = useNoFeeCampaignEligibility()
  const dark = useDarkMode()

  if (!isEnabled) {
    return null
  }

  if (blockedAddress) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <BlockedAddress address={blockedAddress} featureTitle={translateMessage('ui.freeJanuary_dad509e1')} />
      </div>
    )
  }

  // Loading state - show skeleton
  if (isLoading) {
    return (
      <div className={dark ? css.dark : undefined}>
        <div className={css.card}>
          <div className="flex flex-row items-center gap-6">
            <div className={css.skeletonIcon} />
            <div className="flex-1">
              <div className={`${css.skeletonBox} ${css.skeletonTitle}`} />
              <div className={`${css.skeletonBox} ${css.skeletonSubtitle}`} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state - show eligible content (fail gracefully)
  if (error) {
    return (
      <div className={dark ? css.dark : undefined}>
        <div className={css.card}>
          <div className="flex flex-row items-center gap-6">
            <div className={css.iconContainer}>
              <Image
                src="/images/common/no-fee-campaign/Cards_USDe.svg"
                alt={translateMessage('ui.uSDeLogo_9d6af50f')}
                width={48}
                height={48}
                className={css.cardsImage}
              />
            </div>
            <div className="flex flex-1 flex-col">
              <Typography variant="paragraph-small-bold" className={css.title}>
                {translateMessage('ui.enjoyFreeJanuaryNoFeeOn_5c7763a2')}
              </Typography>
              <Typography variant="paragraph-small" className={css.description}>
                {translateMessage('ui.uSDeHoldersEnjoyGaslessTransactionsOn_76fd8a95')}{' '}
                <Link
                  href="https://help.safe.global/articles/9605526657-no-fee-january-campaign"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  {translateMessage('ui.learnMore_0c11daba')}
                </Link>
              </Typography>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Eligible state
  if (isEligible === true) {
    return (
      <div className={dark ? css.dark : undefined}>
        <div className={css.card}>
          <div className={css.cardContent}>
            {/* Main content */}
            <div className={css.mainContent}>
              {/* Title and eligibility tag inline */}
              <div className={css.titleRow}>
                <Typography variant="paragraph-small-bold" className={css.title}>
                  {translateMessage('ui.enjoyFreeJanuary_1c2a3bae')}
                </Typography>
                <div className={css.eligibilityTag}>
                  <Image
                    src="/images/common/no-fee-campaign/check-icon.svg"
                    alt={translateMessage('ui.eligible_619a363a')}
                    width={16}
                    height={16}
                    className={css.tagIcon}
                  />
                  <Typography variant="paragraph-mini" className={css.tagText}>
                    {translateMessage('ui.youAreEligible_a64965cf')}
                  </Typography>
                </div>
              </div>

              {/* Description */}
              <Typography variant="paragraph-small" className={css.description}>
                {translateMessage('ui.uSDeHoldersEnjoyGaslessTransactionsOn_76fd8a95')}{' '}
                <Link
                  href="https://help.safe.global/articles/9605526657-no-fee-january-campaign"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'underline', fontWeight: 'bold' }}
                >
                  {translateMessage('ui.learnMore_0c11daba')}
                </Link>
              </Typography>
            </div>

            {/* Coins illustration */}
            <div className={css.coinsContainer}>
              <Image
                src="/images/common/no-fee-campaign/Cards_USDe.svg"
                alt={translateMessage('ui.uSDeLogo_9d6af50f')}
                width={58}
                height={58}
                className={css.coinsImage}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Not eligible state
  return null
}

export default NoFeeCampaignTransactionCard
