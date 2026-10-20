import { translateMessage } from '@/i18n'
import { Typography } from '@safe-global/views/components/ui/typography'
import PagePlaceholder from '@safe-global/views/components/common/PagePlaceholder'
import AddCustomAppIcon from '@/public/images/apps/add-custom-app.svg'
import { BRAND_NAME } from '@/config/constants'

const SafeAppsZeroResultsPlaceholder = ({ searchQuery }: { searchQuery: string }) => {
  return (
    <PagePlaceholder
      img={<AddCustomAppIcon />}
      text={
        <Typography className="m-4 max-w-[600px] text-[var(--color-primary-light)]">
          {translateMessage('ui.noSafeAppsFoundMatching_f1b6f2ac')}
          <strong>{searchQuery}</strong>
          {translateMessage('ui.connectToDAppsThatHavenT_10f0a0d9')}
          {BRAND_NAME} {translateMessage('ui.usingWalletConnect_53870050')}
        </Typography>
      }
    />
  )
}

export default SafeAppsZeroResultsPlaceholder
