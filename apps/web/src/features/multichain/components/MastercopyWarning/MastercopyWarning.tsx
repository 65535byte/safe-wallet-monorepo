import { translateMessage } from '@/i18n'
import { useCallback, useContext } from 'react'
import { Alert, AlertDescription, AlertTitle, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'
import { TxModalContext } from '@/components/tx-flow'
import { MigrateSafeL2Flow, UpdateSafeFlow } from '@/components/tx-flow/flows'
import { ActionCard } from '@/components/common/ActionCard'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import CheckWallet from '@/components/common/CheckWallet'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { trackEvent } from '@/services/analytics'
import { ATTENTION_PANEL_EVENTS } from '@/services/analytics/events/attention-panel'
import { useMastercopyMigration } from '../../hooks/useMastercopyMigration'

type MastercopyWarningProps = {
  /**
   * `dashboard` (default) renders the compact ActionCard shown in the attention panel.
   * `settings` renders the richer Alert shown on the Contract version settings page,
   * which also prompts non-critical updates.
   */
  variant?: 'dashboard' | 'settings'
}

export const MastercopyWarning = ({ variant = 'dashboard' }: MastercopyWarningProps) => {
  const { action, isCritical, isOfficialDeployer, isBytecodeLoading, latestVersion, changelogUrl } =
    useMastercopyMigration()
  const isOwner = useIsSafeOwner()
  const { setTxFlow } = useContext(TxModalContext)
  const openMigrateModal = useCallback(() => setTxFlow(<MigrateSafeL2Flow />), [setTxFlow])
  const openUpdateModal = useCallback(() => setTxFlow(<UpdateSafeFlow />), [setTxFlow])

  // Don't show a warning while the bytecode comparison is still resolving
  if (isBytecodeLoading) return null

  if (action === 'migrate') {
    return (
      <Alert variant="warning" outlined={false} data-testid="action-card">
        <AlertSeverityIcon variant="warning" />
        <AlertTitle className="font-bold">
          {translateMessage('ui.thisIsRunningAnUnsupportedVersion_5dc6d5a3')}
        </AlertTitle>
        <AlertDescription>
          {translateMessage('ui.itMayMissSecurityFixesAnd_d38dd7cc')}
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              className="text-foreground"
              data-testid="migrate-mastercopy-btn"
              onClick={() => {
                trackEvent(ATTENTION_PANEL_EVENTS.MIGRATE_MASTERCOPY)
                openMigrateModal()
              }}
            >
              {translateMessage('ui.migrate_77220f4b')}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (action === 'redeploy') {
    return (
      <Alert variant="warning" outlined={false} data-testid="redeploy-mastercopy-warning">
        <AlertSeverityIcon variant="warning" />
        <AlertTitle className="font-bold">
          {translateMessage('ui.thisCanTBeUpgradedTo_0edab8f9')}
          {latestVersion} {translateMessage('ui.onThisNetwork_1d97ae0a')}
        </AlertTitle>
        <AlertDescription>{translateMessage('ui.zkSyncAccountsCreatedBeforeTheEVM_06c34e56')}</AlertDescription>
      </Alert>
    )
  }

  if (action === 'cli') {
    return (
      <Alert variant="warning" outlined={false} data-testid="action-card">
        <AlertSeverityIcon variant="warning" />
        <AlertTitle className="font-bold">
          {translateMessage('ui.thisIsRunningAnUnsupportedVersion_5dc6d5a3')}
        </AlertTitle>
        <AlertDescription>{translateMessage('ui.itMayMissSecurityFixesAnd_81e27450')}</AlertDescription>
      </Alert>
    )
  }

  if (action === 'update' && isOfficialDeployer) {
    // Settings intentionally prompts non-critical updates too, hence no `isCritical` gate here.
    if (variant === 'settings') {
      return (
        <Alert variant="success">
          <InfoIcon className="size-4" />
          <AlertTitle>
            {translateMessage('ui.newVersionIsAvailable_98001001')}
            {latestVersion} (
            <ExternalLink href={changelogUrl} className="font-bold hover:!text-[var(--color-primary-light)]">
              {translateMessage('ui.changelog_69967bd7')}
            </ExternalLink>
            )
          </AlertTitle>

          <AlertDescription>
            <p>{translateMessage('ui.updateNowToTakeAdvantageOf_92999d07')}</p>

            <CheckWallet>
              {(isOk) => (
                <Button onClick={openUpdateModal} disabled={!isOk}>
                  {translateMessage('ui.update_5cb0e4fd')}
                </Button>
              )}
            </CheckWallet>
          </AlertDescription>
        </Alert>
      )
    }

    // Dashboard only nags for critical updates.
    if (isCritical) {
      return (
        <ActionCard
          severity="info"
          title={translateMessage('ui.newVersionIsAvailable_90fbe802', { p0: latestVersion })}
          content={translateMessage('ui.updateNowToTakeAdvantageOf_92999d07')}
          action={isOwner ? { label: translateMessage('ui.update_5cb0e4fd'), onClick: openUpdateModal } : undefined}
          trackingEvent={ATTENTION_PANEL_EVENTS.UPDATE_OUTDATED_MASTERCOPY}
          actionTestId="update-mastercopy-btn"
        />
      )
    }
  }

  return null
}
