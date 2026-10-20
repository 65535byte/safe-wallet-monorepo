import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'

import SafeOverview from '@/features/safe-overview'
import { BRAND_NAME } from '@/config/constants'

const DashboardNew: NextPage = () => {
  return (
    <>
      <Head>
        <title>{translateMessage('ui.overview_1ebd141d', { p0: BRAND_NAME })}</title>
      </Head>

      <main>
        <SafeOverview />
      </main>
    </>
  )
}

export default DashboardNew
