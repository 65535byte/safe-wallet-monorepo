import { translateMessage } from '@/i18n'
import { AppRoutes } from '@/config/routes'
import { useIsRecoverySupported, useRecovery } from '@/features/recovery'
import dynamic from 'next/dynamic'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { useRouter } from 'next/router'
import { useContext } from 'react'
import ModalDialog from '@/components/common/ModalDialog'
import ChoiceButton from '@safe-global/views/components/common/ChoiceButton'
import { TxModalContext } from '@/components/tx-flow'
import { AddOwnerFlow, TokenTransferFlow, UpsertRecoveryFlow } from '@/components/tx-flow/flows'
const ActivateAccountFlow = dynamic(() => import('../ActivateAccountFlow'))
import { useTxBuilderApp } from '@/hooks/safe-apps/useTxBuilderApp'
import AssetsIcon from '@safe-global/views/assets/images/sidebar/assets.svg'
import SaveAddressIcon from '@/public/images/common/save-address.svg'
import RecoveryPlus from '@safe-global/views/assets/images/common/recovery-plus.svg'
import SwapIcon from '@/public/images/common/swap.svg'
import type { ComponentProps } from 'react'

import { Wrench } from 'lucide-react'
import { useIsSwapFeatureEnabled } from '@/features/swap'

const BrandLogo = (props: ComponentProps<'img'>) => (
  <img {...props} src="/images/brand-logo.png" alt={translateMessage('ui.safeLogo_9a51e835')} />
)

const FirstTxFlow = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const txBuilder = useTxBuilderApp()
  const router = useRouter()
  const { setTxFlow } = useContext(TxModalContext)
  const supportsRecovery = useIsRecoverySupported()
  const [recovery] = useRecovery()
  const isSwapFeatureEnabled = useIsSwapFeatureEnabled()

  const handleClick = (onClick: () => void) => {
    onClose()
    onClick()
  }

  const onSendToken = () => {
    trackEvent({ ...OVERVIEW_EVENTS.CHOOSE_TRANSACTION_TYPE, label: 'send_token' })
    setTxFlow(<TokenTransferFlow />)
  }

  const onActivateSafe = () => {
    trackEvent({ ...OVERVIEW_EVENTS.CHOOSE_TRANSACTION_TYPE, label: 'activate_safe' })
    setTxFlow(<ActivateAccountFlow />)
  }

  const onAddSigner = () => {
    trackEvent({ ...OVERVIEW_EVENTS.CHOOSE_TRANSACTION_TYPE, label: 'add_signer' })
    setTxFlow(<AddOwnerFlow />)
  }

  const onRecovery = () => {
    trackEvent({ ...OVERVIEW_EVENTS.CHOOSE_TRANSACTION_TYPE, label: 'setup_recovery' })
    setTxFlow(<UpsertRecoveryFlow />)
  }

  const onSwap = () => {
    trackEvent({ ...OVERVIEW_EVENTS.CHOOSE_TRANSACTION_TYPE, label: 'swap' })
    router.push(
      isSwapFeatureEnabled
        ? { pathname: AppRoutes.swap, query: router.query }
        : { pathname: AppRoutes.apps.index, query: { ...router.query, categories: 'Aggregator' } },
    )
  }

  const onCustomTransaction = () => {
    if (!txBuilder) return

    trackEvent({ ...OVERVIEW_EVENTS.CHOOSE_TRANSACTION_TYPE, label: 'tx_builder' })
    router.push(txBuilder.link)
  }

  const showRecoveryOption = supportsRecovery && !recovery

  return (
    <ModalDialog
      open={open}
      dialogTitle={translateMessage('ui.createNewTransaction_f09e4747')}
      hideChainIndicator
      onClose={onClose}
    >
      <div className="flex flex-col justify-center gap-4 p-6">
        <div>
          <ChoiceButton
            title={translateMessage('ui.activateNow_11d7e610')}
            description={translateMessage('ui.payAOneTimeNetworkFee_4652901d')}
            icon={BrandLogo}
            onClick={() => handleClick(onActivateSafe)}
          />
        </div>

        <div>
          <ChoiceButton
            title={translateMessage('ui.addAnotherSigner_c0a6cfa7')}
            description={translateMessage('ui.improveTheSecurityOfYourAccount_37cdc8e8')}
            icon={SaveAddressIcon}
            onClick={() => handleClick(onAddSigner)}
          />
        </div>

        {showRecoveryOption && (
          <div>
            <ChoiceButton
              title={translateMessage('ui.setUpRecovery_480572ee')}
              description={translateMessage('ui.ensureYouNeverLoseAccessTo_7b7e1e5e')}
              icon={RecoveryPlus}
              onClick={() => handleClick(onRecovery)}
            />
          </div>
        )}

        <div>
          <ChoiceButton
            title={translateMessage('ui.swapTokens_60b423cd')}
            description={translateMessage('ui.exploreSafeAppsAndTradeAny_668129fa')}
            icon={SwapIcon}
            onClick={() => handleClick(onSwap)}
          />
        </div>

        {txBuilder && (
          <div>
            <ChoiceButton
              title={translateMessage('ui.customTransaction_854b5655')}
              description={translateMessage('ui.composeCustomContractInteractions_cc15ea56')}
              icon={Wrench}
              onClick={() => handleClick(onCustomTransaction)}
            />
          </div>
        )}

        <div>
          <ChoiceButton
            title={translateMessage('ui.sendToken_24c8bacb')}
            icon={AssetsIcon}
            onClick={() => handleClick(onSendToken)}
          />
        </div>
      </div>
    </ModalDialog>
  )
}

export default FirstTxFlow
