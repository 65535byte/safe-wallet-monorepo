import { translateMessage } from '@safe-global/views/i18n'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { Typography } from '@safe-global/views/components/ui/typography'

const TX_DECODER_URL = 'https://transaction-decoder.pages.dev'
const SAFE_UTILS_URL = 'https://safeutils.openzeppelin.com'

const linkClasses = 'text-[var(--color-text-primary)]'

const DecoderLinks = () => (
  <Typography variant="paragraph-small" className="block mb-6 text-[var(--color-primary-light)]">
    {translateMessage('ui.crossVerifyYourTransactionDataWith_d658c020')}{' '}
    <ExternalLink className={linkClasses} href={SAFE_UTILS_URL}>
      Safe Utils
    </ExternalLink>{' '}
    {translateMessage('ui.and_ee3cc19b')}{' '}
    <ExternalLink className={linkClasses} href={TX_DECODER_URL}>
      {translateMessage('ui.transactionDecoder_0a46e261')}
    </ExternalLink>
    .
  </Typography>
)

export default DecoderLinks
