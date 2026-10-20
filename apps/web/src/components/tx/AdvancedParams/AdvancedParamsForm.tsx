import { translateMessage } from '@/i18n'
import { type SyntheticEvent } from 'react'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import { FormProvider, useForm } from 'react-hook-form'
import { safeFormatUnits, safeParseUnits } from '@safe-global/utils/utils/formatters'
import { FLOAT_REGEX } from '@safe-global/utils/utils/validation'
import ModalDialog from '@/components/common/ModalDialog'
import { AdvancedField, type AdvancedParameters } from '@safe-global/views/components/tx/AdvancedParams/types'
import GasLimitInput from './GasLimitInput'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import NumberField from '@/components/common/NumberField'

import { HelpCenterArticle } from '@safe-global/utils/config/constants'

type AdvancedParamsFormProps = {
  params: AdvancedParameters
  onSubmit: (params: AdvancedParameters) => void
  recommendedGasLimit?: AdvancedParameters['gasLimit']
  isExecution: boolean
  isEIP1559?: boolean
  willRelay?: boolean
}

type FormData = {
  [AdvancedField.userNonce]: number
  [AdvancedField.gasLimit]?: string
  [AdvancedField.maxFeePerGas]: string
  [AdvancedField.maxPriorityFeePerGas]: string
}

const AdvancedParamsForm = ({ params, ...props }: AdvancedParamsFormProps) => {
  const formMethods = useForm<FormData>({
    mode: 'onChange',
    defaultValues: {
      userNonce: params.userNonce ?? 0,
      gasLimit: params.gasLimit?.toString() || undefined,
      maxFeePerGas: params.maxFeePerGas ? safeFormatUnits(params.maxFeePerGas) : '',
      maxPriorityFeePerGas: params.maxPriorityFeePerGas ? safeFormatUnits(params.maxPriorityFeePerGas) : '',
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = formMethods

  const onBack = () => {
    props.onSubmit({
      userNonce: params.userNonce,
      gasLimit: params.gasLimit,
      maxFeePerGas: params.maxFeePerGas,
      maxPriorityFeePerGas: params.maxPriorityFeePerGas,
    })
  }

  const onSubmit = (data: FormData) => {
    props.onSubmit({
      userNonce: data.userNonce,
      gasLimit: data.gasLimit ? BigInt(data.gasLimit) : undefined,
      maxFeePerGas: safeParseUnits(data.maxFeePerGas) ?? params.maxFeePerGas,
      maxPriorityFeePerGas: safeParseUnits(data.maxPriorityFeePerGas) ?? params.maxPriorityFeePerGas,
    })
  }

  const onFormSubmit = (e: SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleSubmit(onSubmit)()
  }

  return (
    <ModalDialog open dialogTitle={translateMessage('ui.advancedParameters_28f91ca2')} hideChainIndicator forceBackdrop>
      <FormProvider {...formMethods}>
        <form onSubmit={onFormSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Typography className="font-bold">{translateMessage('ui.executionParameters_df87d9ae')}</Typography>
              </div>

              {/* User nonce */}
              <div className="w-full">
                <NumberField
                  fullWidth
                  disabled={props.willRelay}
                  label={errors.userNonce?.message || 'Wallet nonce'}
                  error={!!errors.userNonce}
                  {...register(AdvancedField.userNonce)}
                />
              </div>

              {/* Gas limit */}
              <div>
                <GasLimitInput recommendedGasLimit={props.recommendedGasLimit?.toString()} />
              </div>

              {/* Gas price */}
              {props.isEIP1559 && (
                <div className="w-full">
                  <NumberField
                    fullWidth
                    disabled={props.willRelay}
                    label={errors.maxPriorityFeePerGas?.message || 'Max priority fee (Gwei)'}
                    error={!!errors.maxPriorityFeePerGas}
                    required
                    {...register(AdvancedField.maxPriorityFeePerGas, {
                      required: true,
                      pattern: FLOAT_REGEX,
                      min: 0,
                    })}
                  />
                </div>
              )}

              <div className="w-full">
                <NumberField
                  fullWidth
                  disabled={props.willRelay}
                  label={
                    errors.maxFeePerGas?.message || props.isEIP1559
                      ? translateMessage('ui.maxFeeGwei_bac57a85')
                      : translateMessage('ui.gasPriceGwei_5d9c2dae')
                  }
                  error={!!errors.maxFeePerGas}
                  required
                  {...register(AdvancedField.maxFeePerGas, { required: true, pattern: FLOAT_REGEX, min: 0 })}
                />
              </div>
            </div>

            {/* Help link */}
            <Typography className="mt-4">
              <ExternalLink href={HelpCenterArticle.ADVANCED_PARAMS}>
                {translateMessage('ui.howCanIConfigureTheseParameters_5caa3bf6')}
              </ExternalLink>
            </Typography>
          </div>

          {/* Buttons */}
          <div className="flex justify-between gap-2 px-6 pb-6">
            <Button variant="ghost" onClick={onBack}>
              {translateMessage('ui.back_dae8bf43')}
            </Button>

            <Button type="submit">{translateMessage('ui.confirm_6ed20c1c')}</Button>
          </div>
        </form>
      </FormProvider>
    </ModalDialog>
  )
}

export default AdvancedParamsForm
