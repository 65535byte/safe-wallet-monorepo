import { translateMessage } from '@/i18n'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics'
import { ChangeThresholdFlow } from '@/components/tx-flow/flows'
import CheckWallet from '@/components/common/CheckWallet'
import { useContext } from 'react'
import { TxModalContext } from '@/components/tx-flow'

export const RequiredConfirmation = ({ threshold, owners }: { threshold: number; owners: number }) => {
  const { setTxFlow } = useContext(TxModalContext)

  return (
    <div className="mt-12">
      <div className="flex flex-col justify-between gap-6 lg:flex-row">
        <div className="lg:w-1/5 lg:shrink-0">
          <Typography variant="h4" className="font-bold">
            {translateMessage('ui.requiredConfirmations_dbe4a283')}
          </Typography>
        </div>

        <div className="lg:min-w-0 lg:flex-1">
          <Typography className="pb-4">
            {translateMessage('ui.anyTransactionRequiresTheConfirmationOf_d009e878')}
          </Typography>

          <Typography className="inline pr-4">
            <b>{threshold}</b> {translateMessage('ui.outOf_d22acd25')}
            <b>{owners}</b> {translateMessage('ui.signer_73621bf3')}
          </Typography>

          {owners > 1 && (
            <CheckWallet>
              {(isOk) => (
                <Track {...SETTINGS_EVENTS.SETUP.CHANGE_THRESHOLD} as="span">
                  <Button onClick={() => setTxFlow(<ChangeThresholdFlow />)} disabled={!isOk} size="sm">
                    {translateMessage('ui.change_16056c3a')}
                  </Button>
                </Track>
              )}
            </CheckWallet>
          )}
        </div>
      </div>
    </div>
  )
}
