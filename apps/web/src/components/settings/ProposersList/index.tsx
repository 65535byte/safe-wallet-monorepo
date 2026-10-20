import { translateMessage } from '@/i18n'
import EnhancedTable from '@safe-global/views/components/common/EnhancedTable'
import tableCss from '@safe-global/views/components/common/EnhancedTable/styles.module.css'
import CheckWallet from '@/components/common/CheckWallet'
import SafeProLock from '@/components/common/SafeProLock'
import Track from '@/components/common/Track'
import {
  AddProposer,
  DeleteProposerDialog,
  EditProposerDialog,
  PendingDelegationsList,
  useMigrateProposerLabels,
  useParentSafeThreshold,
} from '@/features/proposers'
import { usePlanGate } from '@/features/spaces'
import { useHasFeature } from '@/hooks/useChains'
import useProposers from '@/hooks/useProposers'
import { useIsNestedSafeOwner } from '@/hooks/useIsNestedSafeOwner'
import { useNestedSafeOwners } from '@/hooks/useNestedSafeOwners'
import AddIcon from '@/public/images/common/add.svg'
import { SETTINGS_EVENTS, UpgradeFeature } from '@/services/analytics'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import EthHashInfo from '@/components/common/EthHashInfo'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { useMemo, useState } from 'react'
import { FEATURES } from '@safe-global/utils/utils/chains'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import useSafeInfo from '@/hooks/useSafeInfo'
import NamedAddressInfo from '@/components/common/NamedAddressInfo'

const headCells = [
  {
    id: 'proposer',
    label: translateMessage('ui.proposer_7ebd3069'),
  },
  {
    id: 'creator',
    label: translateMessage('ui.creator_afb328f8'),
  },
  {
    id: 'Actions',
    label: '',
  },
]
const SafeNotActivated = translateMessage('ui.youNeedToActivateTheBefore_7b9ac818')

const AddProposerButton = ({
  onAdd,
  isUndeployedSafe,
  showProTag,
}: {
  onAdd: () => void
  isUndeployedSafe: boolean
  showProTag: boolean
}) => (
  <div className="mb-4">
    <CheckWallet allowProposer={false}>
      {(isOk) => (
        <Track {...SETTINGS_EVENTS.PROPOSERS.ADD_PROPOSER}>
          <Tooltip>
            <TooltipTrigger
              render={
                <span>
                  <Button
                    data-testid="add-proposer-btn"
                    variant="outline"
                    size="lg"
                    onClick={onAdd}
                    disabled={!isOk || isUndeployedSafe}
                  >
                    <AddIcon className="size-4" />
                    {translateMessage('ui.addProposer_3464147e')}
                    {showProTag && (
                      <span className="block h-5 w-8" role="img" aria-label="8379" data-testid="pro-tag">
                        <img src="/images/brand-logo.png" alt="" className="size-full object-contain" />
                      </span>
                    )}
                  </Button>
                </span>
              }
            />
            {isUndeployedSafe && <TooltipContent>{SafeNotActivated}</TooltipContent>}
          </Tooltip>
        </Track>
      )}
    </CheckWallet>
  </div>
)

const ProposersList = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>()
  const proposers = useProposers()
  const isEnabled = useHasFeature(FEATURES.PROPOSERS)
  const {
    mustUpgradeToSafePro,
    isLoading: isPlanLoading,
    upgradeHref,
    showProTag,
  } = usePlanGate(FEATURES.PROPOSER_GATING)
  useMigrateProposerLabels()
  const { safe } = useSafeInfo()
  const isUndeployedSafe = !safe.deployed
  const isNestedSafeOwner = useIsNestedSafeOwner()
  const nestedSafeOwners = useNestedSafeOwners()
  const { threshold: parentThreshold } = useParentSafeThreshold(nestedSafeOwners?.[0])
  const showPendingDelegations = isNestedSafeOwner && parentThreshold !== undefined && parentThreshold > 1

  const rows = useMemo(() => {
    if (!proposers.data) return []

    return proposers.data.results.map((proposer) => {
      return {
        cells: {
          proposer: {
            rawValue: proposer.delegate,
            content: <NamedAddressInfo address={proposer.delegate} showCopyButton hasExplorer shortAddress />,
          },

          creator: {
            rawValue: proposer.delegator,
            content: <EthHashInfo address={proposer.delegator} showCopyButton hasExplorer shortAddress />,
          },
          actions: {
            rawValue: '',
            content: isEnabled && (
              <div className={tableCss.actions}>
                <EditProposerDialog proposer={proposer} />
                <DeleteProposerDialog proposer={proposer} />
              </div>
            ),
          },
        },
      }
    })
  }, [isEnabled, proposers.data])

  if (!proposers.data?.results) return null

  const onAdd = () => {
    setIsAddDialogOpen(true)
  }

  return (
    <div data-testid="proposer-section">
      <Typography variant="paragraph-bold" className="mb-4">
        {translateMessage('ui.proposers_8aaa6a22')}
      </Typography>
      <Typography className="mb-4">
        {translateMessage('ui.proposersCanSuggestTransactionsButCannot_dc702dd7')}{' '}
        <ExternalLink className="font-bold hover:text-muted-foreground" href={HelpCenterArticle.PROPOSERS}>
          {translateMessage('ui.learnMore_0c11daba')}
        </ExternalLink>
      </Typography>

      {showPendingDelegations && <PendingDelegationsList />}

      {isEnabled &&
        (mustUpgradeToSafePro ? (
          <div className="mb-4">
            <SafeProLock
              title={translateMessage('ui.addingProposersRequires_74ef2c78')}
              href={upgradeHref}
              feature={UpgradeFeature.PROPOSERS}
            />
          </div>
        ) : (
          !isPlanLoading && (
            <AddProposerButton onAdd={onAdd} isUndeployedSafe={isUndeployedSafe} showProTag={showProTag} />
          )
        ))}

      {rows.length > 0 && <EnhancedTable rows={rows} headCells={headCells} />}

      {isAddDialogOpen && (
        <AddProposer onClose={() => setIsAddDialogOpen(false)} onSuccess={() => setIsAddDialogOpen(false)} />
      )}
    </div>
  )
}

export default ProposersList
