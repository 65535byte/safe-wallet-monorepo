import { translateMessage } from '@/i18n'
import type { MouseEvent, ReactElement } from 'react'
import type { UrlObject } from 'url'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { Alert, AlertDescription, AlertSeverityIcon, AlertTitle } from '@safe-global/views/components/ui/alert'
import { Link } from '@safe-global/views/components/ui/link'

export type ParentSafeWalletCopy = {
  title: string
  /** Completes "To … on its behalf", e.g. "grant this role". */
  action: string
}

export type ParentSafeWalletNoticeProps = ParentSafeWalletCopy & {
  safeName: string
  parentSafeName: string
  settingsHref?: UrlObject
  onNavigate?: () => void
}

const ParentSafeWalletNotice = ({
  title,
  action,
  safeName,
  parentSafeName,
  settingsHref,
  onNavigate,
}: ParentSafeWalletNoticeProps): ReactElement => {
  const router = useRouter()

  const goToSettings = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    onNavigate?.()
    if (settingsHref) void router.push(settingsHref)
  }

  return (
    <Alert variant="warning" outlined={false} data-testid="parent-safe-wallet-notice">
      <AlertSeverityIcon variant="warning" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>
          {translateMessage('ui.yourConnectedWallet_ef33b0f1')}
          {parentSafeName}
          {translateMessage('ui.isAParentAccountOf_1b6f760f')}
          {safeName}
          {translateMessage('ui.to_f8ca49f1')}
          {action} {translateMessage('ui.onItsBehalfOpenTheSettings_a4872fb8')}
          {safeName} {translateMessage('ui.withASignerOf_54c213bf')}
          {parentSafeName}.
        </p>
        {settingsHref && (
          <Link
            render={<NextLink href={settingsHref} />}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={goToSettings}
          >
            {translateMessage('ui.goToSettings_782b4422')}
          </Link>
        )}
      </AlertDescription>
    </Alert>
  )
}

export default ParentSafeWalletNotice
