import { translateMessage } from '@/i18n'
import Disclaimer from '@safe-global/views/components/common/Disclaimer'
import WidgetDisclaimer from '@/components/common/WidgetDisclaimer'
import BlockedAddress from '@/components/common/BlockedAddress'
import useBlockedAddress from '@/hooks/useBlockedAddress'
import useConsent from '@/hooks/useConsent'
import { EARN_CONSENT_STORAGE_KEY } from '../../constants'
import EarnView from '../EarnView'

const EarnPage = () => {
  const { isConsentAccepted, onAccept } = useConsent(EARN_CONSENT_STORAGE_KEY)
  const blockedAddress = useBlockedAddress()

  if (blockedAddress) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <BlockedAddress address={blockedAddress} featureTitle={translateMessage('ui.earnFeatureWithKiln_0047c935')} />
      </div>
    )
  }

  if (isConsentAccepted === undefined) return null

  return (
    <>
      {isConsentAccepted ? (
        <EarnView />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Disclaimer
            title={translateMessage('ui.note_b1eff7f0')}
            content={<WidgetDisclaimer widgetName={translateMessage('ui.earnWidgetByKiln_914c74f3')} />}
            onAccept={onAccept}
            buttonText={translateMessage('ui.continue_a4bd8255')}
          />
        </div>
      )}
    </>
  )
}

export default EarnPage
