import { translateMessage } from '@/i18n'
import Head from 'next/head'
import type { NextPage } from 'next'
import { Typography } from '@safe-global/views/components/ui/typography'

import SettingsHeader from '@/components/settings/SettingsHeader'
import { PushNotifications } from '@/components/settings/PushNotifications'
import { useHasFeature } from '@/hooks/useChains'
import { BRAND_NAME } from '@/config/constants'
import { FEATURES } from '@safe-global/utils/utils/chains'

const NotificationsPage: NextPage = () => {
  const isNotificationFeatureEnabled = useHasFeature(FEATURES.PUSH_NOTIFICATIONS)

  return (
    <>
      <Head>
        <title>{translateMessage('ui.settingsNotifications_7ca30c36', { p0: BRAND_NAME })}</title>
      </Head>

      <SettingsHeader />

      <main>
        {isNotificationFeatureEnabled === true ? (
          <PushNotifications />
        ) : isNotificationFeatureEnabled === false ? (
          <Typography align="center" className="my-6">
            {translateMessage('ui.notificationsAreNotAvailableOnThis_3bc32a9e')}
          </Typography>
        ) : null}
      </main>
    </>
  )
}

export default NotificationsPage
