import { translateMessage } from '@/i18n'
import { forwardRef, useImperativeHandle, type MouseEvent, type ReactElement } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { Popover, PopoverContent } from '@safe-global/views/components/ui/popover'
import { Button } from '@safe-global/views/components/ui/button'
import { Link as ShadcnLink } from '@safe-global/views/components/ui/link'
import { Typography } from '@safe-global/views/components/ui/typography'
import { cn } from '@safe-global/views/utils/cn'
import NotificationCenterList from '@/components/notification-center/NotificationCenterList'
import UnreadBadge from '@safe-global/views/components/common/UnreadBadge'
import notificationCss from '@/components/notification-center/NotificationCenter/styles.module.css'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@safe-global/utils/utils/chains'
import { AppRoutes } from '@/config/routes'
import SettingsIcon from '@safe-global/views/assets/images/sidebar/settings.svg'
import useNotificationsPopover, { NOTIFICATION_CENTER_LIMIT } from './hooks/useNotificationsPopover'

export type NotificationsPopoverRef = {
  handleClick: (event: MouseEvent<HTMLButtonElement>) => void
}

const NotificationsPopover = forwardRef<NotificationsPopoverRef>((_props, ref): ReactElement => {
  const router = useRouter()
  const hasPushNotifications = useHasFeature(FEATURES.PUSH_NOTIFICATIONS)

  const {
    notifications,
    notificationsToShow,
    unreadCount,
    open,
    anchorEl,
    showAll,
    setShowAll,
    canExpand,
    handleClick,
    handleClose,
    handleClear,
  } = useNotificationsPopover()

  useImperativeHandle(ref, () => ({
    handleClick,
  }))

  const ExpandIcon = showAll ? ChevronUp : ChevronDown

  const onSettingsClick = () => {
    setTimeout(handleClose, 300)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose()
      }}
    >
      <PopoverContent
        showBackdrop
        anchor={anchorEl}
        side="bottom"
        align="start"
        sideOffset={12}
        className={cn('w-auto gap-0 p-0', notificationCss.popoverContainer)}
      >
        <div className={notificationCss.popoverHeader}>
          <div className="flex items-center">
            <Typography data-testid="notifications-title" variant="h4" className="font-bold">
              {translateMessage('ui.notifications_e0d1fbb4')}
            </Typography>
            {unreadCount > 0 && (
              <Typography variant="paragraph-mini" className={notificationCss.unreadCount}>
                {unreadCount}
              </Typography>
            )}
          </div>
          {notifications.length > 0 && (
            <ShadcnLink
              render={<button type="button" />}
              onClick={handleClear}
              className={cn(notificationCss.actionLink, 'no-underline')}
            >
              {translateMessage('ui.clearAll_6e64c421')}
            </ShadcnLink>
          )}
        </div>

        <div>
          <NotificationCenterList notifications={notificationsToShow} handleClose={handleClose} />
        </div>

        <div className={notificationCss.popoverFooter}>
          {canExpand && (
            <>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowAll((prev) => !prev)}
                className={notificationCss.expandButton}
              >
                <UnreadBadge
                  invisible={showAll || unreadCount <= NOTIFICATION_CENTER_LIMIT}
                  anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                  <ExpandIcon className="size-4 text-[var(--color-border-main)]" />
                </UnreadBadge>
              </Button>
              <Typography className="text-[var(--color-border-main)]">
                {showAll
                  ? translateMessage('ui.hide_f514f3dd')
                  : translateMessage('ui.otherNotifications_26375997', {
                      p0: notifications.length - NOTIFICATION_CENTER_LIMIT,
                    })}
              </Typography>
            </>
          )}

          {hasPushNotifications && (
            <Link href={{ pathname: AppRoutes.settings.notifications, query: router.query }} passHref legacyBehavior>
              <ShadcnLink
                data-testid="notifications-button"
                className={notificationCss.settingsLink}
                onClick={onSettingsClick}
              >
                <SettingsIcon className="size-4" /> {translateMessage('ui.pushNotificationsSettings_9ea402f0')}
              </ShadcnLink>
            </Link>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
})

NotificationsPopover.displayName = 'NotificationsPopover'

export default NotificationsPopover
