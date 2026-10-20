import { translateMessage } from '@/i18n'
import { useContext } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

import { Button } from '@safe-global/views/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import CheckWallet from '@/components/common/CheckWallet'
import { useRecoveryTxState } from '../../hooks/useRecoveryTxState'
import type { RecoveryQueueItem } from '../../services/recovery-state'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { useCurrentChain } from '@/hooks/useChains'
import { TxModalContext } from '@/components/tx-flow'
import { RecoveryAttemptFlow } from '@/components/tx-flow/flows'

export default function ExecuteRecoveryButton({
  recovery,
  compact = false,
}: {
  recovery: RecoveryQueueItem
  compact?: boolean
}): ReactElement {
  const { isExecutable, isNext, isPending } = useRecoveryTxState(recovery)
  const isDisabled = !isExecutable || isPending
  const isWrongChain = useIsWrongChain()
  const chain = useCurrentChain()
  const { setTxFlow } = useContext(TxModalContext)

  const onClick = async (e: SyntheticEvent) => {
    e.stopPropagation()
    e.preventDefault()

    setTxFlow(<RecoveryAttemptFlow item={recovery} />)
  }

  const getRecoveryBlockedReason = (): string | null => {
    if (isWrongChain) {
      return translateMessage('ui.switchYourWalletNetworkToTo_af2306c4', { p0: chain?.chainName })
    }
    if (!isDisabled) {
      return null
    }
    return isNext
      ? translateMessage('ui.youCanExecuteTheRecoveryAfter_d097e99d')
      : translateMessage('ui.previousRecoveryProposalsMustBeExecuted_3d3a865f')
  }

  const blockedReason = getRecoveryBlockedReason()

  return (
    <CheckWallet allowNonOwner checkNetwork={!isDisabled}>
      {(isOk) => {
        const button = (
          <Button
            data-testid="execute-btn"
            onClick={onClick}
            variant="default"
            disabled={!isOk || isDisabled}
            size={compact ? 'default' : 'action'}
          >
            {translateMessage('ui.execute_eea2eb83')}
          </Button>
        )

        if (!blockedReason) {
          return button
        }

        return (
          <Tooltip>
            <TooltipTrigger render={<span />}>{button}</TooltipTrigger>
            <TooltipContent>{blockedReason}</TooltipContent>
          </Tooltip>
        )
      }}
    </CheckWallet>
  )
}
