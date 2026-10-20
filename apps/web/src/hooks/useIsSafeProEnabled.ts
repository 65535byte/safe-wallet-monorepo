import { SAFE_PRO_ENABLED } from '@/config/pro'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@safe-global/utils/utils/chains'

/** Safe Pro requires both local support and the chain feature flag. */
export const useIsSafeProEnabled = (): boolean => {
  const hasFeature = useHasFeature(FEATURES.SAFE_PRO)
  return SAFE_PRO_ENABLED && hasFeature === true
}
