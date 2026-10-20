import { translateMessage } from '@/i18n'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Button } from '@safe-global/views/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { RotateCcw } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { BASE_TX_GAS } from '@/config/constants'
import { AdvancedField } from '@safe-global/views/components/tx/AdvancedParams/types'
import NumberField from '@/components/common/NumberField'

const GasLimitInput = ({ recommendedGasLimit }: { recommendedGasLimit?: string }) => {
  const { safe } = useSafeInfo()

  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext()

  const currentGasLimit = watch(AdvancedField.gasLimit)

  const onResetGasLimit = () => {
    setValue(AdvancedField.gasLimit, recommendedGasLimit)
    trigger(AdvancedField.gasLimit)
  }

  const error = errors.gasLimit as
    | {
        message: string
        type: string
      }
    | undefined

  const errorMessage = error
    ? error.type === 'min'
      ? translateMessage('ui.gasLimitMustBeAtLeast_429d252a')
      : error.message
    : undefined

  const showReset = !!recommendedGasLimit && recommendedGasLimit !== currentGasLimit?.toString()

  return (
    <div className="w-full">
      <NumberField
        fullWidth
        label={errorMessage || 'Gas limit'}
        error={!!errorMessage}
        // Always pass a truthy adornment: NumberField switches between a bare Input and an
        // InputGroup based on it, and swapping remounts the input mid-typing (losing focus).
        endAdornment={
          <>
            {showReset && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={onResetGasLimit}
                      className="text-primary"
                      aria-label={translateMessage('ui.resetToRecommendedGasLimit_4a44ad36')}
                    >
                      <RotateCcw className="size-4" />
                    </Button>
                  }
                />
                <TooltipContent>{translateMessage('ui.resetToRecommendedGasLimit_4a44ad36')}</TooltipContent>
              </Tooltip>
            )}
          </>
        }
        disabled={!safe.deployed}
        required
        {...register(AdvancedField.gasLimit, { required: true, min: BASE_TX_GAS })}
      />
    </div>
  )
}

export default GasLimitInput
