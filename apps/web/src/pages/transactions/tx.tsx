import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'

import SingleTx from '@/components/transactions/SingleTx'
import { Typography } from '@safe-global/views/components/ui/typography'
import { BRAND_NAME } from '@/config/constants'

const SingleTransaction: NextPage = () => {
  return (
    <>
      <Head>
        <title>{translateMessage('ui.transactionDetails_fd13408f', { p0: BRAND_NAME })}</title>
      </Head>

      <main>
        <Typography data-testid="tx-details" variant="h3" className="pt-2 mb-6">
          {translateMessage('ui.transactionDetails_42b5fe84')}
        </Typography>

        <SingleTx />
      </main>
    </>
  )
}

export default SingleTransaction
