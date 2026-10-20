import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'
import SettingsHeader from '@/components/settings/SettingsHeader'
import EnvironmentVariables from '@/components/settings/EnvironmentVariables'
import { BRAND_NAME } from '@/config/constants'

const EnvironmentVariablesPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>{translateMessage('ui.settingsEnvironmentVariables_ce1a6b15', { p0: BRAND_NAME })}</title>
      </Head>

      <SettingsHeader />

      <main>
        <EnvironmentVariables />
      </main>
    </>
  )
}

export default EnvironmentVariablesPage
