import { translateMessage } from '@/i18n'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import { ZERO_ADDRESS } from '@safe-global/utils/utils/constants'
import { TxFlowType } from '@/services/analytics'
import { TxFlow } from '../../TxFlow'
import { TxFlowStep } from '../../TxFlowStep'
import { useLoadFeature } from '@/features/__core__'
import { SpendingLimitsFeature, type NewSpendingLimitFlowProps } from '@/features/spending-limits'

const defaultValues: NewSpendingLimitFlowProps = {
  beneficiary: '',
  tokenAddress: ZERO_ADDRESS,
  amount: '',
  resetTime: '0',
}

const NewSpendingLimitFlow = () => {
  const { CreateSpendingLimit, ReviewSpendingLimit } = useLoadFeature(SpendingLimitsFeature)

  return (
    <TxFlow
      icon={SaveAddressIcon}
      subtitle={translateMessage('ui.spendingLimit_26abdb30')}
      ReviewTransactionComponent={ReviewSpendingLimit}
      eventCategory={TxFlowType.SETUP_SPENDING_LIMIT}
      initialData={defaultValues}
    >
      <TxFlowStep title={translateMessage('ui.newTransaction_7f00cf16')}>
        <CreateSpendingLimit />
      </TxFlowStep>
    </TxFlow>
  )
}

export default NewSpendingLimitFlow
