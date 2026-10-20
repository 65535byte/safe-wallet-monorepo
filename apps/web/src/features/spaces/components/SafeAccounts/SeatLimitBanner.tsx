import { translateMessage } from '@/i18n'
import { useState } from 'react'
import NextLink from 'next/link'
import { ArrowRight, Lock } from 'lucide-react'
import { Alert, AlertDescription } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'
import { Link } from '@safe-global/views/components/ui/link'
import { sessionItem } from '@/services/local-storage/session'
import { useCurrentSpaceId } from '../../hooks/useCurrentSpaceId'
import { useSeatUpsell } from '../../hooks/useSeatUpsell'
import { CONTACT_SALES_URL } from '@/features/spaces/constants'
import {
  MixpanelEventParams,
  PlanSelectionEntryPoint,
  UpgradeFeature,
  UpgradeLocation,
} from '@/services/analytics/mixpanel-events'
import { useTrackOnce } from '@/services/analytics/useTrackOnce'
import { SAFE_PRO_EVENTS } from '@/services/analytics/events/safe-pro'
import { trackPlanSelectionStarted } from '../Plans/planSelection'

const PROMPT = {
  [MixpanelEventParams.FEATURE]: UpgradeFeature.SAFE_ACCOUNTS_LIMIT,
  [MixpanelEventParams.LOCATION]: UpgradeLocation.SAFE_ACCOUNTS_PAGE,
}

const dismissedBanners = sessionItem<Record<string, true>>('seatLimitBannerDismissed')

/** Shown once the Workspace holds as many Safes as its plan covers: upgrade when a bigger plan is offered, else sales. */
export default function SeatLimitBanner({
  variant = 'card',
  className,
}: {
  /** `card` sits on the Safe accounts page, `alert` inside the add-accounts chooser. */
  variant?: 'card' | 'alert'
  className?: string
}) {
  const { tierName, limit, upgradePlanName, plansHref } = useSeatUpsell()
  const spaceId = useCurrentSpaceId()
  const [isDismissed, setIsDismissed] = useState(() => Boolean(spaceId && dismissedBanners.get()?.[spaceId]))
  useTrackOnce(SAFE_PRO_EVENTS.UPGRADE_PROMPT_VIEWED, PROMPT, limit !== null && Boolean(upgradePlanName))
  if (limit === null) return null

  const title = translateMessage('ui.includesAccounts_cc48511a', {
    p0: tierName ? translateMessage('ui.thePlan_71b8acf7', { p0: tierName }) : translateMessage('ui.yourPlan_93a20c7c'),
    p1: limit,
  })
  const body = upgradePlanName
    ? translateMessage('ui.upgradeForMoreOrRemoveOne_05dc253e')
    : translateMessage('ui.removeOneToAddAnotherOr_5ca15593')
  const cta = (
    <Button
      size="sm"
      accentIcon
      className="shrink-0"
      render={
        upgradePlanName ? (
          <NextLink href={plansHref} />
        ) : (
          <a href={CONTACT_SALES_URL} target="_blank" rel="noopener noreferrer" />
        )
      }
      onClick={() =>
        upgradePlanName &&
        trackPlanSelectionStarted({
          [MixpanelEventParams.ENTRY_POINT]: PlanSelectionEntryPoint.UPGRADE_PROMPT,
          ...PROMPT,
        })
      }
    >
      {upgradePlanName
        ? translateMessage('ui.upgradeTo_12fad32d', { p0: upgradePlanName })
        : translateMessage('ui.talkToSales_9cc25443')}
      <ArrowRight data-icon="inline-end" />
    </Button>
  )

  if (variant === 'alert') {
    return (
      <Alert variant="warning" outlined={false} className={className} data-testid="seat-limit-banner">
        <Lock className="size-4" />
        <AlertDescription>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">{title}</span>
              <span>{body}</span>
            </div>
            {cta}
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  if (isDismissed) return null

  const dismiss = () => {
    if (spaceId) dismissedBanners.set({ ...(dismissedBanners.get() ?? {}), [spaceId]: true })
    setIsDismissed(true)
  }

  return (
    <Alert variant="info" className={className} data-testid="seat-limit-banner">
      <AlertDescription>
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-foreground">{title}</span>
            <span className="text-muted-foreground">
              {translateMessage('ui.removeOneToAddAnotherOr_8eb77993')}{' '}
              {upgradePlanName ? (
                <Link
                  variant="inherit"
                  className="font-medium underline"
                  render={<NextLink href={plansHref} />}
                  onClick={() =>
                    trackPlanSelectionStarted({
                      [MixpanelEventParams.ENTRY_POINT]: PlanSelectionEntryPoint.UPGRADE_PROMPT,
                      ...PROMPT,
                    })
                  }
                >
                  {translateMessage('ui.upgradeTo_2cd4e529')}
                  {upgradePlanName}.
                </Link>
              ) : (
                <Link
                  variant="inherit"
                  className="font-medium underline"
                  href={CONTACT_SALES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {translateMessage('ui.talkToUsAboutAHigher_bce685a6')}
                </Link>
              )}{' '}
              <ArrowRight className="inline size-4 align-text-bottom" />
            </span>
          </div>
          <Button variant="outline" className="shrink-0" onClick={dismiss}>
            {translateMessage('ui.gotIt_008f9813')}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
