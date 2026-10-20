import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { Badge } from '@safe-global/views/components/ui/badge'
import { Typography } from '@safe-global/views/components/ui/typography'
import { AccountIdentity } from '../../../components/AccountIdentity'
import type { SignatureSafeInfo } from '@safe-global/views/features/spaces/components/Policies/ProposerDrawer/components/SafeSignatureInfo/types'

export type { SignatureSafeInfo } from '@safe-global/views/features/spaces/components/Policies/ProposerDrawer/components/SafeSignatureInfo/types'

export type SafeSignatureInfoProps = {
  safe: SignatureSafeInfo
  signatures: number
  label?: string
  badgeVariant?: 'warning' | 'destructive'
}

const SafeSignatureInfo = ({
  safe,
  signatures,
  label = translateMessage('ui.parentAccount_d16d4813'),
  badgeVariant,
}: SafeSignatureInfoProps): ReactElement => (
  <div className="flex w-full items-center justify-between gap-3 rounded-lg bg-muted p-3">
    <div className="flex shrink-0 items-center gap-1">
      <Typography variant="paragraph-small-medium">{label}</Typography>
      <Badge
        variant={badgeVariant ?? (signatures >= safe.threshold ? 'success' : 'warning')}
        size="status"
        shape="status"
        data-testid="safe-signature-progress"
      >
        {signatures} / {safe.threshold} {translateMessage('ui.signed_8f035951')}
      </Badge>
    </div>

    <div className="flex min-w-0 justify-end">
      <AccountIdentity address={safe.address} name={safe.name} />
    </div>
  </div>
)

export default SafeSignatureInfo
