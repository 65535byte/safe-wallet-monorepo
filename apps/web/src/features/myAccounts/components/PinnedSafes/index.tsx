import { translateMessage } from '@/i18n'
import SafesList from '../SafesList'
import type { AllSafeItems } from '@/hooks/safes'
import css from '../../styles.module.css'
import BookmarkIcon from '@/public/images/apps/bookmark.svg'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useMemo } from 'react'

interface PinnedSafesProps {
  allSafes: AllSafeItems
  onLinkClick?: () => void
  onOpenSelectionModal?: () => void
}

const PinnedSafes = ({ allSafes, onLinkClick, onOpenSelectionModal }: PinnedSafesProps) => {
  const pinnedSafes = useMemo<AllSafeItems>(() => [...(allSafes?.filter(({ isPinned }) => isPinned) ?? [])], [allSafes])

  // Don't render anything if there are no pinned safes
  if (pinnedSafes.length === 0) {
    return null
  }

  return (
    <div data-testid="pinned-accounts" className="mb-4">
      <div className={css.listHeader}>
        <BookmarkIcon className="mt-0.5 mr-2 size-5 [stroke-width:2]" />
        <Typography variant="h4" className="mb-4">
          {translateMessage('ui.myAccounts_837c511d')}
        </Typography>
      </div>
      <SafesList safes={pinnedSafes} onLinkClick={onLinkClick} />
      {onOpenSelectionModal && (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" size="sm" onClick={onOpenSelectionModal} data-testid="add-more-safes-button">
            {translateMessage('ui.manageList_5be941e5')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default PinnedSafes
