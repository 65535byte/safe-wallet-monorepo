import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { TriangleAlert } from 'lucide-react'
import { DrawerSection } from '@/components/common/Drawer'
import { Alert, AlertDescription, AlertTitle } from '@safe-global/views/components/ui/alert'
import { ProposerOverview } from '../../components/ProposerOverview'
import { SafeSignatureInfo } from '../../components/SafeSignatureInfo'
import type { NotActivatedProposerProps } from '@safe-global/views/features/spaces/components/Policies/ProposerDrawer/variants/types'

export type { NotActivatedProposerProps } from '@safe-global/views/features/spaces/components/Policies/ProposerDrawer/variants/types'

export const NotActivatedProposer = ({
  description,
  safe,
  signatures,
  expiresLabel,
  overview,
}: NotActivatedProposerProps): ReactElement => (
  <div className="flex flex-col gap-4">
    {/* Figma pairs the error alert with triangle-alert, not the destructive default (circle-alert) */}
    <Alert variant="destructive" outlined={false}>
      <TriangleAlert />
      <AlertTitle>{translateMessage('ui.theProposerRoleWasNotActivated_6eceff48')}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>

    <DrawerSection title={translateMessage('ui.pendingSignatures_934af063')} rightNode={expiresLabel}>
      <SafeSignatureInfo safe={safe} signatures={signatures} badgeVariant="destructive" />
    </DrawerSection>

    <ProposerOverview {...overview} />
  </div>
)
