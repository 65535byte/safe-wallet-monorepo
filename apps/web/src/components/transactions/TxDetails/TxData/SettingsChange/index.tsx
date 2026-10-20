import { translateMessage } from '@/i18n'
import { SettingsInfoType } from '@safe-global/store/gateway/types'
import type { SettingsChangeTransaction } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import type { ComponentProps, ReactElement } from 'react'
import EthHashInfo from '@/components/common/EthHashInfo'
import { InfoDetails } from '@safe-global/views/components/transactions/InfoDetails'
import { ThresholdWarning } from '@/components/transactions/Warning'
import { UntrustedFallbackHandlerWarning } from '@/components/transactions/Warning'
import { useHasUntrustedFallbackHandler } from '@/hooks/useHasUntrustedFallbackHandler'

type SettingsChangeTxInfoProps = {
  settingsInfo: SettingsChangeTransaction['settingsInfo']
  isTxExecuted?: boolean
}

const addressInfoProps: Pick<ComponentProps<typeof EthHashInfo>, 'shortAddress' | 'showCopyButton' | 'hasExplorer'> = {
  shortAddress: false,
  showCopyButton: true,
  hasExplorer: true,
}

const SettingsChangeTxInfo = ({
  settingsInfo,
  isTxExecuted = false,
}: SettingsChangeTxInfoProps): ReactElement | null => {
  const isUntrustedFallbackHandler = useHasUntrustedFallbackHandler(
    settingsInfo?.type === SettingsInfoType.SET_FALLBACK_HANDLER ? settingsInfo.handler.value : undefined,
  )

  if (!settingsInfo) {
    return null
  }

  switch (settingsInfo.type) {
    case SettingsInfoType.SET_FALLBACK_HANDLER: {
      return (
        <>
          <InfoDetails title={translateMessage('ui.setFallbackHandler_b0ac39bf')}>
            <EthHashInfo
              address={settingsInfo.handler.value}
              name={settingsInfo.handler?.name}
              customAvatar={settingsInfo.handler?.logoUri}
              {...addressInfoProps}
            />
          </InfoDetails>
          {isUntrustedFallbackHandler && <UntrustedFallbackHandlerWarning isTxExecuted={isTxExecuted} />}
        </>
      )
    }
    case SettingsInfoType.ADD_OWNER:
    case SettingsInfoType.REMOVE_OWNER: {
      const title =
        settingsInfo.type === SettingsInfoType.ADD_OWNER
          ? translateMessage('ui.addSigner_fa23982e')
          : translateMessage('ui.removeSigner_a12b385b')
      return (
        <>
          <ThresholdWarning />
          <InfoDetails datatestid="owner-action" title={title}>
            <EthHashInfo
              address={settingsInfo.owner.value}
              name={settingsInfo.owner?.name}
              customAvatar={settingsInfo.owner?.logoUri}
              {...addressInfoProps}
            />
            <InfoDetails
              datatestid="required-confirmations"
              title={translateMessage('ui.requiredConfirmationsForNewTransactions_5c5fcf18')}
            >
              {settingsInfo.threshold}
            </InfoDetails>
          </InfoDetails>
        </>
      )
    }
    case SettingsInfoType.SWAP_OWNER: {
      return (
        <InfoDetails datatestid="swap-owner" title={translateMessage('ui.swapSigner_d86cb33e')}>
          <InfoDetails datatestid="old-owner" title={translateMessage('ui.oldSigner_754bb60e')}>
            <EthHashInfo
              address={settingsInfo.oldOwner.value}
              name={settingsInfo.oldOwner?.name}
              customAvatar={settingsInfo.oldOwner?.logoUri}
              {...addressInfoProps}
            />
          </InfoDetails>
          <InfoDetails datatestid="new-owner" title={translateMessage('ui.newSigner_ea3ff983')}>
            <EthHashInfo
              address={settingsInfo.newOwner.value}
              name={settingsInfo.newOwner?.name}
              customAvatar={settingsInfo.newOwner?.logoUri}
              {...addressInfoProps}
            />
          </InfoDetails>
        </InfoDetails>
      )
    }
    case SettingsInfoType.CHANGE_THRESHOLD: {
      return (
        <>
          <ThresholdWarning />
          <InfoDetails
            datatestid="required-confirmations"
            title={translateMessage('ui.requiredConfirmationsForNewTransactions_5c5fcf18')}
          >
            {settingsInfo.threshold}
          </InfoDetails>
        </>
      )
    }
    case SettingsInfoType.CHANGE_IMPLEMENTATION: {
      return (
        <InfoDetails title={translateMessage('ui.changeImplementation_41b08668')}>
          <EthHashInfo
            address={settingsInfo.implementation.value}
            name={settingsInfo.implementation?.name}
            customAvatar={settingsInfo.implementation?.logoUri}
            {...addressInfoProps}
          />
        </InfoDetails>
      )
    }
    case SettingsInfoType.ENABLE_MODULE:
    case SettingsInfoType.DISABLE_MODULE: {
      const title =
        settingsInfo.type === SettingsInfoType.ENABLE_MODULE
          ? translateMessage('ui.enableModule_48c868ae')
          : translateMessage('ui.disableModule_92a99b34')
      return (
        <InfoDetails datatestid="module-action" title={title}>
          <EthHashInfo
            address={settingsInfo.module.value}
            name={settingsInfo.module?.name}
            customAvatar={settingsInfo.module?.logoUri}
            {...addressInfoProps}
          />
        </InfoDetails>
      )
    }
    case SettingsInfoType.SET_GUARD: {
      return (
        <InfoDetails title={translateMessage('ui.setGuard_9981bdd6')}>
          <EthHashInfo
            address={settingsInfo.guard.value}
            name={settingsInfo.guard?.name}
            customAvatar={settingsInfo.guard?.logoUri}
            {...addressInfoProps}
          />
        </InfoDetails>
      )
    }
    case SettingsInfoType.DELETE_GUARD: {
      return <InfoDetails title={translateMessage('ui.deleteGuard_79de9905')} />
    }
    default:
      return <></>
  }
}

export default SettingsChangeTxInfo
