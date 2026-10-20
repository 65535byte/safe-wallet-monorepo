import { translateMessage } from '@/i18n'
import type { NextPage } from 'next'
import Head from 'next/head'
import { Skeleton } from '@safe-global/views/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Typography } from '@safe-global/views/components/ui/typography'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import { ContractVersion } from '@/components/settings/ContractVersion'
import { OwnerList } from '@/components/settings/owner/OwnerList'
import { RequiredConfirmation } from '@/components/settings/RequiredConfirmations'
import useSafeInfo from '@/hooks/useSafeInfo'
import SettingsHeader from '@/components/settings/SettingsHeader'
import ProposersList from '@/components/settings/ProposersList'
import { SpendingLimitsFeature } from '@/features/spending-limits'
import { useLoadFeature } from '@/features/__core__'
import { BRAND_NAME } from '@/config/constants'
import { NestedSafesList } from '@/components/settings/NestedSafesList'
import { FeeTokenPreference } from '@/components/settings/FeeTokenPreference'

const Setup: NextPage = () => {
  const { safe, safeLoaded } = useSafeInfo()
  const { SpendingLimitsSettings } = useLoadFeature(SpendingLimitsFeature)
  const nonce = safe.nonce
  const ownerLength = safe.owners.length
  const threshold = safe.threshold

  return (
    <>
      <Head>
        <title>{translateMessage('ui.settingsSetup_8f43b415', { p0: BRAND_NAME })}</title>
      </Head>

      <SettingsHeader />

      <main>
        <div data-testid="setup-section" className="mb-4 rounded-lg bg-[var(--color-background-paper)] p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row">
            <div className="lg:w-1/5 lg:shrink-0">
              <Typography variant="h4" className="font-bold">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span>
                        {translateMessage('ui.accountNonce_6a29c45d')}
                        <InfoIcon className="ml-1 inline size-5 align-middle text-[var(--color-border-main)]" />
                      </span>
                    }
                  />
                  <TooltipContent>
                    {translateMessage('ui.forSecurityReasonsTransactionsMadeWith_daa0afee')}
                  </TooltipContent>
                </Tooltip>
              </Typography>

              {/* as="div": the Skeleton renders a div, which is invalid inside the default <p> */}
              <Typography as="div" className="pt-2">
                {translateMessage('ui.currentNonce_03e86cde')}
                {safeLoaded ? <b>{nonce}</b> : <Skeleton className="inline-block h-4 w-[30px]" />}
              </Typography>
            </div>

            <div className="lg:min-w-0 lg:flex-1">
              <ContractVersion />
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-[var(--color-background-paper)] p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row">
            <div className="lg:w-1/5 lg:shrink-0">
              <Typography variant="h4" className="font-bold">
                {translateMessage('ui.members_a4462f09')}
              </Typography>
            </div>

            <div className="lg:min-w-0 lg:flex-1">
              <div className="flex flex-col gap-4">
                <OwnerList />
                <ProposersList />
              </div>
            </div>
          </div>

          <RequiredConfirmation threshold={threshold} owners={ownerLength} />
        </div>

        <SpendingLimitsSettings />

        <NestedSafesList />

        <FeeTokenPreference />
      </main>
    </>
  )
}

export default Setup
