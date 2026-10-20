import { translateMessage } from '@/i18n'
import { ChevronRight } from 'lucide-react'
import { shortenAddress } from '@safe-global/utils/utils/formatters'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import EthHashInfo from '@/components/common/EthHashInfo'
import { useSafeNameResolver } from '@/hooks/useAllAddressBooks'
import useChains from '@/hooks/useChains'
import ChainIndicator from '@/components/common/ChainIndicator'
import PaginatedDataTable, { type DataTableColumn } from '@safe-global/views/components/common/PaginatedDataTable'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import PolicyRule from '@safe-global/views/features/spaces/components/Policies/PoliciesTable/components/PolicyRule'
import PolicyTokens from './components/PolicyTokens'
import PolicyStatusChip from '@safe-global/views/features/spaces/components/Policies/components/PolicyStatusChip'
import { getPolicyLabel } from '@safe-global/views/features/spaces/components/Policies/utils/policyLabel'
import { AppRoutes } from '@/config/routes'
import { buildSafeHref } from '@/features/spaces/utils/safeHref'
import { useUrlSpaceId } from '@/hooks/useUrlSpaceId'
import {
  getPolicyStatus,
  isProposerPolicy,
  type Policy,
} from '@safe-global/views/features/spaces/components/Policies/types'

export type PoliciesTableProps = {
  policies: Policy[]
  /** Shown in the row because spenders are otherwise only in the detail panel. */
  matchedSpenderNames?: Map<string, string>
  onSelect?: (policy: Policy) => void
}

/** Every row needs its own name: a screen reader lists them side by side. */
const getOpenPolicyLabel = (policy: Policy): string =>
  translateMessage('ui.openFor_e074b35a', { p0: getPolicyLabel(policy), p1: shortenAddress(policy.safe.address) })

/**
 * One row per Safe, chain and policy. A spending-limit policy holds every spender for its Safe, so
 * a Safe with five spenders is a single row and the spenders are listed in the detail panel.
 *
 * Revoked policies are not in the CGW response, so nothing here has to filter them out.
 */
const PoliciesTable = ({ policies, matchedSpenderNames, onSelect }: PoliciesTableProps) => {
  const resolveSafeName = useSafeNameResolver()
  const { configs } = useChains()
  const spaceId = useUrlSpaceId()
  const getShortName = (chainId: string) => configs.find((chain) => chain.chainId === chainId)?.shortName

  const columns: DataTableColumn<Policy>[] = [
    {
      id: 'rule',
      header: translateMessage('ui.rULE_7c6989a7'),
      width: 'fit',
      sticky: true,
      minWidth: 256,
      cellTestId: 'policy-cell-rule',
      cell: (policy) => <PolicyRule policy={policy} />,
    },
    {
      id: 'appliesTo',
      header: translateMessage('ui.sAFEACCOUNT_06a170e3'),
      minWidth: 200,
      cellTestId: 'policy-cell-applies-to',
      cell: (policy) => (
        <EthHashInfo
          address={policy.safe.address}
          chainId={policy.safe.chainId}
          name={resolveSafeName(policy.safe.address, policy.safe.chainId) || undefined}
          shortAddress
          showPrefix={false}
          highlight4bytes
          showCopyButton
          showAddressTooltip
          boldLabel
          avatarSize={24}
          href={buildSafeHref(
            AppRoutes.settings.setup,
            getShortName(policy.safe.chainId),
            policy.safe.address,
            spaceId,
          )}
        />
      ),
    },
    {
      id: 'proposerTokens',
      header: translateMessage('ui.pROPOSERTOKENS_a9159ea8'),
      minWidth: 200,
      cellTestId: 'policy-cell-proposer-tokens',
      cell: (policy) => {
        if (!isProposerPolicy(policy)) {
          const matchedSpender = matchedSpenderNames?.get(policy.id)

          return (
            <div className="flex min-w-0 flex-col gap-1">
              <PolicyTokens policy={policy} />
              {matchedSpender && (
                <Typography
                  variant="paragraph-small"
                  className="truncate text-muted-foreground"
                  data-testid="policy-matched-spender"
                >
                  {translateMessage('ui.spender_e6acfa7f')}
                  {matchedSpender}
                </Typography>
              )}
            </div>
          )
        }

        const [proposer] = policy.data.proposers
        if (!proposer) return null

        return (
          <EthHashInfo
            address={proposer.proposer}
            chainId={policy.safe.chainId}
            shortAddress
            showPrefix={false}
            highlight4bytes
            showCopyButton
            showAddressTooltip
            boldLabel
            avatarSize={24}
          />
        )
      },
    },
    {
      id: 'network',
      header: translateMessage('ui.nETWORK_8f296489'),
      width: 'fit',
      minWidth: 96,
      align: 'center',
      priority: 'secondary',
      cellTestId: 'policy-cell-network',
      cell: (policy) => (
        <div className="flex justify-center">
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <ChainIndicator chainId={policy.safe.chainId} onlyLogo showUnknown imageSize={24} />
            </TooltipTrigger>
            <TooltipContent className="bg-popover text-popover-foreground ring-foreground/10 shadow-md ring-1 [&>[data-side]]:hidden">
              <span data-testid="policy-network-tooltip">
                <ChainIndicator chainId={policy.safe.chainId} showUnknown />
              </span>
            </TooltipContent>
          </Tooltip>
        </div>
      ),
    },
    {
      id: 'status',
      header: translateMessage('ui.sTATUS_b843dcfd'),
      width: 'fit',
      minWidth: 140,
      cellTestId: 'policy-cell-status',
      cell: (policy) => <PolicyStatusChip status={getPolicyStatus(policy)} />,
    },
    {
      id: 'open',
      header: '',
      align: 'end',
      width: 'fit',
      minWidth: 64,
      cell: (policy) =>
        onSelect ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={getOpenPolicyLabel(policy)}
            onClick={() => onSelect(policy)}
            data-testid="policy-open-button"
          >
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </Button>
        ) : (
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        ),
    },
  ]

  return (
    <PaginatedDataTable columns={columns} rows={policies} getRowKey={(policy) => policy.id} onRowClick={onSelect} />
  )
}

export default PoliciesTable
