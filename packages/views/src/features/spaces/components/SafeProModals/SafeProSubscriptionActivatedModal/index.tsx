import { translateMessage } from '@safe-global/views/i18n'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@safe-global/views/components/ui/badge'
import { Button } from '@safe-global/views/components/ui/button'
import { DialogTitle } from '@safe-global/views/components/ui/dialog'
import { Typography } from '@safe-global/views/components/ui/typography'
import SafeProModalFrame from '../SafeProModalFrame'
import { ProHighlight } from '@safe-global/views/components/common/ProHighlight'

const SafeProSubscriptionActivatedModal = ({
  open,
  onOpenChange,
  planName,
  seatsLabel,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  planName: string
  /** "5 Safe accounts": the seats the plan covers, shown as a chip under the title when known. */
  seatsLabel?: string
}) => (
  <SafeProModalFrame open={open} onOpenChange={onOpenChange}>
    <div className="flex flex-col items-center gap-4">
      <Typography variant="h4" as={DialogTitle}>
        {translateMessage('ui.yourPaidSubscriptionIsActiveYou_d13f5bd6')}
        <ProHighlight>{planName}</ProHighlight>!
      </Typography>
      {seatsLabel && (
        <Badge variant="secondary" shape="tag" data-testid="subscription-seats">
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

export default SafeProSubscriptionActivatedModal
