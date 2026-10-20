import { translateMessage } from '@/i18n'
import { useContext } from 'react'
import { TxFlow } from '../../TxFlow'
import { TxFlowContext } from '../../TxFlowProvider'
import { TxFlowType } from '@/services/analytics'
import { ReviewRemoveModule } from './ReviewRemoveModule'
import { type ReviewTransactionProps } from '@/components/tx/ReviewTransactionV2'

export type RemoveModuleFlowProps = {
  address: string
}

const ReviewRemoveModuleStep = (props: ReviewTransactionProps) => {
  const { data } = useContext(TxFlowContext)
  return <ReviewRemoveModule params={data} {...props} />
}

const RemoveModuleFlow = ({ address }: RemoveModuleFlowProps) => {
  return (
    <TxFlow
      initialData={{ address }}
      subtitle={translateMessage('ui.removeModule_8ec1b493')}
      eventCategory={TxFlowType.REMOVE_MODULE}
      ReviewTransactionComponent={ReviewRemoveModuleStep}
    />
  )
}

export default RemoveModuleFlow
