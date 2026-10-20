import { translateMessage } from '@/i18n'
import Disclaimer from '@safe-global/views/components/common/Disclaimer'
import WidgetDisclaimer from '@/components/common/WidgetDisclaimer'
import StakingWidget from '../StakingWidget'
import { useRouter } from 'next/router'
import BlockedAddress from '@/components/common/BlockedAddress'
import useBlockedAddress from '@/hooks/useBlockedAddress'
import useConsent from '@/hooks/useConsent'
import { STAKE_CONSENT_STORAGE_KEY } from '../../constants'

const StakePage = () => {
  const { isConsentAccepted, onAccept } = useConsent(STAKE_CONSENT_STORAGE_KEY)
  const router = useRouter()
  const { asset } = router.query

  const blockedAddress = useBlockedAddress()

  if (blockedAddress) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <BlockedAddress address={blockedAddress} featureTitle={translateMessage('ui.stakeFeatureWithKiln_0a749ee8')} />
      </div>
    )
  }

  return (
    <>
      {isConsentAccepted === undefined ? null : isConsentAccepted ? (
        <StakingWidget asset={String(asset)} />
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center">
          <Disclaimer
            title={translateMessage('ui.note_b1eff7f0')}
            content={<WidgetDisclaimer widgetName={translateMessage('ui.stakeWidgetByKiln_43c44e23')} />}
            onAccept={onAccept}
            buttonText={translateMessage('ui.continue_a4bd8255')}
          />
        </div>
      )}
    </>
  )
}

export default StakePage
