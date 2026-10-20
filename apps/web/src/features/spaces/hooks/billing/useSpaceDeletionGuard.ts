import { translateMessage } from '@/i18n'
import { formatDate } from '@safe-global/utils/utils/date'
import { isSpaceDeletionBlocked } from './subscription'
import { useSpaceSubscription } from './useSpaceSubscription'

export const SUBSCRIPTION_CHECK_FAILED_MESSAGE = translateMessage('ui.weCouldnTCheckThisWorkspace_b8a1cfa9')

export const getDeletionBlockedReason = (cancelAt: number | null | undefined): string =>
  cancelAt
    ? translateMessage('ui.theSubscriptionIsSetToCancel_6adc3440', { p0: formatDate(cancelAt * 1000) })
    : translateMessage('ui.cancelTheSubscriptionBeforeDeletingThis_1f8a7ac1')

type SpaceDeletionGuard = {
  isDeletionBlocked: boolean
  blockedReason?: string
}

/** Deleting a Workspace is only allowed without a subscription Stripe could still bill. */
export const useSpaceDeletionGuard = (spaceId: string | null): SpaceDeletionGuard => {
  const { subscription, status, isLoading, isError, hasData } = useSpaceSubscription(spaceId)

  if (isLoading) return { isDeletionBlocked: true }
  if (isError && !hasData) return { isDeletionBlocked: true, blockedReason: SUBSCRIPTION_CHECK_FAILED_MESSAGE }
  if (isSpaceDeletionBlocked(status)) {
    return { isDeletionBlocked: true, blockedReason: getDeletionBlockedReason(subscription?.cancelAt) }
  }

  return { isDeletionBlocked: false }
}
