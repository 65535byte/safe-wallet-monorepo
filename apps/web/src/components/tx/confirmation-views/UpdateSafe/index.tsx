import { translateMessage } from '@/i18n'
import type { TransactionData } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import type { ReactNode } from 'react'
import { Alert, AlertTitle, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Typography } from '@safe-global/views/components/ui/typography'
import semverSatisfies from 'semver/functions/satisfies'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useQueuedTxsLength } from '@/hooks/useTxQueue'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import madProps from '@/utils/mad-props'
import { extractTargetVersionFromUpdateSafeTx } from '@/services/tx/safeUpdateParams'

const QUEUE_WARNING_VERSION = '<1.3.0'

function BgBox({ children, light, warning }: { children: ReactNode; light?: boolean; warning?: boolean }) {
  const bgcolor = warning
    ? 'bg-[var(--color-warning-background)]'
    : light
      ? 'bg-[var(--color-background-light)]'
      : 'bg-[var(--color-border-background)]'
  return <div className={`flex-1 rounded-md p-4 text-center text-lg font-bold ${bgcolor}`}>{children}</div>
}

export function _UpdateSafe({
  safeInfo,
  queueSize,
  chain,
  txData,
}: {
  safeInfo: ReturnType<typeof useSafeInfo>
  queueSize: string
  chain: ReturnType<typeof useCurrentChain>
  txData: TransactionData | undefined
}) {
  const { safe } = safeInfo
  if (!safe.version) {
    return null
  }
  const showQueueWarning = queueSize && semverSatisfies(safe.version, QUEUE_WARNING_VERSION)
  const newVersion = extractTargetVersionFromUpdateSafeTx(txData, safe)

  return (
    <>
      <div className="flex flex-row items-center gap-4">
        <BgBox>
          {translateMessage('ui.currentVersion_f5982e4c')}
          {safe.version}
        </BgBox>
        <div className="text-[28px]">→</div>
        {newVersion !== undefined ? (
          <BgBox light>
            {translateMessage('ui.newVersion_f7b2ccbf')}
            {newVersion} {chain?.l2 ? '+L2' : ''}
          </BgBox>
        ) : (
          <BgBox warning>{translateMessage('ui.unknownContract_b055a753')}</BgBox>
        )}
      </div>
      {newVersion !== undefined ? (
        <Typography>
          {translateMessage('ui.readAboutTheUpdatesInThe_2d307a00')}{' '}
          <ExternalLink href={`https://github.com/safe-global/safe-contracts/releases/tag/v${newVersion}`}>
            {translateMessage('ui.version_3e8aea50')}
            {newVersion} {translateMessage('ui.changelog_cdc8ee84')}
          </ExternalLink>
        </Typography>
      ) : (
        <Alert variant="destructive">
          <AlertSeverityIcon variant="destructive" />
          <AlertTitle>{translateMessage('ui.unknownContract_b055a753')}</AlertTitle>
          <AlertDescription>{translateMessage('ui.theTargetContractForThisUpgrade_3fa57b28')}</AlertDescription>
        </Alert>
      )}

      {showQueueWarning && (
        <Alert variant="warning" outlined={false}>
          <AlertSeverityIcon variant="warning" />
          <AlertTitle>{translateMessage('ui.thisUpgradeWillInvalidateAllQueued_fc4d8d91')}</AlertTitle>
          <AlertDescription>
            {translateMessage('ui.youHave_456979c4')}
            {queueSize} {translateMessage('ui.unexecutedTransaction_f98a08ca', { count: queueSize })}
          </AlertDescription>
        </Alert>
      )}

      <Separator className="mx-[-24px] my-2" />
    </>
  )
}

const UpdateSafe = madProps(_UpdateSafe, {
  chain: useCurrentChain,
  safeInfo: useSafeInfo,
  queueSize: useQueuedTxsLength,
})

export default UpdateSafe
