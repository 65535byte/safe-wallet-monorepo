import { translateMessage } from '@/i18n'
import { useMemo, useState } from 'react'
import { Skeleton } from '@safe-global/views/components/ui/skeleton'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useIsSafeProEnabled } from '@/hooks/useIsSafeProEnabled'
import { cn } from '@safe-global/views/utils/cn'
import { useTrackOnce } from '@/services/analytics/useTrackOnce'
import { SAFE_PRO_EVENTS } from '@/services/analytics/events/safe-pro'
import { BillingPeriod, MixpanelEventParams } from '@/services/analytics/mixpanel-events'
import AuthState from '../AuthState'
import Plans from './index'
import { RECOMMENDED_PLAN } from '@safe-global/views/features/spaces/components/Plans/planCatalog'
import { takePlansEntry } from './planSelection'
import { buildPlanTiers, toCurrentPlan } from './planTiers'
import { useIsAdmin } from '../../hooks/useSpaceMembers'
import { useSpacePlan } from '../../hooks/useSpacePlan'
import { useSpaceOffers } from '../../hooks/billing/useSpaceOffers'
import { useBillingPortal } from '../../hooks/billing/useBillingPortal'
import { useStartCheckout } from '../../hooks/billing/useStartCheckout'
import { useChangePlan } from '../../hooks/billing/useChangePlan'
import ChangePlanFlow from './ChangePlanFlow'
import type { PlanPick, PlanTier } from '@safe-global/views/features/spaces/components/Plans/types'

const PlansSkeleton = () => (
  <div className="flex flex-col gap-6" data-testid="plans-skeleton">
    <Skeleton className="h-49 w-full rounded-xl" />
    <Skeleton className="h-140 w-full rounded-xl" />
  </div>
)

/** The seats the recommended card opens on, the same option its card picks first. */
const defaultSeats = (tiers: PlanTier[]): number | undefined => {
  const tier = tiers.find((candidate) => candidate.name === RECOMMENDED_PLAN && candidate.billingCycle !== 'year')
  const option = tier?.options.find((candidate) => candidate.priceId === tier.currentPriceId) ?? tier?.options[0]
  return option?.seats ?? undefined
}

export default function SpacePlansPage({ spaceId }: { spaceId: string }) {
  const isDarkMode = useDarkMode()
  const isSafePro = useIsSafeProEnabled()
  const {
    plan,
    seats,
    sponsoredTxs,
    subscription,
    isTrialing,
    isLoading: isPlanLoading,
    isUninitialized,
  } = useSpacePlan(spaceId)
  const { paidPlans, isLoading: isOffersLoading } = useSpaceOffers(spaceId)
  const { openPortal, isRedirecting } = useBillingPortal(spaceId)
  const { startCheckout, isRedirecting: isCheckingOut } = useStartCheckout(spaceId)
  const { canChange } = useChangePlan(spaceId)
  const isAdmin = useIsAdmin(spaceId)
  const [pick, setPick] = useState<PlanPick>()

  const currentPlan = useMemo(
    () => (canChange && subscription && plan ? toCurrentPlan(subscription, plan, isTrialing, seats?.quota) : undefined),
    [canChange, subscription, plan, isTrialing, seats?.quota],
  )
  const tiers = useMemo(
    () =>
      buildPlanTiers(paidPlans, currentPlan && subscription ? { subscription, seatsQuota: seats?.quota } : undefined),
    [paidPlans, currentPlan, subscription, seats?.quota],
  )
  const [entry] = useState(takePlansEntry)
  const isReady = isSafePro && !isPlanLoading && !isOffersLoading && !isUninitialized
  useTrackOnce(
    SAFE_PRO_EVENTS.PLANS_PAGE_VIEWED,
    {
      ...entry,
      [MixpanelEventParams.DEFAULT_SEATS]: defaultSeats(tiers),
      [MixpanelEventParams.DEFAULT_BILLING_PERIOD]: BillingPeriod.MONTHLY,
      [MixpanelEventParams.PLAN_LIMIT]: seats?.quota ?? undefined,
      [MixpanelEventParams.SPONSORED_REMAINING]:
        sponsoredTxs?.quota != null ? sponsoredTxs.quota - sponsoredTxs.used : undefined,
      [MixpanelEventParams.SPONSORED_QUOTA]: sponsoredTxs?.quota ?? undefined,
    },
    isReady,
  )

  return (
    <AuthState spaceId={spaceId}>
      <div className={cn('shadcn-scope', isDarkMode && 'dark')}>
        <Typography variant="h2" className="mb-6 font-bold leading-[1] tracking-tight">
          {translateMessage('ui.plans_9fadee1c')}
        </Typography>

        {!isSafePro ? null : isPlanLoading || isOffersLoading ? (
          <PlansSkeleton />
        ) : (
          <Plans
            plan={plan}
            safeAccounts={seats}
            sponsoredTxs={sponsoredTxs}
            tiers={tiers}
            onManage={() => void openPortal()}
            isManaging={isRedirecting}
            canManage={plan?.status === 'active' || (plan === null && subscription !== undefined)}
            onSubscribe={(picked) => {
              if (canChange) setPick(picked)
              else if (picked.option.paymentLinkId) {
                void startCheckout(picked.option.paymentLinkId)
              }
            }}
            isSubscribing={isCheckingOut}
            currentPlan={currentPlan}
            readOnly={!isAdmin}
          />
        )}

        {pick && currentPlan && (
          <ChangePlanFlow
            spaceId={spaceId}
            pick={pick}
            currentPlan={currentPlan}
            entry={entry}
            onClose={() => setPick(undefined)}
          />
        )}
      </div>
    </AuthState>
  )
}
