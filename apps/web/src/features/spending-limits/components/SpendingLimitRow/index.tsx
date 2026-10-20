import { translateMessage } from '@/i18n'
import { RadioGroup, RadioGroupItem } from '@safe-global/views/components/ui/radio-group'
import { Label } from '@safe-global/views/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { cn } from '@safe-global/views/utils/cn'
import { Controller, useFormContext } from 'react-hook-form'
import classNames from 'classnames'
import { safeFormatUnits } from '@safe-global/utils/utils/formatters'
import { type Balance } from '@safe-global/store/gateway/AUTO_GENERATED/balances'

import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'

import css from './styles.module.css'
import { TokenAmountFields } from '@safe-global/views/components/tx-flow/flows/TokenTransfer/types'
import { useContext, useEffect } from 'react'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { useHasPermission } from '@/permissions/hooks/useHasPermission'
import { Permission } from '@/permissions/config'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import { TokenTransferType, MultiTransfersFields } from '@/components/tx-flow/flows/TokenTransfer'

const SpendingLimitRow = ({
  availableAmount,
  selectedToken,
}: {
  availableAmount: bigint
  selectedToken: Balance['tokenInfo'] | undefined
}) => {
  const { control, trigger, resetField } = useFormContext()
  const canCreateStandardTx = useHasPermission(Permission.CreateTransaction)
  const canCreateSpendingLimitTx = useHasPermission(Permission.CreateSpendingLimitTransaction, {
    tokenAddress: selectedToken?.address,
  })
  const { setNonceNeeded } = useContext(SafeTxContext)

  const formattedAmount = safeFormatUnits(availableAmount, selectedToken?.decimals)

  useEffect(() => {
    return () => {
      // reset the field value to default when the component is unmounted
      resetField(MultiTransfersFields.type)
    }
  }, [resetField])

  return (
    <div className="flex flex-col">
      <Label className="mb-1">{translateMessage('ui.sendAs_2ec40bf0')}</Label>
      <Controller
        rules={{ required: true }}
        control={control}
        name={MultiTransfersFields.type}
        render={({ field: { onChange, value } }) => (
          <RadioGroup
            value={value}
            onValueChange={(newValue) => {
              onChange(newValue)

              setNonceNeeded(newValue === TokenTransferType.multiSig)

              // Validate only after the field is changed
              setTimeout(() => {
                trigger(TokenAmountFields.amount)
              }, 10)
            }}
            defaultValue={TokenTransferType.multiSig}
            className={cn('flex gap-0', css.group)}
          >
            {canCreateStandardTx && (
              <Label data-testid="standard-tx" className={`${css.label} flex items-center gap-2 text-sm font-normal`}>
                <RadioGroupItem value={TokenTransferType.multiSig} />
                {translateMessage('ui.standardTransaction_0241f11e')}
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span className="inline-flex items-center">
                        <InfoIcon className="text-[var(--color-border-main)] ml-1 size-4 shrink-0" />
                      </span>
                    }
                  />
                  <TooltipContent>
                    {translateMessage('ui.aStandardTransactionRequiresTheSignatures_c246510e')}
                    <ExternalLink
                      href={HelpCenterArticle.SPENDING_LIMITS}
                      title={translateMessage('ui.learnMoreAboutSpendingLimits_f51b7cae')}
                    >
                      {translateMessage('ui.learnMoreAboutSpendingLimits_f51b7cae')}
                    </ExternalLink>
                    .
                  </TooltipContent>
                </Tooltip>
              </Label>
            )}
            {canCreateSpendingLimitTx && (
              <Label
                data-testid="spending-limit-tx"
                className={classNames(`${css.label} flex items-center gap-2 text-sm font-normal`, {
                  [css.spendingLimit]: canCreateStandardTx,
                })}
              >
                <RadioGroupItem value={TokenTransferType.spendingLimit} />
                {translateMessage('ui.spendingLimit_6465c751')}
                <b>{`(${formattedAmount} ${selectedToken?.symbol})`}</b>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span className="inline-flex items-center">
                        <InfoIcon className="text-[var(--color-border-main)] ml-1 size-4 shrink-0" />
                      </span>
                    }
                  />
                  <TooltipContent>
                    {translateMessage('ui.aSpendingLimitTransactionAllowsYou_1c2d7952')}
                    <ExternalLink
                      href={HelpCenterArticle.SPENDING_LIMITS}
                      title={translateMessage('ui.learnMoreAboutSpendingLimits_f51b7cae')}
                    >
                      {translateMessage('ui.learnMoreAboutSpendingLimits_f51b7cae')}
                    </ExternalLink>
                    .
                  </TooltipContent>
                </Tooltip>
              </Label>
            )}
          </RadioGroup>
        )}
      />
    </div>
  )
}

export default SpendingLimitRow
