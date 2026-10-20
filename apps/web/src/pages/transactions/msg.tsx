import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'

import { Typography } from '@safe-global/views/components/ui/typography'
import SingleMsg from '@/components/safe-messages/SingleMsg'
import { BRAND_NAME } from '@/config/constants'

const SingleTransaction: NextPage = () => {
  return (
    <>
      <Head>
        <title>{translateMessage('ui.messageDetails_27e9661f', { p0: BRAND_NAME })}</title>
      </Head>

      <main>
        <Typography data-testid="tx-details" variant="h3" className="pt-2 mb-6">
          {translateMessage('ui.messageDetails_8a647831')}
        </Typography>

        <SingleMsg />
      </main>
    </>
  )
}

export default SingleTransaction
