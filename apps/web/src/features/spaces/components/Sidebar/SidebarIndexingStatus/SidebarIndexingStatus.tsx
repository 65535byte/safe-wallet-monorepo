import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { getDateLocale } from '@/i18n/date'
import { useChainsGetIndexingStatusV1Query } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import useChainId from '@/hooks/useChainId'
import { STATUS_PAGE_URL } from '@/config/constants'
import { Tooltip, TooltipTrigger, TooltipContent } from '@safe-global/views/components/ui/tooltip'
import StatusIcon from '@/public/images/sidebar/status.svg'
import css from './styles.module.css'

const MAX_SYNC_DELAY = 1000 * 60 * 5
const POLL_INTERVAL = 1000 * 60

type Status = 'synced' | 'slow' | 'outOfSync'

const STATUS_LABEL: Record<Status, string> = {
  synced: 'Synced',
  slow: translateMessage('ui.networkDelays_78171c7d'),
  outOfSync: translateMessage('ui.outOfSync_e2feef76'),
}

const getStatus = (synced: boolean, lastSync: number): Status => {
  if (synced) return 'synced'
  if (Date.now() - lastSync > MAX_SYNC_DELAY) return 'slow'
  return 'outOfSync'
}

export const SidebarIndexingStatus = ({ isSafeSidebar = true }: { isSafeSidebar?: boolean }): ReactElement | null => {
  const chainId = useChainId()
  const { data, isLoading, isError } = useChainsGetIndexingStatusV1Query(
    { chainId },
    { pollingInterval: POLL_INTERVAL, skipPollingIfUnfocused: true },
  )

  if (isLoading || isError || !data) {
    return null
  }

  const status = getStatus(data.synced, data.lastSync)
  const time = formatDistanceToNow(data.lastSync, { addSuffix: true, locale: getDateLocale() })
  const tooltipText = isSafeSidebar
    ? translateMessage('ui.lastSyncedWithTheBlockchain_f5f369fe', { p0: time })
    : translateMessage('ui.blockchainSyncStatusAcrossNetworks_24307a1c')

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <a
            href={STATUS_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={css.indexingStatusButton}
            data-testid="index-status"
            data-status={status}
            aria-label={translateMessage('ui.indexingStatus_3ab657c9', { p0: STATUS_LABEL[status] })}
          />
        }
      >
        <StatusIcon className={css.indexingStatusIcon} />
      </TooltipTrigger>
      <TooltipContent side="top">{tooltipText}</TooltipContent>
    </Tooltip>
  )
}
