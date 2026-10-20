import { translateMessage } from '@/i18n'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { BRAND_NAME } from '@/config/constants'
import { SpacesFeature, useFeatureFlagRedirect } from '@/features/spaces'
import { useLoadFeature } from '@/features/__core__'
import { useSecurityHubFeatureRedirect } from '@/features/security'

export default function SpaceSecurityPage() {
  const router = useRouter()
  const { spaceId } = router.query
  const spaces = useLoadFeature(SpacesFeature)
  useFeatureFlagRedirect()
  useSecurityHubFeatureRedirect()

  if (!router.isReady || !spaceId) return null

  return (
    <>
      <Head>
        <title>{translateMessage('ui.securityHub_5da98aa7', { p0: BRAND_NAME })}</title>
      </Head>

      <main>
        <spaces.SecurityHubPage spaceId={spaceId as string} />
      </main>
    </>
  )
}
