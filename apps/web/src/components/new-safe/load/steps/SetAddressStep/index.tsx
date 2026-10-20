import { translateMessage } from '@/i18n'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { LoadSafeFormData } from '@/components/new-safe/load'
import { FormProvider, useForm } from 'react-hook-form'
import { Button } from '@safe-global/views/components/ui/button'
import { Spinner } from '@safe-global/views/components/ui/spinner'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Tooltip, TooltipTrigger, TooltipContent } from '@safe-global/views/components/ui/tooltip'
import { Typography } from '@safe-global/views/components/ui/typography'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import NameInput from '@/components/common/NameInput'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import NetworkSelector from '@/components/common/NetworkSelector'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import { useAddressResolver } from '@/hooks/useAddressResolver'
import AddressInput from '@/components/common/AddressInput'
import { largeFormFieldSurfaceClassName } from '@safe-global/views/components/common/formFieldStyles'
import React from 'react'
import { useLazySafesGetSafeV1Query } from '@safe-global/store/gateway/AUTO_GENERATED/safes'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'
import { LOAD_SAFE_EVENTS, trackEvent } from '@/services/analytics'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { PRIVACY_URL, TERMS_URL } from '@safe-global/utils/config/constants'

enum Field {
  name = 'name',
  address = 'address',
}

type FormData = {
  [Field.name]: string
  [Field.address]: string
}

const networkSelectTriggerClassName = `${largeFormFieldSurfaceClassName} w-full`

const SetAddressStep = ({ data, onSubmit, onBack }: StepRenderProps<LoadSafeFormData>) => {
  const currentChainId = useChainId()
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, currentChainId))
  const [triggerGetSafe] = useLazySafesGetSafeV1Query()
  const formMethods = useForm<FormData>({
    mode: 'all',
    defaultValues: {
      [Field.name]: data.name,
      [Field.address]: data.address,
    },
  })

  const {
    handleSubmit,
    formState: { errors, isValid },
    watch,
    getValues,
  } = formMethods

  const safeAddress = watch(Field.address)
  const randomName = useMnemonicSafeName()
  const { ens, name, resolving } = useAddressResolver(safeAddress)

  // Address book, ENS, mnemonic
  const fallbackName = name || ens || randomName

  const validateSafeAddress = async (address: string) => {
    if (addedSafes && Object.keys(addedSafes).includes(address)) {
      return translateMessage('ui.accountIsAlreadyAdded_cfe8473f')
    }

    try {
      const result = await triggerGetSafe({ chainId: currentChainId, safeAddress: address }).unwrap()
      if (!result) {
        return translateMessage('ui.addressGivenIsNotAValid_9d6ebe4a')
      }
    } catch (error) {
      return translateMessage('ui.addressGivenIsNotAValid_9d6ebe4a')
    }
  }

  const onFormSubmit = handleSubmit((data: FormData) => {
    onSubmit({
      ...data,
      [Field.name]: data[Field.name] || fallbackName,
    })

    if (data[Field.name]) {
      trackEvent(LOAD_SAFE_EVENTS.NAME_SAFE)
    }
  })

  const handleBack = () => {
    const formData = getValues()
    onBack({
      ...formData,
      [Field.name]: formData.name || fallbackName,
    })
  }

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onFormSubmit}>
        <div className={layoutCss.row}>
          <div className="mb-6 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
              <div className="order-last md:order-first">
                <NameInput
                  name={Field.name}
                  label={errors?.[Field.name]?.message || translateMessage('ui.name_84f28b85')}
                  placeholder={fallbackName}
                  InputLabelProps={{ shrink: true }}
                  inputSize="hero"
                  variant="surface"
                  InputProps={{
                    endAdornment: resolving ? (
                      <div className="flex items-center">
                        <Spinner className="size-5" />
                      </div>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span className="flex items-center">
                              <InfoIcon className="size-5" />
                            </span>
                          }
                        />
                        <TooltipContent>{translateMessage('ui.thisNameIsStoredLocallyAnd_b263e90d')}</TooltipContent>
                      </Tooltip>
                    ),
                  }}
                />
              </div>
              <div className="order-first w-full md:order-last md:w-[220px]">
                <NetworkSelector triggerClassName={networkSelectTriggerClassName} />
              </div>
            </div>

            <AddressInput
              data-testid="address-section"
              label={translateMessage('ui.account_7e251525')}
              validate={validateSafeAddress}
              name={Field.address}
            />
          </div>

          <Typography className="mt-8 block">
            {translateMessage('ui.byContinuingYouConsentToThe_c641be4d')}{' '}
            <ExternalLink href={TERMS_URL} noIcon className="[&_span]:underline [&_span]:decoration-primary/40">
              {translateMessage('ui.termsOfUse_273d4cdf')}
            </ExternalLink>{' '}
            {translateMessage('ui.and_ee3cc19b')}{' '}
            <ExternalLink href={PRIVACY_URL} noIcon className="[&_span]:underline [&_span]:decoration-primary/40">
              {translateMessage('ui.privacyPolicy_695dc448')}
            </ExternalLink>
            .
          </Typography>
        </div>

        <Separator />

        <div className={layoutCss.row}>
          <div className="flex justify-between gap-2">
            <Button type="button" variant="outline" size="lg" onClick={handleBack}>
              {translateMessage('ui.back_dae8bf43')}
            </Button>
            <Button data-testid="load-safe-next-btn" type="submit" size="lg" disabled={!isValid}>
              {translateMessage('ui.next_9cff86c8')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default SetAddressStep
