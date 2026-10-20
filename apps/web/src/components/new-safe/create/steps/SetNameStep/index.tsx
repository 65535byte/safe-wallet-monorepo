import { translateMessage } from '@/i18n'
import { Tooltip, TooltipTrigger, TooltipContent } from '@safe-global/views/components/ui/tooltip'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Button } from '@safe-global/views/components/ui/button'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useMnemonicSafeName } from '@/hooks/useMnemonicName'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { NewSafeFormData } from '@/components/new-safe/create'

import layoutCss from '@/components/new-safe/create/styles.module.css'
import NameInput from '@/components/common/NameInput'
import { getNewSafeReturnUrl } from '@/components/new-safe/getReturnUrl'
import { CREATE_SAFE_EVENTS, trackEvent } from '@/services/analytics'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { PRIVACY_URL, TERMS_URL } from '@safe-global/utils/config/constants'
import { useRouter } from 'next/router'
import NoWalletConnectedWarning from '../../NoWalletConnectedWarning'
import { type SafeVersion } from '@safe-global/types-kit'
import { useCurrentChain } from '@/hooks/useChains'
import { useEffect } from 'react'
import type { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import { useSafeSetupHints } from '../OwnerPolicyStep/useSafeSetupHints'
import type { CreateSafeInfoItem } from '../../CreateSafeInfos'
import { SafeCreationNetworkInput } from '@/features/multichain'
import useWallet from '@/hooks/wallets/useWallet'
import { SAFE_CREATION_NETWORKS } from '@/config/safeCreationNetworks'
import { getLatestSafeVersion } from '@safe-global/utils/utils/chains'

type SetNameStepForm = {
  name: string
  networks: Chain[]
  safeVersion: SafeVersion
}

export enum SetNameStepFields {
  name = 'name',
  networks = 'networks',
  safeVersion = 'safeVersion',
}

const SET_NAME_STEP_FORM_ID = 'create-safe-set-name-step-form'

function SetNameStep({
  data,
  onSubmit,
  setSafeName,
  setOverviewNetworks,
  setDynamicHint,
  isAdvancedFlow = false,
}: StepRenderProps<NewSafeFormData> & {
  setSafeName: (name: string) => void
  setOverviewNetworks: (networks: Chain[]) => void
  setDynamicHint: (hints: CreateSafeInfoItem | undefined) => void
  isAdvancedFlow?: boolean
}) {
  const router = useRouter()
  const currentChain = useCurrentChain()
  const wallet = useWallet()
  const walletChain = SAFE_CREATION_NETWORKS.find((chain) => chain.chainId === wallet?.chainId)

  const configuredNetworks = data.networks.flatMap((network) =>
    SAFE_CREATION_NETWORKS.filter((chain) => chain.chainId === network.chainId),
  )
  const initialState = configuredNetworks.length ? configuredNetworks : walletChain ? [walletChain] : []
  const formMethods = useForm<SetNameStepForm>({
    mode: 'all',
    defaultValues: {
      ...data,
      networks: initialState,
    },
  })

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors, isValid },
  } = formMethods

  const networks: Chain[] = useWatch({ control, name: SetNameStepFields.networks })
  const isMultiChain = networks.length > 1
  const fallbackName = useMnemonicSafeName(isMultiChain)
  useSafeSetupHints(setDynamicHint, undefined, undefined, isMultiChain)

  const onFormSubmit = (data: Pick<NewSafeFormData, 'name' | 'networks'>) => {
    const name = data.name || fallbackName
    setSafeName(name)
    setOverviewNetworks(data.networks)

    onSubmit({ ...data, name })

    if (data.name) {
      trackEvent(CREATE_SAFE_EVENTS.NAME_SAFE)
    }
  }

  const onCancel = () => {
    trackEvent(CREATE_SAFE_EVENTS.CANCEL_CREATE_SAFE_FORM)
    router.push(getNewSafeReturnUrl(router.query.next))
  }

  // whenever the chain switches we need to update the latest Safe version and selected chain
  useEffect(() => {
    setValue(SetNameStepFields.safeVersion, getLatestSafeVersion(currentChain))
  }, [currentChain, setValue])

  // The form's default networks are computed once on mount; if the chain configs weren't
  // loaded yet at that point, seed the wallet's chain when it becomes available.
  useEffect(() => {
    if (!networks.length && walletChain) {
      setValue(SetNameStepFields.networks, [walletChain], { shouldValidate: true })
    }
    // Only a late-arriving walletChain should trigger the seed, not the user clearing the field
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletChain, setValue])

  const isDisabled = !isValid

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onFormSubmit)} id={SET_NAME_STEP_FORM_ID}>
        <div className={layoutCss.row}>
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-12">
              <NameInput
                inputSize="hero"
                name={SetNameStepFields.name}
                label={errors?.[SetNameStepFields.name]?.message || translateMessage('ui.name_84f28b85')}
                placeholder={fallbackName}
                className="[&_label]:text-base [&_label]:font-semibold"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
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

            <div className="col-span-12">
              <Typography variant="paragraph-bold" className="mt-4 inline-flex items-center gap-2">
                {translateMessage('ui.selectNetworks_e0c1529e')}
              </Typography>
              <Typography variant="paragraph-small" className="mb-4 block">
                {translateMessage('ui.chooseWhichNetworksYouWantYour_5683ca2c')}{' '}
              </Typography>
              <SafeCreationNetworkInput
                isAdvancedFlow={isAdvancedFlow}
                name={SetNameStepFields.networks}
                networks={SAFE_CREATION_NETWORKS}
              />
            </div>
          </div>
          <Typography variant="paragraph-small" className="mt-4 block">
            {translateMessage('ui.byContinuingYouAgreeToOur_8899e815')}{' '}
            <ExternalLink href={TERMS_URL} noIcon className="[&_span]:underline [&_span]:decoration-primary/40">
              {translateMessage('ui.termsOfUse_273d4cdf')}
            </ExternalLink>{' '}
            {translateMessage('ui.and_ee3cc19b')}{' '}
            <ExternalLink href={PRIVACY_URL} noIcon className="[&_span]:underline [&_span]:decoration-primary/40">
              {translateMessage('ui.privacyPolicy_695dc448')}
            </ExternalLink>
            .
          </Typography>

          <NoWalletConnectedWarning />
        </div>
        <Separator />
        <div className={layoutCss.row}>
          <div className="flex flex-row justify-between gap-6">
            <Button data-testid="cancel-btn" variant="outline" onClick={onCancel} size="lg">
              {translateMessage('ui.cancel_d94a8eaf')}
            </Button>
            <Button data-testid="next-btn" type="submit" variant="default" size="lg" disabled={isDisabled}>
              {translateMessage('ui.next_9cff86c8')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default SetNameStep
