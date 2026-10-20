import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'

import AssetsHeader from '@/components/balances/AssetsHeader'
import { BRAND_NAME } from '@/config/constants'
import dynamic from 'next/dynamic'

const DefiPositions = dynamic(() => import('@/features/positions'))

const Positions: NextPage = () => {
  return (
    <>
      <Head>
        <title>{translateMessage('ui.assets_80ae5d8f', { p0: BRAND_NAME })}</title>
      </Head>

      <AssetsHeader />

      <main>
        <DefiPositions />
      </main>
    </>
  )
}

export default Positions
