import { translateMessage } from '@/i18n'
import { selectUndeployedSafe } from '../../store/undeployedSafesSlice'
import useSafeInfo from '@/hooks/useSafeInfo'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import { useAppSelector } from '@/store'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Button } from '@safe-global/views/components/ui/button'
import { cn } from '@safe-global/views/utils/cn'
import { RotateCw } from 'lucide-react'
import type { ComponentProps } from 'react'

export const LoopIcon = ({ className, ...props }: ComponentProps<'svg'>) => {
  return <RotateCw className={cn('animate-spin', className)} {...props} />
}

const CounterfactualStatusButton = () => {
  const { safe, safeAddress } = useSafeInfo()
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, safe.chainId, safeAddress))

  if (safe.deployed) return null

  const isActivating = undeployedSafe?.status.status !== 'AWAITING_EXECUTION'

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            data-testid="pending-activation-icon"
            variant="ghost"
            size="icon-sm"
            className={cn(
              // eslint-disable-next-line no-restricted-syntax -- faithful css-module port of .statusButton (radius/padding/bg + layout), pixel-identical; bespoke values have no variant
              'ml-auto [justify-self:flex-end] rounded-[4px] p-[6px] bg-[var(--color-warning-background)]',
              // eslint-disable-next-line no-restricted-syntax -- faithful css-module port of .statusButton.processing (bg override), pixel-identical
              isActivating && 'bg-[var(--color-info-background)]',
              isActivating ? 'text-[var(--color-info-main)]' : 'text-[var(--color-warning-main)]',
            )}
          />
        }
      >
        {isActivating ? <LoopIcon /> : <InfoIcon />}
      </TooltipTrigger>
      <TooltipContent side="right">
        {isActivating
          ? translateMessage('ui.accountIsBeingActivated_786ec996')
          : translateMessage('ui.accountIsNotActivated_47f4716a')}
      </TooltipContent>
    </Tooltip>
  )
}

export default CounterfactualStatusButton
