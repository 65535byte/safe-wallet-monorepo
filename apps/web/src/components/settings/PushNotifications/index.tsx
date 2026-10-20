import { translateMessage } from '@/i18n'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Checkbox } from '@safe-global/views/components/ui/checkbox'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Switch } from '@safe-global/views/components/ui/switch'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Field, FieldLabel } from '@safe-global/views/components/ui/field'
import { Link as ShadcnLink } from '@safe-global/views/components/ui/link'
import NextLink from 'next/link'
import { useState } from 'react'
import type { ReactElement } from 'react'

import useSafeInfo from '@/hooks/useSafeInfo'
import EthHashInfo from '@/components/common/EthHashInfo'
import { WebhookType } from '@/service-workers/firebase-messaging/webhook-types'
import { useNotificationRegistrations } from './hooks/useNotificationRegistrations'
import { useNotificationPreferences } from './hooks/useNotificationPreferences'
import { GlobalPushNotifications } from './GlobalPushNotifications'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { IS_DEV } from '@/config/constants'
import { trackEvent } from '@/services/analytics'
import { PUSH_NOTIFICATION_EVENTS } from '@/services/analytics/events/push-notifications'
import { AppRoutes } from '@/config/routes'
import CheckWalletWithPermission from '@/components/common/CheckWalletWithPermission'
import { useIsMac } from '@/hooks/useIsMac'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { Permission } from '@/permissions/config'
import { useIsAboveLg } from '@/hooks/useMediaQuery'
import SettingsCard from '@safe-global/views/components/settings/SettingsCard'

import css from './styles.module.css'
import NetworkWarning from '@/components/new-safe/create/NetworkWarning'
import NotificationRenewal from '@/components/notification-center/NotificationRenewal'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'

