import { translateMessage } from '@/i18n'
import { Typography } from '@safe-global/views/components/ui/typography'

import TxCard from '@safe-global/views/components/tx-flow/common/TxCard'
import ErrorMessage from '@/components/tx/ErrorMessage'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { useCurrentChain } from '@/hooks/useChains'
import { HELP_CENTER_URL } from '@safe-global/utils/config/constants'

const SpendingLimitNotSupported = () => {
  const chain = useCurrentChain()
  const chainName = chain?.chainName ?? 'this network'

  return (
    <TxCard>
      <ErrorMessage>
        <Typography variant="paragraph-bold">
          {translateMessage('ui.spendingLimitsArenTAvailableOn_97bb2f71')}
          {chainName} {translateMessage('ui.yet_1ce04b95')}
        </Typography>
        <Typography className="mt-1">
          {translateMessage('ui.theSpendingLimitModuleHasnT_3f892810')}{' '}
          <ExternalLink href={HELP_CENTER_URL}>{translateMessage('ui.contactUs_63ab8f3e')}</ExternalLink>{' '}
          {translateMessage('ui.toRequestSupportFor_cf3fac26')}
          {chainName}.
        </Typography>
      </ErrorMessage>
    </TxCard>
  )
}

export default SpendingLimitNotSupported
