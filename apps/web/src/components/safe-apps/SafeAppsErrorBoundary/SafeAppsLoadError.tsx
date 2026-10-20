import { translateMessage } from '@/i18n'
import NetworkError from '@/public/images/apps/network-error.svg'

import { Typography } from '@safe-global/views/components/ui/typography'
import { Button } from '@safe-global/views/components/ui/button'
import css from './styles.module.css'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { DISCORD_URL } from '@safe-global/utils/config/constants'

type SafeAppsLoadErrorProps = {
  onBackToApps: () => void
}

const SafeAppsLoadError = ({ onBackToApps }: SafeAppsLoadErrorProps): React.ReactElement => {
  return (
    <div className={css.wrapper}>
      <div className={css.content}>
        <Typography variant="h1">{translateMessage('ui.appCouldNotBeLoaded_66c8f69b')}</Typography>

        <NetworkError className={css.image} />

        <div>
          <Typography variant="paragraph" className="inline">
            {translateMessage('ui.inCaseTheProblemPersistsPlease_e713048b')}{' '}
          </Typography>
          <ExternalLink href={DISCORD_URL}>Discord</ExternalLink>
        </div>

        <Button variant="ghost" onClick={onBackToApps} render={<a href="#back" />}>
          {translateMessage('ui.goBackToTheSafeApps_905bff7c')}
        </Button>
      </div>
    </div>
  )
}

export default SafeAppsLoadError
