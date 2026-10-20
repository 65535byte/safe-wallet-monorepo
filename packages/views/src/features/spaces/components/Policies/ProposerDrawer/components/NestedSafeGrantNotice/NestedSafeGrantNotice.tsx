import { translateMessage } from '@safe-global/views/i18n'
import type { ReactElement } from 'react'
import type { UrlObject } from 'url'
import NextLink from 'next/link'
import { Alert, AlertDescription, AlertSeverityIcon, AlertTitle } from '@safe-global/views/components/ui/alert'
import { Link } from '@safe-global/views/components/ui/link'

export type NestedSafeGrantNoticeProps = {
  safeName: string
  parentSafeName: string
  /** Omitted when the Safe's chain is unknown, so there is no settings page to open. */
  settingsHref?: UrlObject
}

const NestedSafeGrantNotice = ({
  safeName,
  parentSafeName,
  settingsHref,
}: NestedSafeGrantNoticeProps): ReactElement => (
  <Alert variant="warning" outlined={false} data-testid="nested-safe-grant-notice">
    <AlertSeverityIcon variant="warning" />
    <AlertTitle>{translateMessage('ui.removeThisProposerOnTheAccount_e2c7c2c9')}</AlertTitle>
    <AlertDescription>
      <p>
        {translateMessage('ui.theParentAccount_e5db2455')}
        {parentSafeName}
        {translateMessage('ui.grantedThisProposerRoleOn_6f16ed49')}
        {safeName}
        {translateMessage('ui.toRemoveItOpenTheSettings_7a7a0a22')} {safeName}{' '}
        {translateMessage('ui.withASignerOf_54c213bf')}
        {parentSafeName}.
      </p>
      {settingsHref && (
        <Link render={<NextLink href={settingsHref} />}>{translateMessage('ui.goToSettings_782b4422')}</Link>
      )}
    </AlertDescription>
  </Alert>
)

export default NestedSafeGrantNotice
