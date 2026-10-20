import { translateMessage } from '@/i18n'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { BRAND_NAME } from '@/config/constants'
import { SpacesFeature, useFeatureFlagRedirect } from '@/features/spaces'
import { useLoadFeature } from '@/features/__core__'

export default function SpaceAccountsPage() {
  const router = useRouter()
  const { spaceId } = router.query
  const spaces = useLoadFeature(SpacesFeature)
  useFeatureFlagRedirect()

  if (!router.isReady || !spaceId) return null

  return (
    <>
      <Head>
        <title>{translateMessage('ui.workspaceAccounts_cf70b891', { p0: BRAND_NAME })}</title>
      </Head>

      <main>
        <spaces.SpaceSafeAccountsPage spaceId={spaceId as string} />
      </main>
    </>
  )
}
