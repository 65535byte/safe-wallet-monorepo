import { translateMessage } from '@/i18n'
import { useEffect } from 'react'
import type { CreateSafeInfoItem } from '@/components/new-safe/create/CreateSafeInfos'

export const useSafeSetupHints = (
  setHint: (hint: CreateSafeInfoItem | undefined) => void,
  threshold?: number,
  numberOfOwners?: number,
  multiChain?: boolean,
) => {
  useEffect(() => {
    const safeSetupWarningSteps: { title: string; text: string }[] = []

    // 1/n warning
    if (numberOfOwners && threshold === 1) {
      safeSetupWarningSteps.push({
        title: translateMessage('ui.policy_d20469b7', { p0: numberOfOwners }),
        text: translateMessage('ui.useAThresholdHigherThanOne_a371bfdb'),
      })
    }

    // n/n warning
    if (threshold === numberOfOwners && numberOfOwners && numberOfOwners > 1) {
      safeSetupWarningSteps.push({
        title: translateMessage('ui.policy_49305b60', { p0: numberOfOwners, p1: numberOfOwners }),
        text: translateMessage('ui.useAThresholdWhichIsLower_f3f09881'),
      })
    }

    // n/n warning
    if (multiChain) {
      safeSetupWarningSteps.push({
        title: translateMessage('ui.sameAddressManyNetworks_d5195aaf'),
        text: translateMessage('ui.youCanChooseWhichNetworksTo_064756ba'),
      })
    }

    setHint({ title: translateMessage('ui.accountSetup_9b968879'), variant: 'info', steps: safeSetupWarningSteps })

    // Clear dynamic hints when the step / hook unmounts
    return () => {
      setHint(undefined)
    }
  }, [threshold, numberOfOwners, setHint, multiChain])
}
