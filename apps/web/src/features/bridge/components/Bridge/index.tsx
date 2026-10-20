import { translateMessage } from '@/i18n'
import { AppRoutes } from '@/config/routes'
import { FeatureWrapper } from '@/components/wrappers/FeatureWrapper'
import { SanctionWrapper } from '@/components/wrappers/SanctionWrapper'
import { DisclaimerWrapper } from '@/components/wrappers/DisclaimerWrapper'
import { FEATURES } from '@safe-global/utils/utils/chains'
import { LOCAL_STORAGE_CONSENT_KEY } from '../../constants'
import { BridgeWidget } from '../BridgeWidget'

export function Bridge() {
  return (
    <FeatureWrapper feature={FEATURES.BRIDGE} fallbackRoute={AppRoutes.home}>
      <SanctionWrapper featureTitle={translateMessage('ui.bridgeFeatureWithLIFI_c9d2a162')}>
        <DisclaimerWrapper
          localStorageKey={LOCAL_STORAGE_CONSENT_KEY}
          widgetName={translateMessage('ui.bridgingWidgetByLIFI_4570da99')}
        >
          <BridgeWidget />
        </DisclaimerWrapper>
      </SanctionWrapper>
    </FeatureWrapper>
  )
}
