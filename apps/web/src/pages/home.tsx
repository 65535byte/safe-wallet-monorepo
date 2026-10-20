import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'

import Dashboard from '@/components/dashboard'
import { BRAND_NAME } from '@/config/constants'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>{translateMessage('ui.dashboard_a7e76c07', { p0: BRAND_NAME })}</title>
      </Head>

      <main>
        <Dashboard />
      </main>
    </>
  )
}

export default Home
