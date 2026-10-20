import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { Typography } from '@safe-global/views/components/ui/typography'
import { BRAND_NAME } from '@/config/constants'
import { FEATURES } from '@safe-global/utils/utils/chains'
import { useHasFeature } from '@/hooks/useChains'

const LazyEarnPage = dynamic(() => import('@/features/earn'), { ssr: false })

const EarnPage: NextPage = () => {
  const isFeatureEnabled = useHasFeature(FEATURES.EARN)

  return (
    <>
      <Head>
        <title>{translateMessage('ui.earn_f55d6c09', { p0: BRAND_NAME })}</title>
      </Head>

      {isFeatureEnabled === true ? (
        <LazyEarnPage />
      ) : isFeatureEnabled === false ? (
        <main>
          <Typography align="center" className="my-6">
            {translateMessage('ui.earnIsNotAvailableOnThis_10aa2a63')}
          </Typography>
        </main>
      ) : null}
    </>
  )
}

export default EarnPage
