import { translateMessage } from '@/i18n'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { useSafeShield } from '@/features/safe-shield/SafeShieldContext'

const RiskConfirmationError = () => {
  const { needsRiskConfirmation, isRiskConfirmed } = useSafeShield()

  if (!needsRiskConfirmation || isRiskConfirmed) {
    return null
  }

  return (
    <ErrorMessage level="warning">
      {translateMessage('ui.pleaseAcknowledgeTheRiskBeforeProceeding_fadcc0cc')}
    </ErrorMessage>
  )
}

export default RiskConfirmationError
