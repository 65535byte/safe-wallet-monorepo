import { translateMessage } from '@safe-global/views/i18n'
import NextLink from 'next/link'
import type { LinkProps } from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@safe-global/views/components/ui/button'
import { DialogTitle } from '@safe-global/views/components/ui/dialog'
import { Typography } from '@safe-global/views/components/ui/typography'
import { formatDate } from '@safe-global/utils/utils/date'
import SafeProModalFrame from '../SafeProModalFrame'

const SafeProTrialActivatedModal = ({
  open,
  onOpenChange,
  trialEndsAt,
  ctaHref,
  ctaLabel = translateMessage('ui.getStarted_5801751d'),
  hasPaymentMethod = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Null when neither the subscription nor the plan knows its period end yet. */
  trialEndsAt: number | null
  /** Where the CTA leads; without it the CTA just closes. */
  ctaHref?: LinkProps['href']
  ctaLabel?: string
  /** Checkout already took a payment method, so the subscription starts on its own. */
  hasPaymentMethod?: boolean
}) => (
  <SafeProModalFrame open={open} onOpenChange={onOpenChange}>
    <div className="flex flex-col gap-3">
      <Typography variant="h4" as={DialogTitle}>
        {translateMessage('ui.yourFreeAccessIsActive_11071303')}
        {trialEndsAt !== null ? translateMessage('ui.until_045d6239', { p0: formatDate(trialEndsAt) }) : ''}
      </Typography>
      <Typography variant="paragraph-small" color="muted">
        {hasPaymentMethod
          ? translateMessage('ui.allProFeaturesAreUnlockedFor_13aafa05')
          : translateMessage('ui.allFeaturesAreUnlockedForYour_f0ba883a')}
      </Typography>
    </div>

    <div className="flex flex-col items-center gap-3">
      <Button
        accentIcon
        className="min-w-64"
        render={ctaHref ? <NextLink href={ctaHref} /> : undefined}
        onClick={() => onOpenChange(false)}
      >
        {ctaLabel}
        <ArrowRight data-icon="inline-end" />
      </Button>
    </div>
  </SafeProModalFrame>
)

export default SafeProTrialActivatedModal
