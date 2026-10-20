import { translateMessage } from '@/i18n'
import ModalDialog from '@/components/common/ModalDialog'
import { trackEvent } from '@/services/analytics'
import { SPACE_EVENTS } from '@/services/analytics/events/spaces'
import { ChainIndicatorList } from '@/features/multichain'
import { useAddressBooksDeleteByAddressV1Mutation } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import { useCurrentSpaceId, useWorkspaceAddressBookLabel } from '@/features/spaces'
import { useState } from 'react'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'
import { Spinner } from '@safe-global/views/components/ui/spinner'
import { Typography } from '@safe-global/views/components/ui/typography'
import { cn } from '@safe-global/views/utils/cn'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { getContactRemovedMessage } from '@/utils/addressBookNotifications'
import { isElevationRequiredError } from '@/features/oidc-auth/utils/elevation'

type DeleteContactDialogProps = {
  name: string
  address: string
  networks: string[]
  onClose: () => void
}

const DeleteContactDialog = ({ name, address, networks, onClose }: DeleteContactDialogProps) => {
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const dispatch = useAppDispatch()
  const spaceId = useCurrentSpaceId()
  const isDarkMode = useDarkMode()
  const workspaceAddressBookLabel = useWorkspaceAddressBookLabel()
  const [deleteEntry] = useAddressBooksDeleteByAddressV1Mutation()

  const handleConfirm = async () => {
    setError(undefined)

    try {
      setIsSubmitting(true)
      trackEvent({ ...SPACE_EVENTS.REMOVE_ADDRESS_SUBMIT })
      const response = await deleteEntry({ spaceId: spaceId ?? '', address })

      if (isElevationRequiredError(response.error)) return
      if (response.error) {
        setError(translateMessage('ui.somethingWentWrongDeletingTheContact_b6e79074'))
        return
      }

      dispatch(
        showNotification({
          message: getContactRemovedMessage(workspaceAddressBookLabel),
          variant: 'success',
          groupKey: 'delete-contact-success',
        }),
      )

      onClose()
    } catch (error) {
      setError(translateMessage('ui.somethingWentWrongDeletingTheContact_b6e79074'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ModalDialog
      open
      onClose={onClose}
      dialogTitle={translateMessage('ui.removeAddressBookEntry_41638636')}
      maxWidth="sm"
      fullWidth
      hideChainIndicator
    >
      <div className={cn('shadcn-scope', isDarkMode && 'dark')}>
        <div className="p-6">
          <Typography className="mb-2">
            {translateMessage('ui.areYouSureYouWantTo_e3a808ce')}
            <strong>{name}</strong> {translateMessage('ui.fromTheAddressBookThisChange_9ef91a82')}
          </Typography>

          <ChainIndicatorList chainIds={networks} />

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertSeverityIcon variant="destructive" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-between gap-2 p-4 pt-0 pb-6">
          <Button variant="ghost" onClick={onClose}>
            {translateMessage('ui.cancel_d94a8eaf')}
          </Button>
          <Button data-testid="delete-btn" onClick={handleConfirm} variant="destructive" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="size-5" /> : translateMessage('ui.remove_1498adee')}
          </Button>
        </div>
      </div>
    </ModalDialog>
  )
}

export default DeleteContactDialog
