import { translateMessage } from '@/i18n'
import { useContext, type ReactElement } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import TxCard, { TxCardActions } from '@safe-global/views/components/tx-flow/common/TxCard'
import type { RecoveryFlowProps } from '.'

import { TxFlowContext } from '../../TxFlowProvider'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Button } from '@safe-global/views/components/ui/button'
import { Separator } from '@safe-global/views/components/ui/separator'

export function RemoveRecoveryFlowOverview({ delayModifier }: RecoveryFlowProps): ReactElement {
  const { onNext } = useContext(TxFlowContext)
  return (
    <TxCard>
      <Typography variant="paragraph-small" className="block">
        {translateMessage('ui.thisTransactionWillRemoveTheRecovery_cb1d90b0')}
      </Typography>

      <Typography variant="paragraph-small" className="block">
        {translateMessage('ui.thisRecovererWillNotBeAble_8c395585')}
      </Typography>

      <div data-testid="remove-recoverer-section">
        <Typography variant="paragraph-small" className="mb-2 block text-[var(--color-text-secondary)]">
          {translateMessage('ui.removingRecoverer_9cf0179f')}
        </Typography>

        {delayModifier.recoverers.map((recoverer) => (
          <EthHashInfo
            avatarSize={32}
            key={recoverer}
            shortAddress={false}
            address={recoverer}
            hasExplorer
            showCopyButton
          />
        ))}
      </div>

      <Separator bleed="6" />

      <TxCardActions className="!mt-0">
        <Button data-testid="next-btn" variant="default" onClick={onNext}>
          {translateMessage('ui.next_9cff86c8')}
        </Button>
      </TxCardActions>
    </TxCard>
  )
}
