import { translateMessage } from '@safe-global/views/i18n'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import type { ReactElement } from 'react'
import WarningIcon from '@safe-global/views/assets/images/notifications/warning.svg'

/**
 * Warning chip displayed on addresses that have been flagged for similarity
 * to other addresses in the list (potential address poisoning attack)
 */
export function SimilarityWarning(): ReactElement {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="ml-2 inline-flex shrink-0">
            <WarningIcon className="size-5 text-[var(--color-error-main)]" data-testid="similarity-warning" />
          </span>
        }
      />
      <TooltipContent>{translateMessage('ui.thisAddressLooksSimilarToAnother_5f87f310')}</TooltipContent>
    </Tooltip>
  )
}
