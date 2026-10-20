import { translateMessage } from '@/i18n'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import LoadingSpinner, { SpinnerStatus } from '@/components/new-safe/create/steps/StatusStep/LoadingSpinner'
import { SafeCreationEvent } from '@/features/counterfactual/services'
import { useCurrentChain } from '@/hooks/useChains'
import { getBlockExplorerLink } from '@safe-global/utils/utils/chains'
import { Typography } from '@safe-global/views/components/ui/typography'
import FailedIcon from '@/public/images/common/tx-failed.svg'
import type { UndeployedSafe } from '@safe-global/utils/features/counterfactual/store/types'

const getStep = (status: SafeCreationEvent) => {
  switch (status) {
    case SafeCreationEvent.AWAITING_EXECUTION:
      return {
        description: translateMessage('ui.yourAccountIsAwaitingActivation_4cc4daa3'),
        instruction: translateMessage('ui.activateTheAccountToUnlockAll_9bfecff7'),
      }
    case SafeCreationEvent.PROCESSING:
    case SafeCreationEvent.RELAYING:
      return {
        description: translateMessage('ui.weAreActivatingYourAccount_ed2f1d13'),
        instruction: translateMessage('ui.itCanTakeSomeMinutesTo_c9a97fd2'),
      }
    case SafeCreationEvent.FAILED:
      return {
        description: translateMessage('ui.yourAccountCouldnTBeCreated_00c8d0be'),
        instruction: translateMessage('ui.theCreationTransactionWasRejectedBy_7ae31d4a'),
      }
    case SafeCreationEvent.REVERTED:
      return {
        description: translateMessage('ui.yourAccountCouldnTBeCreated_00c8d0be'),
        instruction: translateMessage('ui.theCreationTransactionRevertedYouCan_e7db587b'),
      }
    case SafeCreationEvent.SUCCESS:
      return {
        description: translateMessage('ui.yourAccountIsBeingIndexed_74da5d84'),
        instruction: translateMessage('ui.theAccountWillBeReadyFor_c5a5022d'),
      }
    case SafeCreationEvent.INDEXED:
      return {
        description: translateMessage('ui.yourAccountWasSuccessfullyCreated_e0df73ae'),
        instruction: '',
      }
  }
}

const StatusMessage = ({
  status,
  isError,
  pendingSafe,
}: {
  status: SafeCreationEvent
  isError: boolean
  pendingSafe: UndeployedSafe | undefined
}) => {
  const stepInfo = getStep(status)
  const chain = useCurrentChain()

  const isSuccess = status === SafeCreationEvent.SUCCESS
  const spinnerStatus = isSuccess ? SpinnerStatus.SUCCESS : SpinnerStatus.PROCESSING
  const explorerLink =
    chain && pendingSafe?.status.txHash ? getBlockExplorerLink(chain, pendingSafe.status.txHash) : undefined

  return (
    <>
      <div data-testid="safe-status-info" className="mt-6 px-6">
        <div className="mx-auto flex h-40 w-40">
          {isError ? <FailedIcon /> : <LoadingSpinner status={spinnerStatus} />}
        </div>
        <Typography variant="h3" className="mt-4">
          {stepInfo.description}
        </Typography>
      </div>
      <div className="mx-auto max-w-[390px]">
        {stepInfo.instruction && (
          <Typography variant="paragraph-small" className="my-4 block">
            {stepInfo.instruction}
          </Typography>
        )}
        {!isError && explorerLink && (
          <ExternalLink href={explorerLink.href}>
            {translateMessage('ui.checkStatusOnBlockExplorer_6df281ed')}
          </ExternalLink>
        )}
      </div>
    </>
  )
}

export default StatusMessage
