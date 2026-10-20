import { translateMessage } from '@/i18n'
import type { SafeApp as SafeAppData } from '@safe-global/store/gateway/AUTO_GENERATED/safe-apps'
import ChainIndicator from '@/components/common/ChainIndicator'
import WarningIcon from '@safe-global/views/assets/images/notifications/warning.svg'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Separator } from '@safe-global/views/components/ui/separator'
import SafeAppIconCard from '@safe-global/views/components/safe-apps/SafeAppIconCard'

type DetailsProps = {
  app: SafeAppData
  showDefaultListWarning: boolean
}

const SafeAppDetails = ({ app, showDefaultListWarning }: DetailsProps) => (
  <div className="flex flex-col">
    <div className="mb-8 flex">
      <SafeAppIconCard src={app.iconUrl} alt={app.name} width={90} height={90} />

      <div className="ml-16">
        <Typography variant="h3">{app.name}</Typography>
        <Typography variant="paragraph-small" className="block mt-2">
          {app.description}
        </Typography>
      </div>
    </div>
    <Separator />
    <div className="mt-8">
      <Typography>{translateMessage('ui.appURL_ec4b69b5')}</Typography>
      <Typography
        variant="paragraph-small"
        className="mt-2 inline-block rounded-md bg-[var(--color-background-light)] p-2 font-bold"
      >
        {app.url}
      </Typography>
    </div>
    <div className="mt-4">
      <Typography>{translateMessage('ui.availableNetworks_44a0c0ae')}</Typography>
      <div className="mt-2 flex flex-wrap gap-4">
        {app.chainIds.map((chainId) => (
          <ChainIndicator key={chainId} chainId={chainId} inline showUnknown={false} />
        ))}
      </div>
    </div>
    <Separator className="mt-8" />
    {showDefaultListWarning && (
      <div className="mt-8 flex flex-col">
        <div className="mb-8">
          <div className="flex">
            <WarningIcon className="size-6 text-[var(--color-warning-dark)]" />
            <Typography variant="h4" className="text-[var(--color-warning-dark)]">
              {translateMessage('ui.warning_e4bf8e0a')}
            </Typography>
          </div>
          <Typography className="mt-2 text-[var(--color-warning-dark)]">
            {translateMessage('ui.theApplicationIsNotInThe_dd5c1d81')}
          </Typography>
          <Typography variant="paragraph-small" className="block mt-4">
            {translateMessage('ui.checkTheAppLinkAndEnsure_d61db689')}
          </Typography>
        </div>
        <Separator />
      </div>
    )}
  </div>
)

export { SafeAppDetails }
