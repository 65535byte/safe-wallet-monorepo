import { translateMessage } from '@/i18n'
import { useMemo, useState, type CSSProperties } from 'react'
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'
import { Card, CardContent } from '@safe-global/views/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@safe-global/views/components/ui/dialog'
import { Link } from '@safe-global/views/components/ui/link'
import { Skeleton } from '@safe-global/views/components/ui/skeleton'
import { Typography } from '@safe-global/views/components/ui/typography'
import { cn } from '@safe-global/views/utils/cn'
import { SAFE_PRO_PRICING_URL } from '@/config/constants'
import { highlightSafePro } from '@safe-global/views/components/common/ProHighlight'
import { formatDate } from '@safe-global/utils/utils/date'
import Track from '@/components/common/Track'
import { useTrackOnce } from '@/services/analytics/useTrackOnce'
import { SAFE_PRO_EVENTS } from '@/services/analytics/events/safe-pro'
import { DismissAction, FreeAccessEntryPoint, MixpanelEventParams } from '@/services/analytics/mixpanel-events'
import { DAY_MS } from '../../hooks/billing/subscription'
import { useSpaceOffers } from '../../hooks/billing/useSpaceOffers'
import { useSeatTrimCheckout } from '../../hooks/billing/useSeatTrimCheckout'
import { RECOMMENDED_PLAN } from '@safe-global/views/features/spaces/components/Plans/planCatalog'
import { claimTiers, formatPlanPrice, priceSuffix } from './planTiers'
import SelectAccountsStep from './SelectAccountsStep'
import { InfoTip } from './PlanStatusCard'
import type { PlanTier, SafeRef } from '@safe-global/views/features/spaces/components/Plans/types'

// The CGW grants the 60-day grace only to Workspaces that predate enforcement; anything else is a new Workspace.
const MIGRATED_TRIAL_DAYS = 60

/** `existing` locks a Workspace that predates Safe Pro; `new` greets one the wizard just created. */
export type ClaimTrialVariant = 'existing' | 'new'

export type ClaimTrialCopy = { title: string; subtitle: string; note: string; back: string; claim: string }

/** What happens when the trial runs out, behind the info icon next to the note. */
export const TRIAL_END_TOOLTIP = translateMessage('ui.yourPaidSubscriptionOnlyStartsOnce_bc4eec70')

/** The price tag's green word: a new Workspace is told how long the free period lasts, an existing one just "Free". */
export const _freeLabel = (trialPeriodDays: number | null, variant: ClaimTrialVariant): string =>
  variant === 'new' && trialPeriodDays !== null
    ? translateMessage('ui.dayFree_a5b654f8', { p0: trialPeriodDays })
    : translateMessage('ui.free_b34fd7a2')

export const claimCopy = (trialPeriodDays: number | null, variant: ClaimTrialVariant = 'existing'): ClaimTrialCopy => {
  if (variant === 'new') {
    return {
      title: translateMessage('ui.workspacesRunOn_41399e7d'),
      subtitle:
        trialPeriodDays === null
          ? translateMessage('ui.yourFirstDaysAreFree_c0b203ae')
          : translateMessage('ui.yourFirstDaysAreFree_a48cc9be', { p0: trialPeriodDays }),
      note: translateMessage('ui.noPaymentMethodRequiredWeLl_58f17b5e'),
      back: translateMessage('ui.goToMyAccounts_c5906669'),
      claim: translateMessage('ui.claimFreeAccess_2779de5b'),
    }
  }
  const existing = {
    note: translateMessage('ui.noPaymentMethodRequiredWeLl_58f17b5e'),
    back: translateMessage('ui.goToMyAccounts_c5906669'),
    claim: translateMessage('ui.claimFreeAccess_2779de5b'),
  }
  return trialPeriodDays === MIGRATED_TRIAL_DAYS
    ? {
        ...existing,
        title: translateMessage('ui.yourWorkspaceMovedTo_bef1b87d'),
        subtitle: translateMessage('ui.youVeUsedBeforeSoYour_67791055'),
      }
    : {
        ...existing,
        title:
          trialPeriodDays === null
            ? translateMessage('ui.startYourFreeAccessTo_6ccadd12')
            : translateMessage('ui.startYourDayFreeAccessTo_bf2f80bd', { p0: trialPeriodDays }),
        subtitle: translateMessage('ui.allProFeaturesUnlockedNoBilling_3ec788aa'),
      }
}

