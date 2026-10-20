import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@safe-global/views/components/ui/accordion'
import { Chip } from '@safe-global/views/components/ui/chip'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Typography } from '@safe-global/views/components/ui/typography'
import PendingDelegation from './PendingDelegation'
import DelegationErrorBoundary from './DelegationErrorBoundary'
import { usePendingDelegations } from '../hooks/usePendingDelegations'

function PendingDelegationsList(): ReactElement | null {
  const { pendingDelegations, isLoading, refetch } = usePendingDelegations()

  if (isLoading || pendingDelegations.length === 0) return null

  return (
    <div className="mb-4">
      <DelegationErrorBoundary
        fallbackMessage={translateMessage('ui.failedToLoadPendingDelegations_9cf4a3f5')}
        onRetry={refetch}
      >
        <Accordion
          defaultValue={['pending-delegations']}
          className="rounded-md border border-[var(--color-border-light)] bg-[var(--color-background-paper)]"
        >
          <AccordionItem value="pending-delegations" className="border-b-0">
            <AccordionTrigger className="px-4">
              <div className="flex items-center gap-2">
                <Typography variant="paragraph-small-bold">
                  {translateMessage('ui.pendingConfirmations_cd10eb51')}
                </Typography>
                <Chip variant="warning" size="sm" className="font-bold tracking-[1px]">
                  {pendingDelegations.length > 19 ? '19+' : pendingDelegations.length}
                </Chip>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-0">
              {pendingDelegations.map((delegation, index) => (
                <div key={delegation.messageHash}>
                  <DelegationErrorBoundary fallbackMessage={translateMessage('ui.failedToLoadThisDelegation_7f2fdaca')}>
                    <PendingDelegation delegation={delegation} onRefetch={refetch} />
                  </DelegationErrorBoundary>
                  {index < pendingDelegations.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DelegationErrorBoundary>
    </div>
  )
}

export default PendingDelegationsList
