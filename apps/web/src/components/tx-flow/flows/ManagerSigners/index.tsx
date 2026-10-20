import { translateMessage } from '@/i18n'
import { useMemo } from 'react'

import SaveAddressIcon from '@/public/images/common/save-address.svg'
import useSafeInfo from '@/hooks/useSafeInfo'
import { SignersStructure } from './SignersStructure'
import { ReviewSigners } from './ReviewSigners'
import { TxFlowType } from '@/services/analytics'
import { TxFlow } from '../../TxFlow'
import { TxFlowStep } from '../../TxFlowStep'
import type { NamedAddress } from '@/components/new-safe/create/types'

export enum ManageSignersFormFields {
  threshold = 'threshold',
  owners = 'owners',
}

export type ManageSignersForm = {
  [ManageSignersFormFields.threshold]: number
  [ManageSignersFormFields.owners]: Array<NamedAddress>
}

const ManageSignersFlow = () => {
  const { safe } = useSafeInfo()

  const defaultValues = useMemo(() => {
    return {
      [ManageSignersFormFields.threshold]: safe.threshold,
      [ManageSignersFormFields.owners]: safe.owners.map((owner) => {
        return {
          address: owner.value,
          name: '',
        }
      }),
    }
  }, [safe.threshold, safe.owners])

  return (
    <TxFlow
      icon={SaveAddressIcon}
      subtitle={translateMessage('ui.manageSigners_984a7e8e')}
      ReviewTransactionComponent={ReviewSigners}
      eventCategory={TxFlowType.SIGNERS_STRUCTURE}
      initialData={defaultValues}
    >
      <TxFlowStep title={translateMessage('ui.newTransaction_7f00cf16')}>
        <SignersStructure />
      </TxFlowStep>
    </TxFlow>
  )
}

export default ManageSignersFlow
