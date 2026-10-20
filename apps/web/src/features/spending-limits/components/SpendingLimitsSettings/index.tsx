import { translateMessage } from '@/i18n'
import { useContext } from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Button } from '@safe-global/views/components/ui/button'
import AddIcon from '@/public/images/common/add.svg'
import { NoSpendingLimits } from '@safe-global/views/features/spending-limits/components/SpendingLimitsSettings/NoSpendingLimits'
import { SpendingLimitsTable } from './SpendingLimitsTable'
import { useHasFeature } from '@/hooks/useChains'
import { NewSpendingLimitFlow } from '@/components/tx-flow/flows'
import { SETTINGS_EVENTS, UpgradeFeature } from '@/services/analytics'
import CheckWallet from '@/components/common/CheckWallet'
import SafeProLock from '@/components/common/SafeProLock'
import Track from '@/components/common/Track'
import { TxModalContext } from '@/components/tx-flow'
import { FEATURES } from '@safe-global/utils/utils/chains'
import { useAppSelector } from '@/store'
import { usePlanGate } from '@/features/spaces'
import { selectSpendingLimits, selectSpendingLimitsLoading } from '../../store/spendingLimitsSlice'
import useIsSpendingLimitSupported from '../../hooks/useIsSpendingLimitSupported'

const SpendingLimitsSettings = () => {
  const { setTxFlow } = useContext(TxModalContext)
  const isEnabled = useHasFeature(FEATURES.SPENDING_LIMIT)
  const isSupported = useIsSpendingLimitSupported()
  const {
    mustUpgradeToSafePro,
    isLoading: isPlanLoading,
    upgradeHref,
    showProTag,
  } = usePlanGate(FEATURES.SPENDING_LIMIT_GATING)

  // Read data from store (loaded on app start via SpendingLimitsLoader)
  const spendingLimits = useAppSelector(selectSpendingLimits)
  const spendingLimitsLoading = useAppSelector(selectSpendingLimitsLoading)

  const renderNewSpendingLimitButton = (
    <CheckWallet>
      {(isOk) => (
        <Track {...SETTINGS_EVENTS.SPENDING_LIMIT.NEW_LIMIT}>
          <Button
            data-testid="new-spending-limit"
            variant="outline"
            size="lg"
            onClick={() => setTxFlow(<NewSpendingLimitFlow />)}
            className="my-4"
            disabled={!isOk}
          >
            <AddIcon className="size-4" />
            {translateMessage('ui.addSpendingLimit_5fbab29f')}
            {showProTag && (
              <span className="block h-5 w-8" role="img" aria-label="8379" data-testid="pro-tag">
                <img src="/images/brand-logo.png" alt="" className="size-full object-contain" />
              </span>
            )}
          </Button>
        </Track>
      )}
    </CheckWallet>
  )

  return (
    <div data-testid="spending-limit-section" className="bg-card text-card-foreground rounded-lg p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row">
        <div className="lg:w-1/5 lg:shrink-0">
          <Typography variant="h4" className="font-bold">
            {translateMessage('ui.spendingLimits_a36dee76')}
          </Typography>
        </div>

        <div className="lg:min-w-0 lg:flex-1">
          {isEnabled ? (
            <div>
              <Typography>{translateMessage('ui.youCanSetRulesForSpecific_60a4c68a')}</Typography>

              {isSupported ? (
                mustUpgradeToSafePro ? (
                  <div className="my-4">
                    <SafeProLock
                      title={translateMessage('ui.addingSpendingLimitsRequires_ce4cfab2')}
                      href={upgradeHref}
                      feature={UpgradeFeature.SPENDING_LIMITS}
                    />
                  </div>
                ) : (
                  !isPlanLoading && renderNewSpendingLimitButton
                )
              ) : (
                <Typography className="mt-4 block">
                  {translateMessage('ui.theSpendingLimitModuleIsnT_494192ef')}
                </Typography>
              )}

              {isSupported && !spendingLimits.length && !spendingLimitsLoading && <NoSpendingLimits />}
              {spendingLimits.length > 0 && (
                <SpendingLimitsTable isLoading={spendingLimitsLoading} spendingLimits={spendingLimits} />
              )}
            </div>
          ) : (
            <Typography>{translateMessage('ui.theSpendingLimitFeatureIsNot_c1f39b0d')}</Typography>
          )}
        </div>
      </div>
    </div>
  )
}

export default SpendingLimitsSettings
