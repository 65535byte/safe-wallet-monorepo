import { translateMessage } from '@/i18n'
import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'

import css from './styles.module.css'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { SafeFeature } from '@safe-global/protocol-kit'
import { hasSafeFeature } from '@/utils/safe-versions'
import DeleteIcon from '@/public/images/common/delete.svg'
import CheckWallet from '@/components/common/CheckWallet'
import { useContext } from 'react'
import { TxModalContext } from '@/components/tx-flow'
import { RemoveGuardFlow } from '@/components/tx-flow/flows'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import SettingsCard from '@safe-global/views/components/settings/SettingsCard'

const NoTransactionGuard = () => {
  return (
    <Typography className="mt-4 text-muted-foreground">
      {translateMessage('ui.noTransactionGuardSet_97f1da7c')}
    </Typography>
  )
}

const GuardDisplay = ({ guardAddress, chainId }: { guardAddress: string; chainId: string }) => {
  const { setTxFlow } = useContext(TxModalContext)

  return (
    <div className={css.guardDisplay}>
      <EthHashInfo shortAddress={false} address={guardAddress} showCopyButton hasExplorer chainId={chainId} />
      <CheckWallet>
        {(isOk) => (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTxFlow(<RemoveGuardFlow address={guardAddress} />)}
            disabled={!isOk}
          >
            <DeleteIcon className="size-4 text-destructive" />
          </Button>
        )}
      </CheckWallet>
    </div>
  )
}

const TransactionGuards = () => {
  const { safe, safeLoaded } = useSafeInfo()

  const isVersionWithGuards = safeLoaded && hasSafeFeature(SafeFeature.SAFE_TX_GUARDS, safe.version)

  if (!isVersionWithGuards) {
    return null
  }

  return (
    <SettingsCard title={translateMessage('ui.transactionGuards_5ee6b873')}>
      <div>
        <Typography>
          {translateMessage('ui.transactionGuardsImposeAdditionalConstraintsThat_284b9b90')}{' '}
          <ExternalLink className="font-bold hover:text-muted-foreground" href={HelpCenterArticle.TRANSACTION_GUARD}>
            {translateMessage('ui.here_134b2f0e')}
          </ExternalLink>
          .
        </Typography>
        {safe.guard ? <GuardDisplay guardAddress={safe.guard.value} chainId={safe.chainId} /> : <NoTransactionGuard />}
      </div>
    </SettingsCard>
  )
}

export default TransactionGuards
