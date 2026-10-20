import { translateMessage } from '@/i18n'
import { BRAND_NAME } from '@/config/constants'
import type { AppInfo } from '.'

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission !== 'granted' || document.hasFocus()) {
    return
  }

  const notification = new Notification(title, {
    icon: '/images/brand-logo.png',
    ...options,
  })

  notification.onclick = () => {
    window.focus()
    notification.close()
  }

  setTimeout(() => {
    notification.close()
  }, 5_000)
}

export const NotificationMessages: Record<
  string,
  (appInfo: AppInfo) => { title: string; options: NotificationOptions }
> = {
  SIGNATURE_REQUEST: (appInfo: AppInfo) => ({
    title: translateMessage('ui.signatureRequest_c1ab94cb'),
    options: {
      body: translateMessage('ui.wantsYouToSignAMessage_22050d15', { p0: appInfo.name, p1: BRAND_NAME }),
    },
  }),
  TRANSACTION_REQUEST: (appInfo: AppInfo) => ({
    title: translateMessage('ui.transactionRequest_1a4f7061'),
    options: {
      body: translateMessage('ui.wantsToSubmitATransactionOpen_f6798636', { p0: appInfo.name, p1: BRAND_NAME }),
    },
  }),
}
