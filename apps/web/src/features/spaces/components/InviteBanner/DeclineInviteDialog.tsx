import { translateMessage } from '@/i18n'
import { useState } from 'react'
import ModalDialog from '@/components/common/ModalDialog'
import DialogActions from '@/components/common/DialogActions'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { Typography } from '@safe-global/views/components/ui/typography'
import { cn } from '@safe-global/views/utils/cn'
import { useDarkMode } from '@/hooks/useDarkMode'
import type { GetSpaceResponse } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import { useMembersDeclineInviteV1Mutation } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import { SPACE_EVENTS } from '@/services/analytics/events/spaces'
import { trackEvent } from '@/services/analytics'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'

type DeclineInviteDialogProps = {
  space: GetSpaceResponse
  onClose: () => void
}

const DeclineInviteDialog = ({ space, onClose }: DeclineInviteDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [declineInvite] = useMembersDeclineInviteV1Mutation()
  const dispatch = useAppDispatch()
  const isDarkMode = useDarkMode()

  const handleConfirm = async () => {
    setErrorMessage('')
    trackEvent({ ...SPACE_EVENTS.DECLINE_INVITE_SUBMIT, label: space.uuid }, { workspace_id: space.uuid })
    try {
      const { error } = await declineInvite({ spaceId: space.uuid })

      if (error) {
        throw error
      }

      onClose()

      dispatch(
        showNotification({
          message: translateMessage('ui.declinedInviteTo_2bcab57b', { p0: space.name }),
          variant: 'success',
          groupKey: 'decline-invite-success',
        }),
      )
    } catch (e) {
      setErrorMessage(translateMessage('ui.anUnexpectedErrorOccurredWhileDeclining_2bed43fa'))
    }
  }

  return (
    <ModalDialog
      open
      onClose={onClose}
      dialogTitle={translateMessage('ui.declineInvitation_d24392db')}
      hideChainIndicator
    >
      <div className={cn('shadcn-scope', isDarkMode && 'dark')}>
        <div className="p-6">
          <Typography variant="paragraph">
            {translateMessage('ui.areYouSureYouWantTo_c8e7e069')}
            <b>{space.name}</b>?
          </Typography>
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
        </div>

        <DialogActions
          className="px-6 pb-6"
          onCancel={onClose}
          cancelTestId="cancel-btn"
          confirmLabel={translateMessage('ui.decline_c2bad7cb')}
          onConfirm={handleConfirm}
          confirmDestructive
          confirmTestId="decline-btn"
        />
      </div>
    </ModalDialog>
  )
}

export default DeclineInviteDialog
