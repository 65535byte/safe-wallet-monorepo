import { translateMessage } from '@/i18n'
import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'

import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { RemoveModuleFlow } from '@/components/tx-flow/flows'
import DeleteIcon from '@/public/images/common/delete.svg'
import CheckWallet from '@/components/common/CheckWallet'
import { useContext } from 'react'
import { TxModalContext } from '@/components/tx-flow'
import { RemoveRecoveryFlow } from '@/components/tx-flow/flows'
import { RecoveryFeature, useRecovery } from '@/features/recovery'
import { useLoadFeature } from '@/features/__core__'
import SettingsCard from '@safe-global/views/components/settings/SettingsCard'

import css from '../TransactionGuards/styles.module.css'

const NoModules = () => {
  return (
    <Typography className="mt-4 text-muted-foreground">{translateMessage('ui.noModulesEnabled_a95c2650')}</Typography>
  )
}

const ModuleDisplay = ({ moduleAddress, chainId, name }: { moduleAddress: string; chainId: string; name?: string }) => {
  const { setTxFlow } = useContext(TxModalContext)
  const [recovery] = useRecovery()
  const { selectDelayModifierByAddress, $isReady } = useLoadFeature(RecoveryFeature)
  const delayModifier = recovery && selectDelayModifierByAddress?.(recovery, moduleAddress)

  const onRemove = () => {
    if (delayModifier) {
      setTxFlow(<RemoveRecoveryFlow delayModifier={delayModifier} />)
    } else {
      setTxFlow(<RemoveModuleFlow address={moduleAddress} />)
    }
  }

  return (
    <div className={css.guardDisplay}>
      <EthHashInfo
        name={name}
        shortAddress={false}
        address={moduleAddress}
        showCopyButton
        chainId={chainId}
        hasExplorer
      />
      <CheckWallet>
        {(isOk) => (
          <Button
            data-testid="module-remove-btn"
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            disabled={!isOk || !$isReady}
            title={translateMessage('ui.removeModule_8ec1b493')}
          >
            <DeleteIcon className="size-4 text-destructive" />
          </Button>
        )}
      </CheckWallet>
    </div>
  )
}

const SafeModules = () => {
  const { safe } = useSafeInfo()
  const safeModules = safe.modules || []

  return (
    <SettingsCard title={translateMessage('ui.modules_a3e65cf6')}>
      <div>
        <Typography>
          {translateMessage('ui.modulesAllowYouToCustomizeThe_b4693bc0')}{' '}
          <ExternalLink
            className="font-bold hover:text-muted-foreground"
            href="https://help.safe.global/articles/5490514177-What-is-a-module?"
          >
            {translateMessage('ui.here_134b2f0e')}
          </ExternalLink>
        </Typography>
        {safeModules.length === 0 ? (
          <NoModules />
        ) : (
          safeModules.map((module) => (
            <ModuleDisplay
              key={module.value}
              chainId={safe.chainId}
              moduleAddress={module.value}
              name={module.name || undefined}
            />
          ))
        )}
      </div>
    </SettingsCard>
  )
}

export default SafeModules
