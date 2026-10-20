import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'
import { BRAND_NAME } from '@/config/constants'
import { SpacesFeature } from '@/features/spaces'
import { useLoadFeature } from '@/features/__core__'

const SelectSafesPage: NextPage = () => {
  const { SelectSafesOnboarding } = useLoadFeature(SpacesFeature)
  return (
    <>
      <Head>
        <title>{translateMessage('ui.selectAccounts_c5a4d309', { p0: BRAND_NAME })}</title>
      </Head>

      <SelectSafesOnboarding />
    </>
  )
}

export default SelectSafesPage
