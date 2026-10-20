import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { DrawerSection } from '@/components/common/Drawer'
import { Alert, AlertDescription, AlertSeverityIcon, AlertTitle } from '@safe-global/views/components/ui/alert'
import { ProposerOverview } from '../../components/ProposerOverview'
import { SafeSignatureInfo } from '../../components/SafeSignatureInfo'
import type { PendingProposerProps } from '@safe-global/views/features/spaces/components/Policies/ProposerDrawer/variants/types'

export type { PendingProposerProps } from '@safe-global/views/features/spaces/components/Policies/ProposerDrawer/variants/types'

export const PendingProposer = ({
  description,
  safe,
  signatures,
  expiresLabel,
  overview,
}: PendingProposerProps): ReactElement => (
  <div className="flex flex-col gap-4">
    <Alert variant="warning" outlined={false}>
      <AlertSeverityIcon variant="warning" />
      <AlertTitle>{translateMessage('ui.theProposerRoleIsNotActive_12430496')}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>

    <DrawerSection title={translateMessage('ui.pendingSignatures_934af063')} rightNode={expiresLabel}>
      <SafeSignatureInfo safe={safe} signatures={signatures} />
    </DrawerSection>

    <ProposerOverview {...overview} />
  </div>
)