const TrialOfferCard = ({
  tier,
  availableUntil,
  freeText,
  selectable,
  selected,
  onSelect,
}: {
  tier: PlanTier
  availableUntil: string | null
  freeText: string
  selectable: boolean
  selected: boolean
  onSelect: () => void
}) => {
  const option = tier.options[0]
  const features = tier.features.filter((feature) => feature !== 'Unlimited Workspace members')

  return (
    <Card
      variant="muted-secondary"
      radius="lg-xl"
      className={cn('flex-1', selectable && 'cursor-pointer')}
      selected={selectable ? selected : undefined}
      role={selectable ? 'radio' : undefined}
      aria-checked={selectable ? selected : undefined}
      tabIndex={selectable ? 0 : undefined}
      onClick={selectable ? onSelect : undefined}
      onKeyDown={selectable ? (e) => (e.key === 'Enter' || e.key === ' ') && onSelect() : undefined}
      data-testid={`trial-offer-${tier.name}`}
    >
      <CardContent className="flex flex-col">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Typography variant="paragraph-large-medium">{tier.name}</Typography>
            <div className="flex items-baseline gap-1">
              <Typography variant="h4" className="line-through">
                {option.price === null ? 'Custom' : formatPlanPrice(option.price, tier.currency)}
              </Typography>
              <Typography color="muted">{priceSuffix(tier.billingCycle)}</Typography>
              <Typography variant="paragraph-large-bold" color="success">
                {freeText}
              </Typography>
            </div>
            {availableUntil && (
              <Typography variant="paragraph-small" color="muted">
                {translateMessage('ui.availableUntil_b2c52104')}
                {availableUntil}
                {translateMessage('ui.youCanSubscribeAnyTimeAfter_4c8ec82f')}
              </Typography>
            )}
          </div>

          {/* Column-major like the design: the first half of the list on the left, the rest on the right. */}
          <ul
            className="grid gap-x-6 gap-y-2 sm:grid-flow-col sm:grid-rows-[repeat(var(--rows),auto)]"
            style={{ '--rows': Math.ceil(features.length / 2) } as CSSProperties}
          >
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <Typography variant="paragraph-small">{feature}</Typography>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

/** The Safes left out are removed from the Workspace, not from the user's accounts. */
export default function ClaimTrialModal({
  spaceId,
  onBack,
  returnPathname,
  variant = 'existing',
}: {
  spaceId: string
  onBack: () => void
  /** Where Stripe sends the user back; defaults to the Workspace Home. */
  returnPathname?: string
  variant?: ClaimTrialVariant
}) {
  const { trialPlans, trialPeriodDays, isLoading } = useSpaceOffers(spaceId)
  const tiers = useMemo(() => claimTiers(trialPlans), [trialPlans])
  const { needsTrim, checkout, isBusy, error } = useSeatTrimCheckout(spaceId, returnPathname)
  const [pickedTierId, setPickedTierId] = useState<string>()
  const [step, setStep] = useState<'offer' | 'accounts'>('offer')

  const tier =
    tiers.find((candidate) => candidate.id === pickedTierId) ??
    tiers.find((candidate) => candidate.name === RECOMMENDED_PLAN) ??
    tiers[0]
  const option = tier?.options[0]
  const seats = option?.seats ?? null
  const copy = claimCopy(trialPeriodDays, variant)
  const availableUntil = trialPeriodDays === null ? null : formatDate(Date.now() + trialPeriodDays * DAY_MS)
  const entry = {
    [MixpanelEventParams.ENTRY_POINT]:
      variant === 'new' ? FreeAccessEntryPoint.CREATE_WORKSPACE : FreeAccessEntryPoint.WORKSPACE_LOGIN,
  }
  useTrackOnce(
    SAFE_PRO_EVENTS.FREE_ACCESS_OFFER_VIEWED,
    { ...entry, [MixpanelEventParams.FREE_ACCESS_LENGTH]: trialPeriodDays ?? undefined },
    !isLoading,
  )

  const claim = () => {
    if (!tier || !option?.paymentLinkId) return
    if (needsTrim(seats)) setStep('accounts')
    else void checkout(option.paymentLinkId)
  }

  const continueToCheckout = (removed: SafeRef[]) => {
    if (tier && option?.paymentLinkId) void checkout(option.paymentLinkId, removed)
  }

  return (
    <Dialog open onOpenChange={() => undefined}>
      <DialogContent size="sm-md" surface="card" padding="sm" showCloseButton={false}>
        <div className="flex flex-col gap-6 pt-5">
          {step === 'accounts' && tier && seats !== null ? (
            <SelectAccountsStep
              limit={seats}
              planName={tier.name}
              onBack={() => setStep('offer')}
              onContinue={continueToCheckout}
              isSubmitting={isBusy}
              error={error}
            />
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <Typography variant="h3" as={DialogTitle}>
                  {highlightSafePro(copy.title)}
                </Typography>
                <Typography color="muted" className="whitespace-pre-line">
                  {copy.subtitle}
                </Typography>
              </div>

              <Link
                href={SAFE_PRO_PRICING_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="muted"
                className="self-start"
              >
                {translateMessage('ui.compareAllFeatures_d346bd9e')}
                <ArrowUpRight />
              </Link>

              {isLoading ? (
                <Skeleton className="h-65 w-full rounded-lg-xl" data-testid="claim-trial-skeleton" />
              ) : tiers.length === 0 ? (
                <Alert variant="info">
                  <AlertSeverityIcon variant="info" />
                  <AlertDescription>{translateMessage('ui.thereIsNoFreeAccessAvailable_00943163')}</AlertDescription>
                </Alert>
              ) : (
                <div
                  role={tiers.length > 1 ? 'radiogroup' : undefined}
                  aria-label={tiers.length > 1 ? 'Plan' : undefined}
                  className="flex flex-col gap-4 md:flex-row"
                >
                  {tiers.map((candidate) => (
                    <TrialOfferCard
                      key={candidate.id}
                      tier={candidate}
                      availableUntil={availableUntil}
                      freeText={_freeLabel(trialPeriodDays, variant)}
                      selectable={tiers.length > 1}
                      selected={candidate.id === tier?.id}
                      onSelect={() => setPickedTierId(candidate.id)}
                    />
                  ))}
                </div>
              )}

              <Typography variant="paragraph-small" align="center" className="flex items-center justify-center gap-1.5">
                {copy.note}
                <InfoTip text={TRIAL_END_TOOLTIP} data-testid="trial-end-tooltip" />
              </Typography>

              {error && (
                <Alert variant="destructive">
                  <AlertSeverityIcon variant="destructive" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-4">
                <Track
                  {...SAFE_PRO_EVENTS.FREE_ACCESS_OFFER_DISMISSED}
                  mixpanelParams={{ ...entry, [MixpanelEventParams.DISMISS_ACTION]: DismissAction.GO_TO_MY_ACCOUNTS }}
                  as="div"
                  className="flex-1"
                >
                  <Button variant="secondary" size="lg" className="w-full" onClick={onBack} disabled={isBusy}>
                    {copy.back}
                  </Button>
                </Track>
                <Track
                  {...SAFE_PRO_EVENTS.FREE_ACCESS_CLAIM_CLICKED}
                  mixpanelParams={entry}
                  as="div"
                  className="flex-1"
                >
                  <Button
                    size="lg"
                    accentIcon
                    className="w-full"
                    disabled={!option?.paymentLinkId || isBusy}
                    onClick={claim}
                  >
                    {copy.claim}
                    <ArrowRight />
                  </Button>
                </Track>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
