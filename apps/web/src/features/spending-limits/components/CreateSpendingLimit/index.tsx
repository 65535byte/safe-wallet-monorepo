import { translateMessage } from '@/i18n'
import { useCallback, useContext, useEffect, useMemo } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Label } from '@safe-global/views/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@safe-global/views/components/ui/select'

import AddressBookInput from '@/components/common/AddressBookInput'
import { useSafeShieldForAddressPoisoning } from '@/features/safe-shield/SafeShieldContext'
import useChainId from '@/hooks/useChainId'
import { getResetTimeOptions } from '../../constants'
import { useVisibleBalances } from '@/hooks/useVisibleBalances'
import TxCard, { TxCardActions } from '@safe-global/views/components/tx-flow/common/TxCard'
import TokenAmountInput from '@/components/common/TokenAmountInput'
import { validateAmount, validateDecimalLength } from '@safe-global/utils/utils/validation'
import { TxFlowContext, type TxFlowContextType } from '@/components/tx-flow/TxFlowProvider'
import { SpendingLimitFields, type NewSpendingLimitFlowProps } from '../../types'
import useIsSpendingLimitSupported from '../../hooks/useIsSpendingLimitSupported'
import SpendingLimitNotSupported from './SpendingLimitNotSupported'
import { validateSpendingLimitAmount } from '../../services/spendingLimitValidation'

const CreateSpendingLimit = () => {
  const chainId = useChainId()
  const isSupported = useIsSpendingLimitSupported()
  const { balances } = useVisibleBalances()
  const { onNext, data } = useContext<TxFlowContextType<NewSpendingLimitFlowProps>>(TxFlowContext)

  const resetTimeOptions = useMemo(() => getResetTimeOptions(chainId), [chainId])

  const formMethods = useForm<NewSpendingLimitFlowProps>({
    defaultValues: data,
    mode: 'onChange',
  })

  const { handleSubmit, watch, control, formState, getValues, trigger } = formMethods

  const tokenAddress = watch(SpendingLimitFields.tokenAddress)
  const beneficiary = watch(SpendingLimitFields.beneficiary)

  // Copilot address-poisoning check for the beneficiary
  useSafeShieldForAddressPoisoning([beneficiary])
  const selectedToken = tokenAddress
    ? balances.items.find((item) => item.tokenInfo.address === tokenAddress)
    : undefined

  const tokenDecimals = selectedToken?.tokenInfo.decimals

  const validateSpendingLimit = useCallback(
    (value: string) =>
      validateAmount(value) ||
      validateDecimalLength(value, tokenDecimals) ||
      validateSpendingLimitAmount(value, tokenDecimals),
    [tokenDecimals],
  )

  // react-hook-form only evaluates `isValid` on mount, so a prefilled amount must be re-checked
  // once the selected token (and therefore its decimals) becomes known or is lost.
  useEffect(() => {
    if (getValues(SpendingLimitFields.amount)) {
      trigger(SpendingLimitFields.amount)
    }
  }, [tokenDecimals, getValues, trigger])

  if (!isSupported) {
    return <SpendingLimitNotSupported />
  }

  return (
    <TxCard>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onNext)}>
          <div className="mb-6 w-full">
            <AddressBookInput
              data-testid="beneficiary-section"
              name={SpendingLimitFields.beneficiary}
              label={translateMessage('ui.beneficiary_cb21d4c7')}
            />
          </div>

          <TokenAmountInput balances={balances.items} selectedToken={selectedToken} validate={validateSpendingLimit} />

          <Typography variant="h4" className="mt-6 font-bold">
            {translateMessage('ui.resetTimer_8d4cf440')}
          </Typography>
          <Typography>{translateMessage('ui.setAResetTimeSoThe_b04a3631')}</Typography>
          <div className="mt-2 flex items-center justify-start gap-2">
            <Label>{translateMessage('ui.timePeriod_7d883096')}</Label>
            <Controller
              rules={{ required: true }}
              control={control}
              name={SpendingLimitFields.resetTime}
              render={({ field }) => (
                <Select items={resetTimeOptions} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger data-testid="time-period-section" className="font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {resetTimeOptions.map((resetTime) => (
                      <SelectItem data-testid="time-period-item" key={resetTime.value} value={resetTime.value}>
                        {resetTime.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <TxCardActions>
            <Button data-testid="next-btn" type="submit" disabled={!formState.isValid}>
              {translateMessage('ui.next_9cff86c8')}
            </Button>
          </TxCardActions>
        </form>
      </FormProvider>
    </TxCard>
  )
}

export default CreateSpendingLimit
