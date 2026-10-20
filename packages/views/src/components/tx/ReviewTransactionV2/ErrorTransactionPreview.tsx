import { translateMessage } from '@safe-global/views/i18n'
import TxCard from '@safe-global/views/components/tx-flow/common/TxCard'
import { Typography } from '@safe-global/views/components/ui/typography'

const ErrorTransactionPreview = () => (
  <TxCard>
    <div className="mb-10 flex min-h-[38svh] items-center justify-center" data-testid="error-transaction-preview">
      <Typography variant="paragraph-bold">
        {translateMessage('ui.errorLoadingPreviewPleaseTryAgain_54a79c72')}
      </Typography>
    </div>
  </TxCard>
)

export default ErrorTransactionPreview
