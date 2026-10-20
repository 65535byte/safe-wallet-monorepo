import { translateMessage } from '@/i18n'
import ChainIndicator from '@/components/common/ChainIndicator'
import { Label } from '@safe-global/views/components/ui/label'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@safe-global/views/components/ui/select'
import partition from 'lodash/partition'
import css from './styles.module.css'
import { type ReactElement, useId, useMemo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import { type Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'

const NetworkInput = ({
  name,
  required = false,
  chainConfigs,
}: {
  name: string
  required?: boolean
  chainConfigs: (Chain & { available: boolean })[]
}): ReactElement => {
  const id = useId()
  const [testNets, prodNets] = useMemo(() => partition(chainConfigs, (config) => config.isTestnet), [chainConfigs])
  const { control } = useFormContext() || {}

  const renderItem = (chainId: string, isDisabled: boolean) => {
    const chain = chainConfigs.find((chain) => chain.chainId === chainId)
    if (!chain) return null
    return (
      <SelectItem disabled={isDisabled} key={chainId} value={chainId} className={css.item}>
        <ChainIndicator chainId={chain.chainId} />
        {isDisabled && (
          <Typography variant="paragraph-mini" className={css.disabledChip}>
            {translateMessage('ui.notAvailable_6505d8d6')}
          </Typography>
        )}
      </SelectItem>
    )
  }

  return (
    <Controller
      name={name}
      rules={{ required }}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex w-full flex-col gap-1.5">
          <Label htmlFor={id} className={fieldState.error ? 'text-destructive' : undefined}>
            {translateMessage('ui.network_eb8f6520')}
          </Label>
          <Select
            value={field.value || null}
            onValueChange={field.onChange}
            onOpenChange={(isOpen) => !isOpen && field.onBlur()}
          >
            <SelectTrigger
              id={id}
              aria-label={translateMessage('ui.network_eb8f6520')}
              aria-invalid={!!fieldState.error || undefined}
              className="w-full"
            >
              <SelectValue>
                {(value) => {
                  const chain = chainConfigs.find((chain) => chain.chainId === value)
                  if (chain) return <ChainIndicator chainId={chain.chainId} />
                  return required ? null : translateMessage('ui.optional_00a972f2')
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {prodNets.map((chain) => renderItem(chain.chainId, !chain.available))}

              {testNets.length > 0 && (
                <div className={css.listSubHeader}>{translateMessage('ui.testnets_a0b06e1b')}</div>
              )}

              {testNets.map((chain) => renderItem(chain.chainId, !chain.available))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  )
}

export default NetworkInput
