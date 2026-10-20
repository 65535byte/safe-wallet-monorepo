import { translateMessage } from '@safe-global/views/i18n'
import { type ReactElement } from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'

export const SafeShieldAnalysisEmpty = (): ReactElement => (
  <Typography variant="paragraph-small" align="center" className="block p-4 text-[var(--color-text-secondary)]">
    {translateMessage('ui.transactionDetailsWillBeAutomaticallyScanned_0152c95d')}
  </Typography>
)
