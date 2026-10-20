import { translateMessage } from '@/i18n'
import type { ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useSpacesGetOneV1Query } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import { AppRoutes } from '@/config/routes'
import { formatDate } from '@safe-global/utils/utils/date'
import { highlightSafePro } from '@safe-global/views/components/common/ProHighlight'
import { useTrackOnce } from '@/services/analytics/useTrackOnce'
import { SAFE_PRO_EVENTS } from '@/services/analytics/events/safe-pro'
import { SafeProNoticeModal } from '@safe-global/views/features/spaces/components/SafeProModals'
import { useCheckoutReturn, type CheckoutReturnStatus } from '../../hooks/billing/useCheckoutReturn'
import { useCurrentMembership, useIsAdmin } from '../../hooks/useSpaceMembers'
import { useWorkspaceLock, type WorkspaceLockReason } from '../../hooks/useWorkspaceLock'
import { claimCopy } from './ClaimTrialModal'
import ClaimTrialModal from './ClaimTrialModal'
import PlanChooserModal, { chooserCopy } from './PlanChooserModal'

export const _memberCopy = (
  reason: WorkspaceLockReason,
  trialPeriodDays: number | null,
  endedAt: number | null,
  spaceName: string,
): { title: string; body: string } => {
  if (reason === 'trial-offered') {
    return {
      title: claimCopy(trialPeriodDays).title,
      body: translateMessage('ui.isLockedUntilAnAdminClaims_7cbc8b67', { p0: spaceName }),
    }
  }
  return {
    title:
      reason === 'payment-failed'
        ? translateMessage('ui.yourWorkspaceSLastPaymentFailed_19171e22')
        : reason === 'lapsed' && endedAt !== null
          ? translateMessage('ui.yourFreeAccessEndedOn_438b40a7', { p0: formatDate(endedAt) })
          : chooserCopy(reason, endedAt).title,
    body: translateMessage('ui.anAdminNeedsToChooseA_eab0ce30'),
  }
}

// Statuses in which the checkout modals give the screen back to the lock.
const CHECKOUT_RELEASED_STATUSES: CheckoutReturnStatus[] = ['error', 'timeout', 'canceled']

export const _PLAN_ERROR_COPY = {
  title: translateMessage('ui.yourPlanCouldNotBeChecked_8c55d6ef'),
  body: translateMessage('ui.weCouldNotLoadThePlan_36844f75'),
}

/** A member cannot act on a lapsed or failed plan; the notice is the whole of the locked flow for them. */
const MemberLockedNotice = ({
  reason,
  title,
  body,
  onBack,
}: {
  reason: WorkspaceLockReason
  title: ReactNode
  body: string
  onBack: () => void
}) => {
  const isPlanLock = reason !== 'trial-offered'
  useTrackOnce(SAFE_PRO_EVENTS.WORKSPACE_LOCKED_VIEWED, undefined, isPlanLock)

  return (
    <SafeProNoticeModal
      open
      title={title}
      body={body}
      onAction={onBack}
      secondaryActionLabel={reason === 'lapsed' ? translateMessage('ui.createNewWorkspace_cb2e6739') : undefined}
      secondaryActionHref={reason === 'lapsed' ? AppRoutes.welcome.spaces : undefined}
    />
  )
}

/** Mounted on every Workspace page; none of the modals it shows can be dismissed. */
export default function WorkspaceLockModal({ spaceId }: { spaceId: string }) {
  const router = useRouter()
  const { isLocked, isError, retry, reason, endedAt, trialPeriodDays } = useWorkspaceLock(spaceId)
  const membership = useCurrentMembership(spaceId)
  const isAdmin = useIsAdmin(spaceId)
  const { currentData: space } = useSpacesGetOneV1Query({ id: spaceId }, { skip: !isLocked })
  // Back from a completed Stripe checkout the subscription is still propagating: the checkout modals own the screen
  // until it fails. An abandoned checkout (Back) changed nothing, so the lock shows again right away.
  const checkout = useCheckoutReturn(spaceId)
  const isConfirmingCheckout = checkout.isReturning && !CHECKOUT_RELEASED_STATUSES.includes(checkout.status)

  // Without the membership the admin check cannot be trusted yet; a non-member never gets this far (AuthState).
  if (!membership || isConfirmingCheckout) return null

  const goBack = () => void router.push(AppRoutes.welcome.accounts)

  if (isError) {
    return (
      <SafeProNoticeModal
        open
        title={_PLAN_ERROR_COPY.title}
        body={_PLAN_ERROR_COPY.body}
        actionLabel={translateMessage('ui.backToMyAccounts_c38a5872')}
        onAction={goBack}
        secondaryActionLabel={translateMessage('ui.tryAgain_27537f8f')}
        onSecondaryAction={retry}
      />
    )
  }

  if (!isLocked) return null

  if (!isAdmin) {
    const { title, body } = _memberCopy(reason, trialPeriodDays, endedAt, space?.name ?? 'This Workspace')
    return <MemberLockedNotice reason={reason} title={highlightSafePro(title)} body={body} onBack={goBack} />
  }

  if (reason === 'trial-offered') return <ClaimTrialModal spaceId={spaceId} onBack={goBack} />

  return <PlanChooserModal spaceId={spaceId} reason={reason} endedAt={endedAt} onBack={goBack} />
}
