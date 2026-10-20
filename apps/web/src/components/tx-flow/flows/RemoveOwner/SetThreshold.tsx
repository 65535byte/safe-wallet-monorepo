import { translateMessage } from '@/i18n'
import { useState } from 'react'
import { Button } from '@safe-global/views/components/ui/button'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@safe-global/views/components/ui/select'
import type { ReactElement, SyntheticEvent } from 'react'

import EthHashInfo from '@/components/common/EthHashInfo'
import useSafeInfo from '@/hooks/useSafeInfo'
import TxCard, { TxCardActions } from '@safe-global/views/components/tx-flow/common/TxCard'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import { TOOLTIP_TITLES } from '@safe-global/views/components/tx-flow/common/constants'
import type { RemoveOwnerFlowProps } from '.'

import { validateThreshold } from '@safe-global/utils/utils/validation'

export const SetThreshold = ({
  params,
  onSubmit,
}: {
  params: RemoveOwnerFlowProps
  onSubmit: (data: RemoveOwnerFlowProps) => void
}): ReactElement => {
  const { safe } = useSafeInfo()
  const [selectedThreshold, setSelectedThreshold] = useState<number>(params.threshold ?? 1)

  const handleChange = (value: number | null) => {
    if (value != null) setSelectedThreshold(value)
  }

  const newNumberOfOwners = safe ? safe.owners.length - 1 : 1

  // The threshold lives outside a form, so guard it at submit: blocks the
  // GS202/GS201 on-chain reverts if the owner set changed while the flow was
  // open (WA-3005 Bucket A).
  const thresholdError = validateThreshold(selectedThreshold, newNumberOfOwners)

  const onSubmitHandler = (e: SyntheticEvent) => {
    e.preventDefault()
    if (thresholdError) return
    onSubmit({ ...params, threshold: selectedThreshold })
  }

  return (
    <TxCard>
      <form onSubmit={onSubmitHandler}>
        <div className="mb-6">
          <Typography className="mb-4">{translateMessage('ui.reviewTheSignerYouWantTo_9ae74c74')}</Typography>

          <EthHashInfo address={params.removedOwner.address} shortAddress={false} showCopyButton hasExplorer />
        </div>

        <Separator bleed="6" />

        <div className="my-6">
          <Typography variant="h4" className="inline-flex items-center gap-1 font-bold">
            {translateMessage('ui.threshold_60fbd8eb')}
            <Tooltip>
              <TooltipTrigger
                render={
                  <span className="flex text-[var(--color-border-main)]">
                    <InfoIcon className="size-4" />
                  </span>
                }
              />
              <TooltipContent>{TOOLTIP_TITLES.THRESHOLD}</TooltipContent>
            </Tooltip>
          </Typography>
          <Typography>{translateMessage('ui.anyTransactionRequiresTheConfirmationOf_d009e878')}</Typography>
          <div className="mt-4 flex flex-row items-center gap-2">
            <div>
              <Select value={selectedThreshold} onValueChange={handleChange}>
                <SelectTrigger data-testid="threshold-selector">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {safe.owners.slice(1).map((_, idx) => (
                    <SelectItem key={idx + 1} value={idx + 1}>
                      {idx + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Typography>
                {translateMessage('ui.outOf_9bf030fe')}
                {newNumberOfOwners} {translateMessage('ui.signer_efab2dcb')}
              </Typography>
            </div>
          </div>
        </div>

        {thresholdError && <Typography className="mb-4 text-destructive">{thresholdError}</Typography>}

        <Separator bleed="6" />

        <TxCardActions>
          <Button data-testid="next-btn" type="submit" disabled={!!thresholdError}>
            {translateMessage('ui.next_9cff86c8')}
          </Button>
        </TxCardActions>
      </form>
    </TxCard>
  )
}
