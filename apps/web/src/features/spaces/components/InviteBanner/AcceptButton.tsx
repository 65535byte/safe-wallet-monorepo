import { translateMessage } from '@/i18n'
import { useState } from 'react'
import { Button } from '@safe-global/views/components/ui/button'
import type { GetSpaceResponse } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import AcceptInviteDialog from './AcceptInviteDialog'

type AcceptButtonProps = {
  space: GetSpaceResponse
}

const AcceptButton = ({ space }: AcceptButtonProps) => {
  const [inviteOpen, setInviteOpen] = useState(false)

  const handleAcceptInvite = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setInviteOpen(true)
  }

  const handleCloseInviteDialog = () => {
    setInviteOpen(false)
  }

  return (
    <>
      <Button
        data-testid="accept-invite-button"
        onClick={handleAcceptInvite}
        aria-label={translateMessage('ui.acceptInvitation_632f1e7b')}
        size="sm"
      >
        {translateMessage('ui.accept_b264ffc7')}
      </Button>
      {inviteOpen && <AcceptInviteDialog space={space} onClose={handleCloseInviteDialog} />}
    </>
  )
}

export default AcceptButton
