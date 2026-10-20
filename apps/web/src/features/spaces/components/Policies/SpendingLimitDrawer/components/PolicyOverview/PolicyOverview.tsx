import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { ShieldCheck } from 'lucide-react'
import ChainIndicator from '@/components/common/ChainIndicator'
import { DrawerList, DrawerSection, type DrawerListItem } from '@/components/common/Drawer'
import { Link } from '@safe-global/views/components/ui/link'
import { AccountIdentity, type AccountIdentityProps } from '../../../components/AccountIdentity'

export type PolicyOverviewProps = {
  appliesTo: AccountIdentityProps
  chainId: string
  /** Omitted for spending limits — CGW returns no initiator for them. */
  initiatedBy?: AccountIdentityProps
  lastUpdated?: string
  /** Omitted while nothing enforces the policy. Without an `href` the name is plain text, not a dead underline. */
  enforcedBy?: { label: string; href?: string }
}

const PolicyOverview = ({
  appliesTo,
  chainId,
  initiatedBy,
  lastUpdated,
  enforcedBy,
}: PolicyOverviewProps): ReactElement => {
  const items: DrawerListItem[] = [
    { label: translateMessage('ui.account_7e251525'), content: <AccountIdentity {...appliesTo} showCopyButton /> },
    {
      label: translateMessage('ui.network_eb8f6520'),
      content: <ChainIndicator chainId={chainId} inline className="min-w-0! justify-end!" />,
    },
  ]

  if (initiatedBy) {
    items.push({
      label: translateMessage('ui.initiatedBy_63ad62d6'),
      content: <AccountIdentity {...initiatedBy} showCopyButton />,
    })
  }

  if (lastUpdated) {
    items.push({ label: translateMessage('ui.lastUpdated_8cd51832'), content: lastUpdated })
  }

  if (enforcedBy) {
    items.push({
      label: translateMessage('ui.enforcedBy_18db72a9'),
      content: (
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="size-3.5" />
          {/* `inherit` keeps the row's text style; the default link variant is bold and primary. */}
          {enforcedBy.href ? (
            <Link
              href={enforcedBy.href}
              variant="inherit"
              className="underline"
              target="_blank"
              rel="noreferrer noopener"
            >
              {enforcedBy.label}
            </Link>
          ) : (
            <span>{enforcedBy.label}</span>
          )}
        </span>
      ),
    })
  }

  return (
    <DrawerSection title={translateMessage('ui.policyOverview_d78b3715')}>
      <DrawerList items={items} />
    </DrawerSection>
  )
}

export default PolicyOverview
