import { translateMessage } from '@/i18n'
import type { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import { Avatar, AvatarImage } from '@safe-global/views/components/ui/avatar'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import ChainIndicator from '@/components/common/ChainIndicator'
import type { AppInfo } from '@/services/safe-wallet-provider'
import { useLoadFeature } from '@/features/__core__'
import { type SafeItem } from '@/hooks/safes'
import { MyAccountsFeature, useSafeItemData } from '@/features/myAccounts'

type WcChainSwitchModalProps = {
  appInfo: AppInfo
  chain: Chain
  safes: SafeItem[]
  onSelectSafe: (safe: SafeItem) => Promise<void>
  onCancel: () => void
}

function WcSafeItem({ safeItem, onSelect }: { safeItem: SafeItem; onSelect: () => void }) {
  const { AccountItemButton, AccountItemIcon, AccountItemInfo, AccountItemBalance } = useLoadFeature(MyAccountsFeature)
  const { name, safeOverview, threshold, owners, undeployedSafe, elementRef } = useSafeItemData(safeItem)

  return (
    <AccountItemButton onClick={onSelect} elementRef={elementRef}>
      <AccountItemIcon
        address={safeItem.address}
        chainId={safeItem.chainId}
        threshold={threshold}
        owners={owners.length}
      />
      <AccountItemInfo address={safeItem.address} chainId={safeItem.chainId} name={name} />
      <AccountItemBalance fiatTotal={safeOverview?.fiatTotal} isLoading={!safeOverview && !undeployedSafe} />
    </AccountItemButton>
  )
}

const WcChainSwitchModal = ({ appInfo, chain, safes, onSelectSafe, onCancel }: WcChainSwitchModalProps) => {
  const hasSafes = safes.length > 0

  return (
    <div className="flex min-w-auto flex-col gap-6 sm:min-w-[390px]">
      <div className="flex flex-row items-center gap-4">
        {appInfo.iconUrl ? (
          <Avatar className="size-12">
            <AvatarImage src={appInfo.iconUrl} alt={appInfo.name} />
          </Avatar>
        ) : null}
        <div>
          <Typography variant="h4">{appInfo.name}</Typography>
          <div className="flex flex-row items-center gap-2">
            <Typography variant="paragraph-small">{translateMessage('ui.wantsToSwitchTo_7f8862cf')}</Typography>
            <ChainIndicator chainId={chain.chainId} onlyLogo />
            <Typography variant="paragraph-small-bold">{chain.chainName}</Typography>
          </div>
        </div>
      </div>

      <Typography variant="paragraph-small" className="text-muted-foreground">
        {hasSafes
          ? translateMessage('ui.selectOneOfYourAccountsOn_862cccf3', { p0: chain.chainName })
          : translateMessage('ui.connectedDappWantsToSwitchTo_608a05fe', { p0: chain.chainName })}
      </Typography>

      {hasSafes ? (
        <div className="max-h-[440px] overflow-y-auto">
          {safes.map((safe) => (
            <WcSafeItem key={`${safe.chainId}-${safe.address}`} safeItem={safe} onSelect={() => onSelectSafe(safe)} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-border-light)] p-4">
          <Typography variant="paragraph-small">{translateMessage('ui.youCanLoadOrCreateA_b16d83c2')}</Typography>
        </div>
      )}

      <Button variant="outline" onClick={onCancel} className="self-start">
        {translateMessage('ui.cancel_d94a8eaf')}
      </Button>
    </div>
  )
}

export default WcChainSwitchModal
