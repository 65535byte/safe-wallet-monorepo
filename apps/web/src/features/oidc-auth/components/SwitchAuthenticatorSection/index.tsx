import { getLanguage } from '@/i18n'
import { translateMessage } from '@/i18n'
import { Plus, Smartphone } from 'lucide-react'
import { FEATURES } from '@safe-global/utils/utils/chains'
import { Badge, BadgeDot } from '@safe-global/views/components/ui/badge'
import { Button } from '@safe-global/views/components/ui/button'
import { Skeleton } from '@safe-global/views/components/ui/skeleton'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useHasFeature } from '@/hooks/useChains'
import { useAuthenticators } from '../../hooks/useAuthenticators'

const formatDate = (iso?: string): string =>
  iso
    ? new Date(iso).toLocaleString(getLanguage(), {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

/**
 * Two-factor authentication section for the spaces account settings page.
 * Renders nothing for non-OIDC sessions.
 *
 * One authenticator slot: a skeleton while loading, then either the
 * enrolled authenticator (with a "Change" action) or an "Add authenticator"
 * button. Both route through the provider's hosted pages: verify with the
 * current factor, scan the new QR code there, and return.
 */
const SwitchAuthenticatorSection = () => {
  const isSwitchAuthenticatorEnabled = useHasFeature(FEATURES.SWITCH_AUTHENTICATOR)
  const { isOidcSession, authenticators, error, enrollNewAuthenticator } = useAuthenticators()

  if (!isSwitchAuthenticatorEnabled || !isOidcSession) {
    return null
  }

  const isLoading = authenticators === undefined && !error
  const authenticator = authenticators?.[0]

  return (
    <section className="bg-card rounded-2xl p-6 mb-3" data-testid="settings-account-authenticators">
      <div className="flex items-center gap-3 mb-2">
        <Typography variant="paragraph-bold" className="block tracking-tight">
          {translateMessage('ui.twoFactorAuthentication_9f727397')}
        </Typography>
        {authenticator && (
          <Badge variant="success" size="status" shape="status">
            <BadgeDot />
            {translateMessage('ui.active_889c3246')}
          </Badge>
        )}
      </div>
      <Typography variant="paragraph-small" color="muted" className="mb-4 block max-w-[560px]">
        {translateMessage('ui.requiredForEveryoneInThisWorkspace_57ccffdb')}
      </Typography>

      {error && (
        <Typography variant="paragraph-small" className="mb-4 block text-destructive">
          {error}
        </Typography>
      )}

      {isLoading ? (
        <Skeleton className="h-[56px] w-full rounded-lg" />
      ) : authenticator ? (
        <div className="flex items-center justify-between gap-4 py-2" data-testid="authenticator-row">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <Typography variant="paragraph-small-bold" className="block truncate">
                {translateMessage('ui.authenticatorApp_1c851ae1')}
              </Typography>
              {authenticator.createdAt && (
                <Typography variant="paragraph-mini" color="muted" className="block">
                  {translateMessage('ui.added_42dc28b7')}
                  {formatDate(authenticator.createdAt)}
                </Typography>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={enrollNewAuthenticator} data-testid="change-authenticator-btn">
            {translateMessage('ui.change_16056c3a')}
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={enrollNewAuthenticator} data-testid="add-authenticator-btn">
          <Plus className="h-3.5 w-3.5" />
          {translateMessage('ui.addAuthenticator_06619c45')}
        </Button>
      )}
    </section>
  )
}

export default SwitchAuthenticatorSection
