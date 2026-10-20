import { translateMessage } from '@/i18n'
import { UpdateSafeReview } from './UpdateSafeReview'
import SettingsIcon from '@safe-global/views/assets/images/sidebar/settings.svg'
import { TxFlowType } from '@/services/analytics'
import { TxFlow } from '../../TxFlow'

const UpdateSafeFlow = () => {
  return (
    <TxFlow
      subtitle={translateMessage('ui.updateAccountVersion_53cdfd68')}
      icon={SettingsIcon}
      eventCategory={TxFlowType.UPDATE_SAFE}
      ReviewTransactionComponent={UpdateSafeReview}
    />
  )
}

export default UpdateSafeFlow
