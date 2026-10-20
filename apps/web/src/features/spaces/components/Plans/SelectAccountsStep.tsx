import { translateMessage } from '@/i18n'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ArrowRight } from 'lucide-react'
import { Alert, AlertDescription, AlertSeverityIcon, AlertTitle } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'
import { DialogTitle } from '@safe-global/views/components/ui/dialog'
import { highlightSafePro } from '@safe-global/views/components/common/ProHighlight'
import { ScrollArea } from '@safe-global/views/components/ui/scroll-area'
import { SearchInput } from '@safe-global/views/components/ui/search-input'
import { Typography } from '@safe-global/views/components/ui/typography'
import { SafeAccountsTable, type SafeAccountColumnId } from '@/features/myAccounts'
import { isMultiChainSafeItem, useSafesSearch, type AllSafeItems, type SafeItem } from '@/hooks/safes'
import Track from '@/components/common/Track'
import { useTrackOnce } from '@/services/analytics/useTrackOnce'
import { SAFE_PRO_EVENTS } from '@/services/analytics/events/safe-pro'
import { MixpanelEventParams } from '@/services/analytics/mixpanel-events'
import type { SafeRef } from '@safe-global/views/features/spaces/components/Plans/types'
import {
  removedSafesNote,
  summarizeRemovedSafes,
} from '@safe-global/views/features/spaces/components/Plans/removedSafes'
import type { AddAccountsFormValues } from '../../hooks/addAccounts.types'
import { useSpaceSafes } from '../../hooks/useSpaceSafes'
import SelectedCounter from '@safe-global/views/features/spaces/components/SelectedCounter'
import useOnboardingSelection from '../SelectSafesOnboarding/hooks/useOnboardingSelection'
import {
  getMultiChainSafeId,
  getSafeId,
} from '@safe-global/views/features/spaces/components/SelectSafesOnboarding/utils/safeIds'

const COLUMNS: SafeAccountColumnId[] = ['name', 'networks', 'balance']
const NO_FLAGGED = new Set<string>()

const leavesOf = (items: AllSafeItems): SafeItem[] =>
  items.flatMap((item) => (isMultiChainSafeItem(item) ? item.safes : [item]))

/** Every Safe starts selected (multi-chain parents included); the user deselects down to the plan's seats. */
export const _initialSelection = (items: AllSafeItems): Record<string, boolean> => {
  const selected: Record<string, boolean> = {}
  for (const item of items) {
    if (isMultiChainSafeItem(item)) {
      selected[getMultiChainSafeId(item)] = true
      for (const safe of item.safes) selected[getSafeId(safe)] = true
    } else {
      selected[getSafeId(item)] = true
    }
  }
  return selected
}

export const seatsTooltip = (planName: string, limit: number): string =>
  translateMessage('ui.coversAccountsAccountsYouLeaveOut_e087a006', { p0: planName, p1: limit })

