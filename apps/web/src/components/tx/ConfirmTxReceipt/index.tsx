import { translateMessage } from '@/i18n'
import TxCard from '@safe-global/views/components/tx-flow/common/TxCard'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Spinner } from '@safe-global/views/components/ui/spinner'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { type PropsWithChildren, useContext } from 'react'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import useTxPreview from '../confirmation-views/useTxPreview'
import Track from '@/components/common/Track'
import { MODALS_EVENTS } from '@/services/analytics'
import useWallet from '@/hooks/wallets/useWallet'
import { isHardwareWallet, isLedgerLive } from '@/utils/wallets'
import { TxFlowStep } from '@/components/tx-flow/TxFlowStep'
import { Receipt } from '../ConfirmTxDetails/Receipt'
import { Slot, SlotName } from '@/components/tx-flow/slots'
import { Sign } from '@/components/tx-flow/actions/Sign'

const InfoSteps = [
  {
    label: translateMessage('ui.reviewWhatYouWillSign_a6942fba'),
    description: (
      <Typography>
        {translateMessage('ui.signingIsAnIrreversibleActionSo_b086ae0d')}{' '}
        <Track {...MODALS_EVENTS.SIGNING_ARTICLE}>
          <ExternalLink href="https://help.safe.global/articles/2485383995-How-to-perform-basic-transactions-checks-on-Safe{Wallet}">
            {translateMessage('ui.readMore_531b9432')}
          </ExternalLink>
        </Track>
        .
      </Typography>
    ),
  },
  {
    label: translateMessage('ui.compareWithYourWallet_ee5a84b1'),
    description: (
      <Typography>
        {translateMessage('ui.onceYouClick_fed2a5aa')}
        <b>{translateMessage('ui.sign_1e67e9a4')}</b>
        {translateMessage('ui.theTransactionWillAppearInYour_998a1a81')}
      </Typography>
    ),
  },
  {
    label: translateMessage('ui.verifyWithExternalTools_f07a4137'),
    description: (
      <Typography>
        {translateMessage('ui.youCanAdditionallyCrossVerifyYour_e31dd21b')}{' '}
        <Track {...MODALS_EVENTS.OPEN_SAFE_UTILS}>
          <ExternalLink href="https://safeutils.openzeppelin.com/">Safe Utils</ExternalLink>
        </Track>
        .
      </Typography>
    ),
  },
]

const HardwareWalletStep = [
  InfoSteps[1],
  {
    label: translateMessage('ui.compareWithYourDevice_77e86dee'),
    description: <Typography>{translateMessage('ui.ifYouReUsingAHardware_3f59b6b2')}</Typography>,
  },
  InfoSteps[2],
]

export const ConfirmTxReceipt = ({ children, onSubmit }: PropsWithChildren<{ onSubmit: () => void }>) => {
  const { safeTx } = useContext(SafeTxContext)
  const [txPreview] = useTxPreview(safeTx?.data)
  const wallet = useWallet()
  const showHashes = wallet ? isHardwareWallet(wallet) || isLedgerLive(wallet) : false
  const steps = showHashes ? HardwareWalletStep : InfoSteps

  // Render inside TxFlowStep (rather than bailing with `false`) so the step title still updates and
  // the user sees a loading state instead of an empty card with the previous step's stale title.
  if (!safeTx) {
    return (
      <TxFlowStep title={translateMessage('ui.reviewDetails_e1ca8d36')} fixedNonce>
        <TxCard>
          <div className="flex items-center justify-center py-10">
            <Spinner className="size-6" />
          </div>
        </TxCard>
      </TxFlowStep>
    )
  }

  return (
    <TxFlowStep title={translateMessage('ui.reviewDetails_e1ca8d36')} fixedNonce>
      <TxCard>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="flex flex-col gap-6 px-1">
              {steps.map(({ label, description }, index) => (
                <div key={index} className="flex flex-row gap-4">
                  <div className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                    {index + 1}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Typography className="font-bold">{label}</Typography>
                    {description}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Receipt safeTxData={safeTx?.data} txData={txPreview?.txData} txInfo={txPreview?.txInfo} />
          </div>
        </div>

        {children}

        <Slot name={SlotName.Submit} onSubmitSuccess={onSubmit} txPreview={txPreview}>
          <Sign
            onSubmitSuccess={onSubmit}
            options={[{ id: 'sign', label: translateMessage('ui.sign_1e67e9a4') }]}
            onChange={() => {}}
            slotId="sign"
          />
        </Slot>
      </TxCard>
    </TxFlowStep>
  )
}
