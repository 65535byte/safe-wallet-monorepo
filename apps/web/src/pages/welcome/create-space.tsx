import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'
import { BRAND_NAME } from '@/config/constants'
import { SpacesFeature } from '@/features/spaces'
import { useLoadFeature } from '@/features/__core__'

const CreateSpacePage: NextPage = () => {
  const { CreateSpaceOnboarding } = useLoadFeature(SpacesFeature)
  return (
    <>
      <Head>
        <title>{translateMessage('ui.createWorkspace_ac34db95', { p0: BRAND_NAME })}</title>
      </Head>
      <CreateSpaceOnboarding />
    </>
  )
}

export default CreateSpacePage
