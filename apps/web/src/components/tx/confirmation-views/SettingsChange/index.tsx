import { translateMessage } from '@/i18n'
import type { SettingsChangeTransaction as SettingsChangeType } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { SettingsInfoType } from '@safe-global/store/gateway/types'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Typography } from '@safe-global/views/components/ui/typography'
import EthHashInfo from '@/components/common/EthHashInfo'
import type { NarrowConfirmationViewProps } from '../types'
import { OwnerList } from '@/components/tx-flow/common/OwnerList'
import MinusIcon from '@/public/images/common/minus.svg'
import useSafeInfo from '@/hooks/useSafeInfo'
import { ChangeSignerSetupWarning } from '@/features/multichain'
import { useContext } from 'react'
import { SettingsChangeContext } from '@safe-global/views/components/tx-flow/flows/AddOwner/context'

export interface SettingsChangeProps extends NarrowConfirmationViewProps {
  txInfo: SettingsChangeType
}

const SettingsChange: React.FC<SettingsChangeProps> = ({ txInfo: { settingsInfo } }) => {
  const { safe } = useSafeInfo()
  const params = useContext(SettingsChangeContext)

  if (!settingsInfo || settingsInfo.type === SettingsInfoType.REMOVE_OWNER) return null

  const shouldShowChangeSigner = 'owner' in settingsInfo || 'newOwner' in params
  const hasNewOwner = 'newOwner' in params
  const newSignersLength = safe.owners.length + ('removedOwner' in settingsInfo ? 0 : 1)

  return (
    <>
      {'oldOwner' in settingsInfo && (
        <div className="rounded-lg bg-[var(--color-warning-background)] p-4">
          <div className="text-muted-foreground mb-4 flex items-center">
            <MinusIcon className="mr-2 size-4" />
            {translateMessage('ui.previousSigner_340f5cc1')}
          </div>
          <EthHashInfo
            name={settingsInfo.oldOwner.name}
            address={settingsInfo.oldOwner.value}
            shortAddress={false}
            showCopyButton
            hasExplorer
          />
        </div>
      )}

      {'owner' in settingsInfo && !hasNewOwner && <OwnerList owners={[settingsInfo.owner]} />}
      {hasNewOwner && <OwnerList owners={[{ name: params.newOwner.name, value: params.newOwner.address }]} />}

      {shouldShowChangeSigner && <ChangeSignerSetupWarning />}

      {'threshold' in settingsInfo && (
        <>
          <Separator bleed="6" />

          <div>
            <Typography variant="paragraph-small">
              {translateMessage('ui.anyTransactionRequiresTheConfirmationOf_d009e878')}
            </Typography>
            <Typography>
              <b>{settingsInfo.threshold}</b> {translateMessage('ui.outOf_c83e560c')}
              <b>
                {newSignersLength} {translateMessage('ui.signer_efab2dcb')}
              </b>
            </Typography>
          </div>
        </>
      )}
      <Separator bleed="6" />
    </>
  )
}

export default SettingsChange
