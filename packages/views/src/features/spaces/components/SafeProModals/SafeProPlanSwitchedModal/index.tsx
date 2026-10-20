import { translateMessage } from '@safe-global/views/i18n'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@safe-global/views/components/ui/badge'
import { Button } from '@safe-global/views/components/ui/button'
import { DialogTitle } from '@safe-global/views/components/ui/dialog'
import { Typography } from '@safe-global/views/components/ui/typography'
import { formatDate } from '@safe-global/utils/utils/date'
import SafeProModalFrame from '../SafeProModalFrame'
import { ProHighlight } from '@safe-global/views/components/common/ProHighlight'

/** Confirms a plan switched during the free access: nothing changes until it ends, then the new price applies. */
const SafeProPlanSwitchedModal = ({
  open,
  onOpenChange,
  planName,
  trialEndsAt,
  price,
  seatsLabel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName: string
  trialEndsAt: number | null
  /** Already formatted, e.g. "€189/mo". */
  price: string
  /** "5 Safe accounts": the seats the plan covers, shown as a chip under the title when known. */
  seatsLabel?: string
}) => (
  <SafeProModalFrame open={open} onOpenChange={onOpenChange}>
    <div className="flex flex-col items-center gap-3">
      <Typography variant="h4" as={DialogTitle}>
        {translateMessage('ui.youReOn_187340cd')}
        <ProHighlight>{planName}</ProHighlight>!
      </Typography>
      <Typography variant="paragraph-small" color="muted">
        {translateMessage('ui.yourFreeAccessContinues_b82978c3')}
        {trialEndsAt !== null ? translateMessage('ui.until_045d6239', { p0: formatDate(trialEndsAt) }) : ''}
        {translateMessage('ui.afterThatYouLlPay_b1c5e4a4')}
        {price}.
      </Typography>
      {seatsLabel && (
        <Badge variant="secondary" shape="tag" className="mt-1" data-testid="subscription-seats">
          {planName} · {seatsLabel}
        </Badge>
      )}
    </div>

    <Button accentIcon className="mt-2 min-w-64" onClick={() => onOpenChange(false)}>
      {translateMessage('ui.getStarted_5801751d')}
      <ArrowRight data-icon="inline-end" />
    </Button>
  </SafeProModalFrame>
)

export default SafeProPlanSwitchedModal
