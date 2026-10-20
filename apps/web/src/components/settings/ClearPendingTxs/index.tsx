import { translateMessage } from '@/i18n'
import { usePendingTxIds } from '@/hooks/usePendingTxs'
import { SETTINGS_EVENTS, trackEvent } from '@/services/analytics'
import { useAppDispatch } from '@/store'
import { clearPendingTx } from '@/store/pendingTxsSlice'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useCallback } from 'react'

export const ClearPendingTxs = () => {
  const pendingTxIds = usePendingTxIds()
  const pendingTxCount = pendingTxIds.length
  const dispatch = useAppDispatch()

  const clearPendingTxs = useCallback(() => {
    pendingTxIds.forEach((txId) => {
      dispatch(clearPendingTx({ txId }))
    })
    trackEvent({ ...SETTINGS_EVENTS.DATA.CLEAR_PENDING_TXS, label: pendingTxCount })
  }, [dispatch, pendingTxCount, pendingTxIds])
  return (
    <div className="flex flex-col gap-4">
      <Typography>{translateMessage('ui.clearThisAccountSPendingTransactions_a439ed09')}</Typography>
      <Alert variant="warning" outlined={false}>
        <AlertSeverityIcon variant="warning" />
        <AlertDescription>{translateMessage('ui.thisActionDoesNotDeleteAny_87323b4d')}</AlertDescription>
      </Alert>
      <div>
        {pendingTxCount > 0 ? (
          <Button variant="destructive" onClick={clearPendingTxs}>
            {translateMessage('ui.clear_1cc6f4fd')}
            {pendingTxCount} {translateMessage('ui.transaction_a758f351', { count: pendingTxCount })}
          </Button>
        ) : (
          <Typography variant="paragraph-small">{translateMessage('ui.noPendingTransactions_233bb81d')}</Typography>
        )}
      </div>
    </div>
  )
}
