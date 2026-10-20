import { translateMessage } from '@/i18n'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useRouter } from 'next/router'

import useWallet from '@/hooks/wallets/useWallet'
import OverviewWidget from '@/components/new-safe/create/OverviewWidget'
import type { NamedAddress } from '@/components/new-safe/create/types'
import type { TxStepperProps } from '@/components/new-safe/CardStepper/useCardStepper'
import SetNameStep from '@/components/new-safe/create/steps/SetNameStep'
import OwnerPolicyStep from '@/components/new-safe/create/steps/OwnerPolicyStep'
import ReviewStep from '@/components/new-safe/create/steps/ReviewStep'
import { CreateSafeStatus } from '@/components/new-safe/create/steps/StatusStep'
import { CardStepper } from '@/components/new-safe/CardStepper'
import { getNewSafeReturnUrl } from '@/components/new-safe/getReturnUrl'
import { CREATE_SAFE_CATEGORY } from '@/services/analytics'
import type { CreateSafeInfoVariant } from '@/components/new-safe/create/CreateSafeInfos'
import type { CreateSafeInfoItem } from '@/components/new-safe/create/CreateSafeInfos'
import CreateSafeInfos from '@/components/new-safe/create/CreateSafeInfos'
import { type ReactElement, useMemo, useState } from 'react'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { type SafeVersion } from '@safe-global/types-kit'
import { useCurrentChain } from '@/hooks/useChains'
import type { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import { getLatestSafeVersion } from '@safe-global/utils/utils/chains'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'

export type NewSafeFormData = {
  name: string
  networks: Chain[]
  threshold: number
  owners: NamedAddress[]
  saltNonce?: number
  safeVersion: SafeVersion
  safeAddress?: string
  willRelay?: boolean
  paymentReceiver?: string
}

const staticHints: Record<
  number,
  { title: string; variant: CreateSafeInfoVariant; steps: { title: string; text: string | ReactElement }[] }
> = {
  1: {
    title: translateMessage('ui.accountCreation_7dcd84c3'),
    variant: 'info',
    steps: [
      {
        title: translateMessage('ui.networkFee_b1f6f53f'),
        text: translateMessage('ui.deployingYourAccountRequiresThePayment_729c01ab'),
      },
      {
        title: translateMessage('ui.addressBookPrivacy_1a650b6f'),
        text: translateMessage('ui.theNameOfYourAccountWill_21ea6d73'),
      },
    ],
  },
  2: {
    title: translateMessage('ui.accountCreation_7dcd84c3'),
    variant: 'info',
    steps: [
      {
        title: translateMessage('ui.flatHierarchy_5881d282'),
        text: translateMessage('ui.everySignerHasTheSameRights_bbc92c90'),
      },
      {
        title: translateMessage('ui.managingSigners_8a3a02ad'),
        text: translateMessage('ui.youCanAlwaysChangeTheNumber_0ac204ba'),
      },
      {
        title: translateMessage('ui.accountSetup_9b968879'),
        text: (
          <>
            {translateMessage('ui.notSureHowManySignersAnd_b90ab989')}
            <br />
            <ExternalLink href={HelpCenterArticle.SAFE_SETUP} className="font-bold">
              {translateMessage('ui.learnMoreAboutSettingUpYour_f13597ec')}
            </ExternalLink>
          </>
        ),
      },
    ],
  },
  3: {
    title: translateMessage('ui.accountCreation_7dcd84c3'),
    variant: 'info',
    steps: [
      {
        title: translateMessage('ui.waitForTheCreation_4b1e3fac'),
        text: translateMessage('ui.dependingOnNetworkUsageItCan_5edc2367'),
      },
    ],
  },
  4: {
    title: translateMessage('ui.accountUsage_6a20ccee'),
    variant: 'success',
    steps: [
      {
        title: translateMessage('ui.connectYourAccount_f8f766e7'),
        text: translateMessage('ui.inOurSafeAppsSectionYou_ae9ca37b'),
      },
    ],
  },
}

const CreateSafe = () => {
  const router = useRouter()
  const wallet = useWallet()
  const chain = useCurrentChain()

  const [safeName, setSafeName] = useState('')
  const [overviewNetworks, setOverviewNetworks] = useState<Chain[]>()

  const [dynamicHint, setDynamicHint] = useState<CreateSafeInfoItem>()
  const [activeStep, setActiveStep] = useState(0)

  const CreateSafeSteps: TxStepperProps<NewSafeFormData>['steps'] = [
    {
      title: translateMessage('ui.setUpTheBasics_e0d5054a'),
      subtitle: translateMessage('ui.giveANameToYourAccount_3b414605'),
      render: (data, onSubmit, onBack, setStep) => (
        <SetNameStep
          setOverviewNetworks={setOverviewNetworks}
          setDynamicHint={setDynamicHint}
          setSafeName={setSafeName}
          data={data}
          onSubmit={onSubmit}
          onBack={onBack}
          setStep={setStep}
        />
      ),
    },
    {
      title: translateMessage('ui.signersAndConfirmations_434f9efb'),
      subtitle: translateMessage('ui.setTheSignerWalletsOfYour_e8adcf16'),
      render: (data, onSubmit, onBack, setStep) => (
        <OwnerPolicyStep
          setDynamicHint={setDynamicHint}
          data={data}
          onSubmit={onSubmit}
          onBack={onBack}
          setStep={setStep}
        />
      ),
    },
    {
      title: translateMessage('ui.review_ce84ccb0'),
      subtitle: translateMessage('ui.youReAboutToCreateA_5a400c60'),
      render: (data, onSubmit, onBack, setStep) => (
        <ReviewStep data={data} onSubmit={onSubmit} onBack={onBack} setStep={setStep} />
      ),
    },
    {
      title: '',
      subtitle: '',
      render: (data, onSubmit, onBack, setStep, setProgressColor, setStepData) => (
        <CreateSafeStatus
          data={data}
          onSubmit={onSubmit}
          onBack={onBack}
          setStep={setStep}
          setProgressColor={setProgressColor}
          setStepData={setStepData}
        />
      ),
    },
  ]

  const staticHint = useMemo(() => staticHints[activeStep], [activeStep])

  const initialStep = 0
  const initialData: NewSafeFormData = {
    name: '',
    networks: [],
    owners: [],
    threshold: 1,
    safeVersion: getLatestSafeVersion(chain) as SafeVersion,
  }

  const onClose = () => {
    router.push(getNewSafeReturnUrl(router.query.next))
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
      <div className="grid grid-cols-12 justify-center gap-x-6">
        <div className="col-span-12">
          <Typography variant="h2" className="pb-4">
            {translateMessage('ui.createNewAccount_cf67da11')}
          </Typography>
        </div>
        <div className="order-1 col-span-12 md:order-0 md:col-span-8">
          <CardStepper
            initialData={initialData}
            initialStep={initialStep}
            onClose={onClose}
            steps={CreateSafeSteps}
            eventCategory={CREATE_SAFE_CATEGORY}
            setWidgetStep={setActiveStep}
          />
        </div>

        <div className="order-0 col-span-12 mb-6 md:order-1 md:col-span-4 md:mb-0">
          <div className="grid grid-cols-12 gap-6">
            {activeStep < 2 && <OverviewWidget safeName={safeName} networks={overviewNetworks || []} />}
            {wallet?.address && <CreateSafeInfos staticHint={staticHint} dynamicHint={dynamicHint} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateSafe
