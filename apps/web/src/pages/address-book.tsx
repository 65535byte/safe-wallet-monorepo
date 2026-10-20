import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'
import AddressBookTable from '@/components/address-book/AddressBookTable'
import { BRAND_NAME } from '@/config/constants'
import { AddressBookSourceProvider } from '@/components/common/AddressBookSourceProvider'

const AddressBook: NextPage = () => {
  return (
    <>
      <Head>
        <title>{translateMessage('ui.addressBook_02d4aede', { p0: BRAND_NAME })}</title>
      </Head>

      <AddressBookSourceProvider source="localOnly">
        <AddressBookTable />
      </AddressBookSourceProvider>
    </>
  )
}

export default AddressBook
