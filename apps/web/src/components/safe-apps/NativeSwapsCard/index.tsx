import { translateMessage } from '@/i18n'
import SafeAppIconCard from '@safe-global/views/components/safe-apps/SafeAppIconCard'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Button } from '@safe-global/views/components/ui/button'
import { Card } from '@safe-global/views/components/ui/card'
import { SWAP_EVENTS, SWAP_LABELS } from '@/services/analytics/events/swaps'
import Track from '@/components/common/Track'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'
import { useSafeLinkQuery } from '@/hooks/useSafeLinkQuery'

type NativeSwapsCardProps = {
  onDismiss: () => void
}

const NativeSwapsCard = ({ onDismiss }: NativeSwapsCardProps) => {
  const safeLinkQuery = useSafeLinkQuery()

  return (
    // eslint-disable-next-line no-restricted-syntax -- h-full fills the dashboard grid cell (layout); the hover tint is a bespoke affordance with no variant
    <Card size="none" className="h-full transition-colors">
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        <div className="rounded-full bg-[var(--color-secondary-light)] p-2">
          <SafeAppIconCard
            src="/images/common/swap.svg"
            alt={translateMessage('ui.swapIcon_5adcac87')}
            width={24}
            height={24}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        <Typography variant="paragraph-bold" className="mb-2 truncate">
          {translateMessage('ui.nativeSwapsAreHere_4d43653a')}
        </Typography>

        <Typography variant="paragraph-small" className="block mb-4 line-clamp-3 text-[var(--color-text-secondary)]">
          {translateMessage('ui.experienceSeamlessTradingWithBetterDecoding_a4dae902')}
        </Typography>

        <div className="mt-auto flex flex-row flex-wrap justify-end gap-2 pt-2">
          <Button onClick={onDismiss} size="sm" variant="ghost" className="mr-auto">
            {translateMessage('ui.donTShow_93b3215f')}
          </Button>
          <Track {...SWAP_EVENTS.OPEN_SWAPS} label={SWAP_LABELS.safeAppsPromoWidget}>
            <Button size="sm" render={<Link href={{ pathname: AppRoutes.swap, query: safeLinkQuery }} />}>
              {translateMessage('ui.tryNow_ef18cc57')}
            </Button>
          </Track>
        </div>
      </div>
    </Card>
  )
}

export default NativeSwapsCard
