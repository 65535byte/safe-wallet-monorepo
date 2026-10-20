import { translateMessage } from '@/i18n'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { BRAND_NAME } from '@/config/constants'
import { AppRoutes } from '@/config/routes'

export default function SpaceSettingsIndexPage() {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    router.replace({ pathname: AppRoutes.spaces.settingsGeneral, query: router.query })
  }, [router])

  return (
    <Head>
      <title>{translateMessage('ui.workspaceSettings_5ce308c1', { p0: BRAND_NAME })}</title>
    </Head>
  )
}
