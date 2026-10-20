import { translateMessage } from '@safe-global/views/i18n'
import type { NativeStakingValidatorsExitTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'

const StakingTxExitInfo = ({ info }: { info: NativeStakingValidatorsExitTransactionInfo }) => {
  return (
    <>
      {info.numValidators} {translateMessage('ui.validator_8de16b78')}
    </>
  )
}

export default StakingTxExitInfo
