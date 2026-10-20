import { translateMessage } from '@/i18n'
import NextLink from 'next/link'

import { Typography } from '@safe-global/views/components/ui/typography'
import { Link } from '@safe-global/views/components/ui/link'
import { IS_PRODUCTION } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import WarningIcon from '@safe-global/views/assets/images/notifications/warning.svg'

import css from '@/components/common/ErrorBoundary/styles.module.css'
import CircularIcon from '@safe-global/views/components/common/icons/CircularIcon'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { HELP_CENTER_URL } from '@safe-global/utils/config/constants'
interface ErrorBoundaryProps {
  error: Error
  componentStack: string
}

const ErrorBoundary = ({ error, componentStack }: ErrorBoundaryProps) => {
  return (
    <div className={css.container}>
      <div className={css.wrapper}>
        <Typography variant="h3" className="text-[var(--color-text-primary)]">
          {translateMessage('ui.somethingWentWrong_4f9db64c')}
          <br />
          {translateMessage('ui.pleaseTryAgain_4096057f')}
        </Typography>

        <CircularIcon icon={WarningIcon} badgeColor="warning" />

        {IS_PRODUCTION ? (
          <Typography className="text-[var(--color-text-primary)]">
            {translateMessage('ui.inCaseTheProblemPersistsPlease_b884b821')}
            <ExternalLink href={HELP_CENTER_URL}>{translateMessage('ui.helpCenter_a9643f1f')}</ExternalLink>
          </Typography>
        ) : (
          <>
            {/* Error may be undefined despite what the type says */}
            <Typography className="text-destructive">{error?.toString()}</Typography>
            <Typography className="text-destructive">{componentStack}</Typography>
          </>
        )}
        <Link href={AppRoutes.index} className="mt-4" render={<NextLink href={AppRoutes.index} />}>
          {translateMessage('ui.goHome_a49cee55')}
        </Link>
      </div>
    </div>
  )
}

export default ErrorBoundary
