import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { XIcon } from 'lucide-react'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Button } from '@safe-global/views/components/ui/button'
import { cn } from '@safe-global/views/utils/cn'
import WalletOutlinedIcon from '@/public/images/common/wallet-outlined.svg'
import TokenIcon from '@/public/images/common/token.svg'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import useChainId from '@/hooks/useChainId'
import { GTF_FEES_BANNER_DISMISSED_KEY } from '../../constants'
import css from './styles.module.css'

const LEARN_MORE_URL = 'https://help.safe.global/articles/9993850744-safewallet-gas-fees-faq'

const FeeInfoBanner = (): ReactElement | null => {
  const chainId = useChainId()
  const [dismissed, setDismissed] = useLocalStorage<boolean>(`${GTF_FEES_BANNER_DISMISSED_KEY}_${chainId}`)

  if (dismissed) {
    return null
  }

  return (
    <div className={css.feeInfoBanner}>
      <div className={css.feeInfoContent}>
        <span className={css.newTag}>{translateMessage('ui.new_891f3045')}</span>

        <div className={css.feeInfoBody}>
          <Typography variant="paragraph-small-bold">
            {translateMessage('ui.soonFeesWillBePaidFrom_1681acea')}
          </Typography>

          <div className={css.feeInfoBullet}>
            <span className={css.bulletIconWrapper}>
              <WalletOutlinedIcon className={css.bulletIcon} />
            </span>
            <Typography variant="paragraph-small">
              {translateMessage('ui.noNeedToFundSigningWallets_a7b3c8ec')}
            </Typography>
          </div>

          <div className={css.feeInfoBullet}>
            <span className={css.bulletIconWrapper}>
              <TokenIcon className={css.bulletIcon} />
            </span>
            <Typography variant="paragraph-small">
              {translateMessage('ui.payFeesInAnySupportedToken_38f98e36')}
            </Typography>
          </div>
        </div>

        <ExternalLink href={LEARN_MORE_URL} noIcon className={css.learnMoreLink}>
          <Typography variant="paragraph-small-bold" className="underline">
            {translateMessage('ui.learnMore_0c11daba')}
          </Typography>
        </ExternalLink>
      </div>

      <Button
        variant="ghost"
        size="icon"
        aria-label={translateMessage('ui.close_aaaeeafe')}
        onClick={() => setDismissed(true)}
        className={cn(css.feeInfoClose, 'size-7')}
      >
        <XIcon className={css.closeIcon} />
      </Button>
    </div>
  )
}

export default FeeInfoBanner
