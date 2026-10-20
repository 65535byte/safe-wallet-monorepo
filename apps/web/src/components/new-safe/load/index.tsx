import { translateMessage } from '@/i18n'
import React from 'react'
import { useRouter } from 'next/router'

import { LOAD_SAFE_CATEGORY } from '@/services/analytics'
import { Typography } from '@safe-global/views/components/ui/typography'
import { CardStepper } from '@/components/new-safe/CardStepper'
import type { TxStepperProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { NamedAddress } from '@/components/new-safe/create/types'
import SetAddressStep from '@/components/new-safe/load/steps/SetAddressStep'
import { getNewSafeReturnUrl } from '@/components/new-safe/getReturnUrl'
import SafeOwnerStep from '@/components/new-safe/load/steps/SafeOwnerStep'
import SafeReviewStep from '@/components/new-safe/load/steps/SafeReviewStep'

export type LoadSafeFormData = NamedAddress & {
  threshold: number
  owners: NamedAddress[]
}

export const LoadSafeSteps: TxStepperProps<LoadSafeFormData>['steps'] = [
  {
    title: translateMessage('ui.chooseAddressNetworkAndAName_3e658dc7'),
    subtitle: translateMessage('ui.pasteTheAddressOfTheAccount_3c4324d0'),
    render: (data, onSubmit, onBack, setStep) => (
      <SetAddressStep onSubmit={onSubmit} onBack={onBack} data={data} setStep={setStep} />
    ),
  },
  {
    title: translateMessage('ui.signersAndConfirmations_434f9efb'),
    subtitle: translateMessage('ui.optionalProvideANameForEach_d23f43cf'),
    render: (data, onSubmit, onBack, setStep) => (
      <SafeOwnerStep onSubmit={onSubmit} onBack={onBack} data={data} setStep={setStep} />
    ),
  },
  {
    title: translateMessage('ui.review_ce84ccb0'),
    subtitle: translateMessage('ui.confirmAddingAccountToYourWatchlist_cffbd796'),
    render: (data, onSubmit, onBack, setStep) => (
      <SafeReviewStep onSubmit={onSubmit} onBack={onBack} data={data} setStep={setStep} />
    ),
  },
]

export const loadSafeDefaultData = { threshold: -1, owners: [], address: '', name: '' }

const LoadSafe = ({ initialData }: { initialData?: TxStepperProps<LoadSafeFormData>['initialData'] }) => {
  const router = useRouter()

  const onClose = () => {
    router.push(getNewSafeReturnUrl(router.query.next))
  }

  const initialSafe = initialData ?? loadSafeDefaultData

  return (
    <div data-testid="load-safe-form" className="mx-auto w-full max-w-[1200px] px-4 sm:px-6">
      <div className="grid grid-cols-12 gap-x-6">
        <div className="col-span-12 md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
          <Typography variant="h2" className="pb-4">
            {translateMessage('ui.addExistingAccount_cd04bbcb')}
          </Typography>
        </div>
        <div className="order-1 col-span-12 md:order-0 md:col-span-10 md:col-start-2 lg:col-span-8 lg:col-start-3">
          <CardStepper
            // Populate initial data
            key={initialSafe.address}
            initialData={initialSafe}
            onClose={onClose}
            steps={LoadSafeSteps}
            eventCategory={LOAD_SAFE_CATEGORY}
          />
        </div>
      </div>
    </div>
  )
}

export default LoadSafe
