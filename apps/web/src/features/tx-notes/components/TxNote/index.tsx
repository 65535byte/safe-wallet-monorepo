import { translateMessage } from '@/i18n'
import type { TransactionDetails } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Typography } from '@safe-global/views/components/ui/typography'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import { isMultisigDetailedExecutionInfo } from '@/utils/transaction-guards'
import EthHashInfo from '@/components/common/EthHashInfo'
import TxSectionTitle from '@safe-global/views/components/tx-flow/common/TxSectionTitle'

export default function TxNote({ txDetails }: { txDetails: TransactionDetails | undefined }) {
  const note = txDetails?.note
  if (!note) return null

  const creator =
    isMultisigDetailedExecutionInfo(txDetails?.detailedExecutionInfo) && txDetails?.detailedExecutionInfo.proposer

  return (
    <div>
      <TxSectionTitle className="gap-0">
        {translateMessage('ui.note_b1eff7f0')}
        <Tooltip>
          <TooltipTrigger
            data-testid="tx-note-tooltip"
            render={<span className="inline-flex h-[1em] text-muted-foreground" />}
          >
            <InfoIcon height="100%" />
          </TooltipTrigger>
          <TooltipContent>
            <div data-testid="note-creator" className="flex flex-row gap-2">
              <span>{translateMessage('ui.by_2940cb18')}</span>
              {creator ? (
                <EthHashInfo avatarSize={20} address={creator.value} showName onlyName />
              ) : (
                <span>{translateMessage('ui.transactionCreator_05ba6ddb')}</span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TxSectionTitle>

      <Typography
        data-testid="tx-note"
        variant="paragraph"
        className="mt-2 rounded-lg bg-[var(--color-background-main)] p-4"
      >
        {note}
      </Typography>
    </div>
  )
}
