import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { Button } from '@safe-global/views/components/ui/button'
import { Share2 as ShareIcon } from 'lucide-react'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import Track from '@/components/common/Track'
import { MESSAGE_EVENTS } from '@/services/analytics/events/txList'
import React from 'react'
import CopyTooltip from '@/components/common/CopyTooltip'
import useOrigin from '@/hooks/useOrigin'
import { withSpaceIdInUrl, useUrlSpaceId } from '@/hooks/useUrlSpaceId'

const MsgShareLink = ({ safeMessageHash, button }: { safeMessageHash: string; button?: boolean }): ReactElement => {
  const router = useRouter()
  const { safe = '' } = router.query
  const spaceId = useUrlSpaceId()
  const href = withSpaceIdInUrl(`${AppRoutes.transactions.msg}?safe=${safe}&messageHash=${safeMessageHash}`, spaceId)
  const txUrl = useOrigin() + href

  return (
    <Track {...MESSAGE_EVENTS.COPY_DEEPLINK}>
      <CopyTooltip text={txUrl} initialToolTipText={translateMessage('ui.copyTheMessageURL_bb1912b8')}>
        {button ? (
          <Button
            data-testid="share-btn"
            aria-label={translateMessage('ui.share_e5357e27')}
            size="sm"
            onClick={() => {}}
          >
            {translateMessage('ui.copyLink_30a49b26')}
          </Button>
        ) : (
          <Button
            data-testid="share-btn"
            aria-label={translateMessage('ui.share_e5357e27')}
            variant="ghost"
            size="icon-xs"
            // eslint-disable-next-line no-restricted-syntax -- circular hover on the icon button; no round icon size variant exists
            className="rounded-full"
          >
            <ShareIcon className="size-4 text-[var(--color-border-main)]" />
          </Button>
        )}
      </CopyTooltip>
    </Track>
  )
}

export default MsgShareLink
