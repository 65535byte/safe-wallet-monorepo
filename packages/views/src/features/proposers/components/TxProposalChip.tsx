import { translateMessage } from '@safe-global/views/i18n'
import { Badge } from '@safe-global/views/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'

const TxProposalChip = () => {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span tabIndex={0}>
            <Badge variant="subtle">
              <InfoIcon className="size-3" />
              <span data-testid="proposal-status">{translateMessage('ui.proposal_5082b127')}</span>
            </Badge>
          </span>
        }
      />
      <TooltipContent>{translateMessage('ui.thisTransactionWasCreatedByA_af33fad6')}</TooltipContent>
    </Tooltip>
  )
}

export default TxProposalChip
