import { translateMessage } from '@/i18n'
import Head from 'next/head'
import type { NextPage } from 'next'

import Bridge from '@/features/bridge'
import { BRAND_NAME } from '@/config/constants'

const BridgePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{translateMessage('ui.bridge_b2aff551', { p0: BRAND_NAME })}</title>
      </Head>
      <Bridge />
    </>
  )
}

export default BridgePage
