import { translateMessage } from '@/i18n'
import { WifiOff } from 'lucide-react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Typography } from '@safe-global/views/components/ui/typography'
import { BRAND_NAME } from '@/config/constants'
import SafeLogo from '@/components/common/SafeLogo'

const Offline: NextPage = () => {
  return (
    <>
      <Head>
        <title>{translateMessage('ui.offline_81ed96a4', { p0: BRAND_NAME })}</title>
      </Head>

      <main>
        <div className="fixed top-0 left-0 z-[1300] flex items-center px-6" style={{ height: 'var(--header-height)' }}>
          <SafeLogo />
        </div>
        <div className="flex justify-center">
          <div className="bg-card mb-4 max-w-[900px] rounded-xl p-8">
            <div className="mb-4 flex justify-center">
              <WifiOff className="size-[100px]" />
            </div>

            <Typography variant="h1" align="center">
              {translateMessage('ui.oopsItLooksLikeYouRe_45cf7221')}
            </Typography>

            <Typography className="mt-6">{translateMessage('ui.weApologizeButItLooksLike_e5697aed')}</Typography>

            <Typography className="mt-4">{translateMessage('ui.whileYouWaitForYourInternet_a25c3ac7')}</Typography>

            <Typography className="mt-4">{translateMessage('ui.weHopeToSeeYouBack_2a92c618')}</Typography>
          </div>
        </div>
      </main>
    </>
  )
}

export default Offline