/** Trims the Workspace to the plan's seats before the plan is taken; the Safes deselected are removed from it. */
export default function SelectAccountsStep({
  limit,
  planName,
  continueLabel = translateMessage('ui.continueToCheckout_15a42e7c'),
  onBack,
  onContinue,
  isSubmitting,
  error,
}: {
  limit: number
  planName: string
  /** Names where the step leads: Stripe for a new plan, the change summary for a live one. */
  continueLabel?: string
  onBack: () => void
  onContinue: (removed: SafeRef[]) => void
  isSubmitting?: boolean
  error?: string
}) {
  const { allSafes, isLoading } = useSpaceSafes()
  const [query, setQuery] = useState('')
  const filtered = useSafesSearch(allSafes, query.trim())
  const items = query.trim() ? filtered : allSafes
  const { control, setValue } = useForm<AddAccountsFormValues>({
    defaultValues: { selectedSafes: _initialSelection(allSafes) },
  })
  const { selectedKeys, seatCount, isAtLimit, isOverLimit, handleToggle } = useOnboardingSelection({
    items: allSafes,
    control,
    setValue,
    flaggedAddresses: NO_FLAGGED,
    limit,
  })
  const leaves = useMemo(() => leavesOf(allSafes), [allSafes])
  const removed = useMemo(() => leaves.filter((safe) => !selectedKeys.has(getSafeId(safe))), [leaves, selectedKeys])
  const removedNote = removedSafesNote(summarizeRemovedSafes(leaves, removed))
  useTrackOnce(
    SAFE_PRO_EVENTS.SAFE_ACCOUNT_SELECTION_VIEWED,
    { [MixpanelEventParams.ACCOUNTS_AVAILABLE]: seatCount, [MixpanelEventParams.PLAN_LIMIT]: limit },
    !isLoading,
  )

  return (
    <>
      <Typography variant="h3" as={DialogTitle}>
        {highlightSafePro(translateMessage('ui.selectAccountsForYourPlan_f4444531'))}
      </Typography>

      <Alert variant="info">
        <AlertSeverityIcon variant="info" />
        <AlertTitle className="font-semibold">
          {planName} {translateMessage('ui.covers_ed37bc23')}
          {limit} {translateMessage('ui.accounts_99ed98fd')}
        </AlertTitle>
        <AlertDescription>
          {translateMessage('ui.at_0cae37db')}
          {limit}
          {translateMessage('ui.deselectOneToAddAnotherSafe_c6bfd600')}
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Amber only while the selection still exceeds the plan; sitting exactly at the cap is the goal. */}
          <SelectedCounter
            count={seatCount}
            limit={limit}
            isAtLimit={isOverLimit}
            tooltip={seatsTooltip(planName, limit)}
          />
          <SearchInput
            className="flex-1"
            placeholder={translateMessage('ui.byNameAddressOrNetwork_5c37a5de')}
            aria-label={translateMessage('ui.searchList_41181693')}
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="h-91">
          {!isLoading && items.length === 0 ? (
            <Typography align="center" color="muted" className="py-8">
              {translateMessage('ui.noAccountsMatchYourSearch_aefae7ae')}
            </Typography>
          ) : (
            <SafeAccountsTable
              items={items}
              columns={COLUMNS}
              embedded
              selection={{ selectedKeys, onToggle: handleToggle, isAtLimit }}
              data-testid="plan-safes-table"
            />
          )}
        </ScrollArea>
      </div>

      {isOverLimit ? (
        <Alert variant="warning">
          <AlertSeverityIcon variant="warning" />
          <AlertDescription>
            {translateMessage('ui.deselect_81c565f2')}
            {seatCount - limit === 1
              ? translateMessage('ui.account_d7ff14c1')
              : translateMessage('ui.accounts_823b9dbc', { p0: seatCount - limit })}{' '}
            {translateMessage('ui.toFitThePlan_792bec40')}
          </AlertDescription>
        </Alert>
      ) : (
        removedNote && (
          <Alert variant="warning">
            <AlertSeverityIcon variant="warning" />
            <AlertDescription>{removedNote}</AlertDescription>
          </Alert>
        )
      )}

      {error && (
        <Alert variant="destructive">
          <AlertSeverityIcon variant="destructive" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-5">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onBack} disabled={isSubmitting}>
          {translateMessage('ui.back_dae8bf43')}
        </Button>
        <Track
          {...SAFE_PRO_EVENTS.SAFE_ACCOUNT_SELECTION_SUBMITTED}
          mixpanelParams={{
            [MixpanelEventParams.SELECTED_COUNT]: seatCount,
            [MixpanelEventParams.DESELECTED_COUNT]: removed.length,
            [MixpanelEventParams.PLAN_LIMIT]: limit,
          }}
          as="div"
          className="flex-1"
        >
          <Button
            size="lg"
            accentIcon
            className="w-full"
            disabled={selectedKeys.size === 0 || isOverLimit || isSubmitting}
            onClick={() => onContinue(removed.map(({ chainId, address }) => ({ chainId, address })))}
          >
            {continueLabel}
            <ArrowRight />
          </Button>
        </Track>
      </div>
    </>
  )
}