export const PushNotifications = (): ReactElement => {
  const { safe, safeLoaded } = useSafeInfo()
  const isOwner = useIsSafeOwner()
  const isMac = useIsMac()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isUpdatingIndexedDb, setIsUpdatingIndexedDb] = useState(false)
  const isLargeScreen = useIsAboveLg()

  const { updatePreferences, getPreferences, getAllPreferences } = useNotificationPreferences()
  const { unregisterSafeNotifications, unregisterDeviceNotifications, registerNotifications } =
    useNotificationRegistrations()

  const preferences = getPreferences(safe.chainId, safe.address.value)

  const setPreferences = (newPreferences: NonNullable<ReturnType<typeof getPreferences>>) => {
    setIsUpdatingIndexedDb(true)

    updatePreferences(safe.chainId, safe.address.value, newPreferences)

    setIsUpdatingIndexedDb(false)
  }

  const shouldShowMacHelper = isMac || IS_DEV

  const handleOnChange = async () => {
    setIsRegistering(true)

    if (!preferences) {
      await registerNotifications({ [safe.chainId]: [safe.address.value] })
      trackEvent(PUSH_NOTIFICATION_EVENTS.ENABLE_SAFE)
      setIsRegistering(false)
      return
    }

    const allPreferences = getAllPreferences()
    const totalRegisteredSafesOnChain = allPreferences
      ? Object.values(allPreferences).filter(({ chainId }) => chainId === safe.chainId).length
      : 0
    const shouldUnregisterDevice = totalRegisteredSafesOnChain === 1

    if (shouldUnregisterDevice) {
      await unregisterDeviceNotifications(safe.chainId)
    } else {
      await unregisterSafeNotifications(safe.chainId, safe.address.value)
    }

    trackEvent(PUSH_NOTIFICATION_EVENTS.DISABLE_SAFE)
    setIsRegistering(false)
  }

  return (
    <>
      <SettingsCard
        title={translateMessage('ui.pushNotifications_4b60d36f')}
        className="mb-4"
        contentClassName="sm:grid-cols-[1fr_2fr]"
      >
        <div className="flex flex-col gap-5">
          <NotificationRenewal />

          <Typography>
            {translateMessage('ui.enablePushNotificationsFor_84be4c17')}
            {safeLoaded
              ? translateMessage('ui.thisAccount_6eff2e56')
              : translateMessage('ui.yourAccounts_bfcf09bc')}{' '}
            {translateMessage('ui.inYourBrowserWithYourSignature_1551fb69')}{' '}
            <ExternalLink className="font-bold hover:text-muted-foreground" href={HelpCenterArticle.PUSH_NOTIFICATIONS}>
              {translateMessage('ui.here_134b2f0e')}
            </ExternalLink>
          </Typography>

          {shouldShowMacHelper && (
            <Alert variant="info">
              <AlertSeverityIcon variant="info" />
              <AlertDescription>
                <Typography variant="paragraph-small-bold" className="mb-2 block">
                  {translateMessage('ui.forMacOSUsers_6070b9b2')}
                </Typography>
                <Typography variant="paragraph-small">
                  {translateMessage('ui.doubleCheckThatYouHaveEnabled_31a3238e')}
                  <b>{translateMessage('ui.systemSettings_13527289')}</b> &gt;{' '}
                  <b>{translateMessage('ui.notifications_e0d1fbb4')}</b> &gt;{' '}
                  <b>{translateMessage('ui.applicationNotifications_3fbde10e')}</b>{' '}
                  {translateMessage('ui.pathMayVaryDependingOnOS_614d8244')}
                </Typography>
              </AlertDescription>
            </Alert>
          )}

          {safeLoaded ? (
            <>
              <Separator />
              <NetworkWarning action={translateMessage('ui.changeYourNotificationSettings_9922342a')} />

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <EthHashInfo
                  address={safe.address.value}
                  showCopyButton
                  shortAddress={!isLargeScreen}
                  showName={true}
                  hasExplorer
                />
                <CheckWalletWithPermission
                  permission={Permission.EnablePushNotifications}
                  checkNetwork={!isRegistering && safe.deployed}
                >
                  {(isOk) => {
                    const disabled = !isOk || isRegistering || !safe.deployed
                    return (
                      <Field orientation="horizontal" className="w-fit" data-disabled={disabled || undefined}>
                        <Switch
                          data-testid="notifications-switch"
                          checked={!!preferences}
                          onCheckedChange={handleOnChange}
                          disabled={disabled}
                        />
                        <FieldLabel>
                          {preferences ? translateMessage('ui.on_b629d376') : translateMessage('ui.off_ba73348a')}
                        </FieldLabel>
                      </Field>
                    )
                  }}
                </CheckWalletWithPermission>
              </div>

              <div className={css.globalInfo}>
                <Typography variant="paragraph-small">
                  {translateMessage('ui.wantToSetupNotificationsForDifferent_5e2d01ee')}{' '}
                  <ShadcnLink className="font-bold" render={<NextLink href={AppRoutes.settings.notifications} />}>
                    {translateMessage('ui.globalPreferences_a9a982be')}
                  </ShadcnLink>
                  .
                </Typography>
              </div>
            </>
          ) : (
            <GlobalPushNotifications />
          )}
        </div>
      </SettingsCard>
      {preferences && (
        <SettingsCard title={translateMessage('ui.notification_d41b6f05')} contentClassName="sm:grid-cols-[1fr_2fr]">
          <div className="flex flex-col gap-4">
            <Field orientation="horizontal" className="w-fit">
              <Checkbox
                id="incoming-txs"
                checked={preferences[WebhookType.INCOMING_ETHER] && preferences[WebhookType.INCOMING_TOKEN]}
                disabled={isUpdatingIndexedDb}
                onCheckedChange={(checked) => {
                  setPreferences({
                    ...preferences,
                    [WebhookType.INCOMING_ETHER]: checked,
                    [WebhookType.INCOMING_TOKEN]: checked,
                  })

                  trackEvent({ ...PUSH_NOTIFICATION_EVENTS.TOGGLE_INCOMING_TXS, label: checked })
                }}
              />
              <FieldLabel htmlFor="incoming-txs">{translateMessage('ui.incomingTransactions_95d1bee4')}</FieldLabel>
            </Field>

            <Field orientation="horizontal" className="w-fit">
              <Checkbox
                id="outgoing-txs"
                checked={
                  preferences[WebhookType.MODULE_TRANSACTION] && preferences[WebhookType.EXECUTED_MULTISIG_TRANSACTION]
                }
                disabled={isUpdatingIndexedDb}
                onCheckedChange={(checked) => {
                  setPreferences({
                    ...preferences,
                    [WebhookType.MODULE_TRANSACTION]: checked,
                    [WebhookType.EXECUTED_MULTISIG_TRANSACTION]: checked,
                  })

                  trackEvent({ ...PUSH_NOTIFICATION_EVENTS.TOGGLE_OUTGOING_TXS, label: checked })
                }}
              />
              <FieldLabel htmlFor="outgoing-txs">{translateMessage('ui.outgoingTransactions_8a44b5f8')}</FieldLabel>
            </Field>

            <Field orientation="horizontal" className="w-fit" data-disabled={!isOwner || !preferences || undefined}>
              <Checkbox
                id="confirmation-requests"
                checked={preferences[WebhookType.CONFIRMATION_REQUEST]}
                disabled={isUpdatingIndexedDb || !isOwner || !preferences}
                onCheckedChange={(checked) => {
                  const updateConfirmationRequestPreferences = () => {
                    setPreferences({
                      ...preferences,
                      [WebhookType.CONFIRMATION_REQUEST]: checked,
                    })

                    trackEvent({ ...PUSH_NOTIFICATION_EVENTS.TOGGLE_CONFIRMATION_REQUEST, label: checked })
                  }

                  if (checked) {
                    registerNotifications({
                      [safe.chainId]: [safe.address.value],
                    })
                      .then((registered) => {
                        if (registered) {
                          updateConfirmationRequestPreferences()
                        }
                      })
                      .catch(() => null)
                  } else {
                    updateConfirmationRequestPreferences()
                  }
                }}
              />
              <FieldLabel htmlFor="confirmation-requests">
                <span className="flex flex-col">
                  <Typography>{translateMessage('ui.confirmationRequests_76ce23a4')}</Typography>
                  {!preferences[WebhookType.CONFIRMATION_REQUEST] && (
                    <Typography variant="paragraph-small" className="text-muted-foreground">
                      {isOwner
                        ? translateMessage('ui.requiresYourSignature_264a5ddf')
                        : translateMessage('ui.onlySigners_fd046100')}
                    </Typography>
                  )}
                </span>
              </FieldLabel>
            </Field>
          </div>
        </SettingsCard>
      )}
    </>
  )
}
