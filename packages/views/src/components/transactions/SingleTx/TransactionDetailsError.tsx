import { translateMessage } from '@safe-global/views/i18n'
import type { ReactElement } from 'react'
import SafeLogoHalo from '@safe-global/views/components/common/SafeLogoHalo'
import { Button } from '@safe-global/views/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyMedia } from '@safe-global/views/components/ui/empty'

export const TX_DETAILS_LOAD_ERROR = translateMessage('ui.theWebsiteFailedToLoadData_9a9dff2f')

const TransactionDetailsError = ({
  message = TX_DETAILS_LOAD_ERROR,
  onReload,
}: {
  message?: string
  /** Omitted when reloading cannot recover the state, e.g. a tx belonging to another Safe. */
  onReload?: () => void
}): ReactElement => (
  <Empty data-testid="tx-details-error">
    <EmptyMedia>
      <SafeLogoHalo />
    </EmptyMedia>

    <EmptyDescription>{message}</EmptyDescription>

    {onReload && (
      <EmptyContent>
        <Button variant="outline" onClick={onReload}>
          {translateMessage('ui.reload_00a35ede')}
        </Button>
      </EmptyContent>
    )}
  </Empty>
)

export default TransactionDetailsError
