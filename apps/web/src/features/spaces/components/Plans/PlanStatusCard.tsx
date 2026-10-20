import { translateMessage } from '@/i18n'
import type { ReactNode } from 'react'
import { Fuel, Info, WalletCards } from 'lucide-react'
import { Avatar, AvatarFallback } from '@safe-global/views/components/ui/avatar'
import { Badge } from '@safe-global/views/components/ui/badge'
import { Button } from '@safe-global/views/components/ui/button'
import { Card, CardContent } from '@safe-global/views/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Typography } from '@safe-global/views/components/ui/typography'
import { formatDate } from '@safe-global/utils/utils/date'
import { TRIAL_ENDING_SOON_DAYS, trialLabel } from '../../hooks/billing/subscription'
import { TRIAL_DISCLAIMER } from '../../constants'
import type { CurrentBadge } from './PlanCards'
import type { Meter, PlanSummary } from '@safe-global/views/features/spaces/components/Plans/types'

export const _remaining = ({ used, quota }: Meter): number | null => (quota === null ? null : Math.max(quota - used, 0))

export const seatsTooltip = (tierName: string | undefined, quota: number | null | undefined) =>
  translateMessage('ui.coversAccountsAtRemoveOneFrom_539a76ca', {
    p0: tierName
      ? translateMessage('ui.yourPlan_1cfcc241', { p0: tierName })
      : translateMessage('ui.yourPlan_93a20c7c'),
    p1: quota ?? 'unlimited',
    p2: quota ?? 'unlimited',
  })

/** The badge both the status card and the current plan card wear: trial with its countdown, or Active. */
export const getCurrentBadge = (plan: PlanSummary | null): CurrentBadge | undefined => {
  if (!plan) return undefined
  if (plan.status === 'active') return { label: translateMessage('ui.active_889c3246'), variant: 'brand' }
  const endingSoon = plan.daysLeft !== null && plan.daysLeft <= TRIAL_ENDING_SOON_DAYS
  return {
    label: trialLabel(plan.daysLeft),
    variant: endingSoon ? 'warning' : 'brand',
  }
}

export const InfoTip = ({ text, 'data-testid': testId }: { text: string; 'data-testid'?: string }) => (
  <Tooltip>
    <TooltipTrigger render={<span className="inline-flex" data-testid={testId} />}>
      <Info className="size-4 text-muted-foreground" />
    </TooltipTrigger>
    <TooltipContent className="max-w-65">{text}</TooltipContent>
  </Tooltip>
)

const UsageMeter = ({
  icon,
  label,
  tooltip,
  meter,
}: {
  icon: ReactNode
  label: string
  tooltip?: string
  meter: Meter | null
}) => {
  const left = meter && _remaining(meter)
  const isExhausted = left === 0

  return (
    <Card variant="muted" size="sm" className="flex-1">
      <CardContent className="flex items-center justify-between">
        <div className="mr-4 flex items-center gap-3">
          <Avatar>
            <AvatarFallback surface="card">{icon}</AvatarFallback>
          </Avatar>
          <Typography variant="paragraph-medium">{label}</Typography>
          {tooltip && <InfoTip text={tooltip} />}
        </div>
        <Typography
          variant="paragraph-bold"
          className="flex items-center gap-1.5 whitespace-nowrap"
          data-testid={isExhausted ? 'meter-exhausted' : undefined}
        >
          {isExhausted && <span aria-hidden className="size-1.5 rounded-full bg-destructive" />}
          {meter === null ? (
            '—'
          ) : left === null ? (
            'Unlimited'
          ) : (
            <>
              <span data-testid="meter-left">{left}</span>{' '}
              <Typography variant="paragraph-small" color="muted">
                / {meter.quota}
              </Typography>
            </>
          )}
        </Typography>
      </CardContent>
    </Card>
  )
}

const statusText = (plan: PlanSummary | null, endDate: string | null, isSeatsFull: boolean): string | null => {
  if (plan === null) {
    return translateMessage('ui.yourWorkspaceIsLockedUntilYou_7950ebfd')
  }
  if (plan.status === 'active') {
    return isSeatsFull ? translateMessage('ui.accountsAboveTheLimitRemainAvailable_2e2bbc4e') : null
  }
  const until = endDate ?? 'the end of the period'
  return !plan.hasPaymentMethod
    ? translateMessage('ui.yourFreeAccessIsActiveUntil_40a05cfc', { p0: until })
    : translateMessage('ui.activeUntil_ba11368d', { p0: until })
}

export default function PlanStatusCard({
  plan,
  safeAccounts,
  sponsoredTxs,
  tierName,
  onManage,
  isManaging,
  canManage = plan?.status === 'active',
}: {
  plan: PlanSummary | null
  safeAccounts: Meter | null
  sponsoredTxs: Meter | null
  tierName?: string
  onManage?: () => void
  isManaging?: boolean
  /** Shows "Manage plan": on by default for a paid plan, and worth keeping for a lapsed one that still has a Stripe portal. */
  canManage?: boolean
}) {
  const isTrial = plan?.status === 'trialing'
  const endDate = plan?.periodEndsAt ? formatDate(new Date(plan.periodEndsAt).getTime()) : null
  const badge = getCurrentBadge(plan)
  const text = statusText(plan, endDate, safeAccounts !== null && _remaining(safeAccounts) === 0)

  return (
    <Card radius="xl">
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Typography variant="h4">{plan?.name ?? 'No active plan'}</Typography>
                {badge && (
                  <Badge variant={badge.variant} size="status" shape="status" data-testid="plan-status-badge">
                    {badge.label}
                  </Badge>
                )}
              </div>
              {text && (
                <Typography className="flex items-center gap-1">
                  {text}
                  {isTrial && !plan?.hasPaymentMethod && (
                    <InfoTip text={TRIAL_DISCLAIMER} data-testid="trial-disclaimer" />
                  )}
                </Typography>
              )}
            </div>
            {canManage && (
              <Button variant="outline" size="lg" onClick={onManage} disabled={isManaging}>
                {translateMessage('ui.managePlan_3dafd87f')}
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-4 md:flex-row">
            <UsageMeter
              icon={<WalletCards className="size-5" strokeWidth={1.5} />}
              label={translateMessage('ui.accountsAvailable_4099c4a1')}
              tooltip={seatsTooltip(tierName, safeAccounts?.quota)}
              meter={safeAccounts}
            />
            <UsageMeter
              icon={<Fuel className="size-5" strokeWidth={1.5} />}
              label={translateMessage('ui.sponsoredTransactionsAvailable_37ce68c7')}
              meter={sponsoredTxs}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
