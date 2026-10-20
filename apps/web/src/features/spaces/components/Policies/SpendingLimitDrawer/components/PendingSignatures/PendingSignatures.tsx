import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { DrawerList, DrawerSection } from '@/components/common/Drawer'
import { AccountIdentity } from '../../../components/AccountIdentity'
import { formatSignedCount } from '@safe-global/views/features/spaces/components/Policies/SpendingLimitDrawer/format'

export type PendingSignaturesProps = {
  safe: { address: string; name?: string }
  signed: number
  required: number
}

const PendingSignatures = ({ safe, signed, required }: PendingSignaturesProps): ReactElement => (
  <DrawerSection
    title={translateMessage('ui.pendingSignatures_934af063')}
    rightNode={formatSignedCount(signed, required)}
  >
    <DrawerList
      items={[
        { label: translateMessage('ui.account_7e251525'), content: <AccountIdentity {...safe} showCopyButton /> },
      ]}
    />
  </DrawerSection>
)

export default PendingSignatures
