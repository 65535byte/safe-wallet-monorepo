import { translateMessage } from '@/i18n'
import FiatValue from '@/components/common/FiatValue'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import type { Balance } from '@safe-global/store/gateway/AUTO_GENERATED/balances'

export const FiatBalance = ({ balanceItem }: { balanceItem: Balance }) => {
  const isMissingFiatConversion = balanceItem.fiatConversion === '0' && balanceItem.fiatBalance === '0'

  return (
    <div className="flex flex-row items-center justify-end gap-1">
      <FiatValue value={isMissingFiatConversion ? null : balanceItem.fiatBalance} precise />

      {isMissingFiatConversion && (
        <Tooltip>
          <TooltipTrigger
            render={
              <span>
                <InfoIcon className="size-4 text-[var(--color-error-main)]" />
              </span>
            }
          />
          <TooltipContent>{translateMessage('ui.providedValuesAreIndicativeAndWe_3ad667ef')}</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
