import { translateMessage } from '@safe-global/views/i18n'
import { Badge, BadgeDot } from '@safe-global/views/components/ui/badge'
import type { PolicyStatus } from '../types'

const BADGE_BY_STATUS: Record<
  PolicyStatus,
  { label: string; variant: 'success' | 'warning' | 'secondary' | 'destructive' }
> = {
  active: { label: translateMessage('ui.active_889c3246'), variant: 'success' },
  pending: { label: translateMessage('ui.pending_c096ae70'), variant: 'warning' },
  activating: { label: translateMessage('ui.activating_a907caf8'), variant: 'warning' },
  // A configured module that is not enabled enforces nothing, so it is not called active.
  unenforced: { label: translateMessage('ui.notEnforced_3cf9c70a'), variant: 'secondary' },
  'not-activated': { label: translateMessage('ui.notActivated_6a9f8fff'), variant: 'destructive' },
}

/** Status of a policy, matching the 2FA status badges on the Team table. */
const PolicyStatusChip = ({ status }: { status: PolicyStatus }) => {
  const { label, variant } = BADGE_BY_STATUS[status]

  return (
    <Badge variant={variant} size="status" shape="status" data-testid={`policy-status-${status}`}>
      <BadgeDot />
      {label}
    </Badge>
  )
}

export default PolicyStatusChip
