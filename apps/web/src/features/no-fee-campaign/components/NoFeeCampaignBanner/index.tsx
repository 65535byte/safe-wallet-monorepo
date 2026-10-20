import { translateMessage } from '@/i18n'
import { useContext } from 'react'
import { TxModalContext } from '@/components/tx-flow'
import { NewTxFlow } from '@/components/tx-flow/flows'
import PromoBanner from '@/components/common/PromoBanner/PromoBanner'
import useWallet from '@/hooks/wallets/useWallet'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import { useSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { Link } from '@safe-global/views/components/ui/link'

const NoFeeCampaignBanner = ({ onDismiss }: { onDismiss: () => void }) => {
  const { setTxFlow } = useContext(TxModalContext)
  const wallet = useWallet()
  const isSafeOwner = useIsSafeOwner()
  const safeSDK = useSafeSDK()
  const ctaDisabled = !wallet || !isSafeOwner || !safeSDK

  const handleNewTransaction = () => {
    setTxFlow(<NewTxFlow />, undefined, false)
  }

  return (
    <PromoBanner
      title={translateMessage('ui.enjoyFreeJanuary_1c2a3bae')}
      description={
        <>
          {translateMessage('ui.noFeeForEthenaUSDeHolders_207ab909')}{' '}
          <Link
            href="https://help.safe.global/articles/9605526657-no-fee-january-campaign"
            target="_blank"
            rel="noopener noreferrer"
            variant="inherit"
            className="font-bold underline"
          >
            {translateMessage('ui.learnMore_0c11daba')}
          </Link>
        </>
      }
      ctaLabel={translateMessage('ui.newTransaction_7f00cf16')}
      onCtaClick={handleNewTransaction}
      ctaVariant="contained"
      ctaDisabled={ctaDisabled}
      imageSrc="/images/common/no-fee-campaign/Cards_USDe.svg"
      imageAlt={translateMessage('ui.uSDeLogo_dcd3bbb9')}
      trackingEvents={{ category: 'overview', action: 'open_no_fee_campaign_new_tx' }}
      trackHideProps={{ category: 'overview', action: 'hide_no_fee_campaign_banner' }}
      onDismiss={onDismiss}
    />
  )
}

export default NoFeeCampaignBanner
