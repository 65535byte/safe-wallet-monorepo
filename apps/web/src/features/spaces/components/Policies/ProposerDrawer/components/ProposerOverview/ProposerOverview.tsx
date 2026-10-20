import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { ShieldCheck } from 'lucide-react'
import ChainIndicator from '@/components/common/ChainIndicator'
import { DrawerList, DrawerSection } from '@/components/common/Drawer'
import { Skeleton } from '@safe-global/views/components/ui/skeleton'
import { AccountIdentity, AccountIdentitySkeleton } from '../../../components/AccountIdentity'
import type { ProposerOverviewProps } from '@safe-global/views/features/spaces/components/Policies/ProposerDrawer/components/ProposerOverview/types'

export type { ProposerOverviewProps } from '@safe-global/views/features/spaces/components/Policies/ProposerDrawer/components/ProposerOverview/types'

const ProposerOverview = ({
  proposer,
  appliesTo,
  initiatedBy,
  chainId,
  lastUpdated,
  enforcedBy,
}: ProposerOverviewProps): ReactElement => (
  <DrawerSection title={translateMessage('ui.policyOverview_d78b3715')}>
    <DrawerList
      items={[
        { label: translateMessage('ui.proposer_7ebd3069'), content: <AccountIdentity {...proposer} showCopyButton /> },
        { label: translateMessage('ui.account_7e251525'), content: <AccountIdentity {...appliesTo} showCopyButton /> },
        {
          label: translateMessage('ui.initiatedBy_63ad62d6'),
          content: <AccountIdentity {...initiatedBy} showCopyButton />,
        },
        {
          label: translateMessage('ui.network_eb8f6520'),
          content: <ChainIndicator chainId={chainId} inline className="min-w-0! justify-end!" />,
        },
        { label: translateMessage('ui.lastUpdated_8cd51832'), content: lastUpdated },
        {
          label: translateMessage('ui.enforcedBy_18db72a9'),
          content: (
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="size-3.5" />
              <span>{enforcedBy}</span>
            </span>
          ),
        },
      ]}
    />
  </DrawerSection>
)

export default ProposerOverview

export const ProposerOverviewSkeleton = (): ReactElement => (
  <DrawerSection title={translateMessage('ui.policyOverview_d78b3715')}>
    <DrawerList
      items={[
        { label: translateMessage('ui.proposer_7ebd3069'), content: <AccountIdentitySkeleton /> },
        { label: translateMessage('ui.account_7e251525'), content: <AccountIdentitySkeleton /> },
        { label: translateMessage('ui.initiatedBy_63ad62d6'), content: <AccountIdentitySkeleton /> },
        {
          label: translateMessage('ui.network_eb8f6520'),
          content: <Skeleton className="ml-auto h-4 w-24 bg-border" />,
        },
        {
          label: translateMessage('ui.lastUpdated_8cd51832'),
          content: <Skeleton className="ml-auto h-4 w-36 bg-border" />,
        },
        {
          label: translateMessage('ui.enforcedBy_18db72a9'),
          content: <Skeleton className="ml-auto h-4 w-24 bg-border" />,
        },
      ]}
    />
  </DrawerSection>
)
