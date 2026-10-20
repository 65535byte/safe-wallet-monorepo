import { translateMessage } from '@safe-global/views/i18n'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import WarningIcon from '@safe-global/views/assets/images/notifications/warning.svg'

const MaliciousTxWarning = ({ withTooltip = true }: { withTooltip?: boolean }) => {
  const icon = (
    <div className="leading-4">
      <WarningIcon className="size-4 text-[var(--color-warning-main)]" />
    </div>
  )

  return withTooltip ? (
    <Tooltip>
      <TooltipTrigger render={icon} />
      <TooltipContent>{translateMessage('ui.thisTokenIsnTVerifiedOn_a6fce00c')}</TooltipContent>
    </Tooltip>
  ) : (
    icon
  )
}

export default MaliciousTxWarning
