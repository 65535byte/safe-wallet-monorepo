import { translateMessage } from '@/i18n'
import SafesList from '../SafesList'
import { type AllSafeItems, useSafesSearch } from '@/hooks/safes'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import { trackEvent } from '@/services/analytics'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useEffect } from 'react'

const FilteredSafes = ({
  searchQuery,
  allSafes,
  onLinkClick,
}: {
  searchQuery: string
  allSafes: AllSafeItems
  onLinkClick?: () => void
}) => {
  const filteredSafes = useSafesSearch(allSafes ?? [], searchQuery)

  useEffect(() => {
    if (searchQuery) {
      trackEvent({ category: OVERVIEW_EVENTS.SEARCH.category, action: OVERVIEW_EVENTS.SEARCH.action })
    }
  }, [searchQuery])

  return (
    <>
      <Typography variant="paragraph" color="muted" className="mb-4">
        {translateMessage('ui.found_9874f24d')}
        {filteredSafes.length} {translateMessage('ui.result_21bddc08')}
      </Typography>
      <div className="mt-2">
        <SafesList safes={filteredSafes} onLinkClick={onLinkClick} />
      </div>
    </>
  )
}

export default FilteredSafes
