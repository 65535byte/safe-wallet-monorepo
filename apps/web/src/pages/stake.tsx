import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Typography } from '@safe-global/views/components/ui/typography'
import { BRAND_NAME } from '@/config/constants'
import { StakeFeature } from '@/features/stake'
import { useLoadFeature } from '@/features/__core__'

const StakePage: NextPage = () => {
  const stake = useLoadFeature(StakeFeature)

  return (
    <>
      <Head>
        <title>{translateMessage('ui.stake_c424d94f', { p0: BRAND_NAME })}</title>
      </Head>

      {stake.$isReady ? (
        <stake.StakePage />
      ) : stake.$isDisabled ? (
        <main>
          <Typography align="center" className="my-6">
            {translateMessage('ui.stakingIsNotAvailableOnThis_3a1738a6')}
          </Typography>
        </main>
      ) : null}
    </>
  )
}

export default StakePage
