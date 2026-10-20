import { translateMessage } from '@/i18n'
import { useContext } from 'react'
import { TxFlow } from '../../TxFlow'
import { TxFlowContext } from '../../TxFlowProvider'
import { TxFlowType } from '@/services/analytics'
import { ReviewRemoveGuard } from './ReviewRemoveGuard'
import { type ReviewTransactionProps } from '@/components/tx/ReviewTransactionV2'

export type RemoveGuardFlowProps = {
  address: string
}

const ReviewRemoveGuardStep = (props: ReviewTransactionProps) => {
  const { data } = useContext(TxFlowContext)
  return <ReviewRemoveGuard params={data} {...props} />
}

const RemoveGuardFlow = ({ address }: RemoveGuardFlowProps) => {
  return (
    <TxFlow
      initialData={{ address }}
      subtitle={translateMessage('ui.removeGuard_1c2b4f21')}
      eventCategory={TxFlowType.REMOVE_GUARD}
      ReviewTransactionComponent={ReviewRemoveGuardStep}
    />
  )
}

export default RemoveGuardFlow
