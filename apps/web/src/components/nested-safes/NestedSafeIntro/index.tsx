import { translateMessage } from '@/i18n'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import type { ReactElement } from 'react'

import NestedSafesIllustration from '@safe-global/views/assets/images/sidebar/nested-safes.svg'
import Track from '@/components/common/Track'
import { NESTED_SAFE_EVENTS, NESTED_SAFE_LABELS } from '@/services/analytics/events/nested-safes'

interface NestedSafeIntroProps {
  onReviewClick: () => void
}

export function NestedSafeIntro({ onReviewClick }: NestedSafeIntroProps): ReactElement {
  return (
    <div className="flex flex-col items-center text-center">
      <NestedSafesIllustration />

      <Typography variant="h4" className="mt-4">
        {translateMessage('ui.selectNestedAccounts_0aa55eb2')}
      </Typography>

      <Typography variant="paragraph-small" color="muted" className="block mt-2">
        {translateMessage('ui.nestedAccountsCanIncludeLookalikeAddresses_53609866')}
      </Typography>

      <Typography variant="paragraph-small" color="muted" className="block mt-2">
        {translateMessage('ui.reviewAndSelectTheOnesYou_1bad1be0')}
      </Typography>

      <Track {...NESTED_SAFE_EVENTS.REVIEW_NESTED_SAFES} label={NESTED_SAFE_LABELS.first_time}>
        <Button className="mt-6 w-full" onClick={onReviewClick} data-testid="review-nested-safes-button">
          {translateMessage('ui.reviewNestedAccounts_9b3a1f19')}
        </Button>
      </Track>
    </div>
  )
}
