import { translateMessage } from '@/i18n'
import { MigrateSafeL2Review } from './MigrateSafeL2Review'
import SettingsIcon from '@safe-global/views/assets/images/sidebar/settings.svg'
import { TxFlow } from '../../TxFlow'

const MigrateSafeL2Flow = () => (
  <TxFlow
    icon={SettingsIcon}
    subtitle={translateMessage('ui.updateAccountBaseContract_c249d26d')}
    ReviewTransactionComponent={MigrateSafeL2Review}
  />
)

export default MigrateSafeL2Flow
