import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { Button } from '@safe-global/views/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@safe-global/views/components/ui/dialog'
import { Typography } from '@safe-global/views/components/ui/typography'
import SignInOptions from '../SignInOptions'
import { useRemoveUrlSpaceId, useSafeWorkspaceAction } from '../../hooks/useSafeWorkspaceCheck'

// Nothing to do here: useSafeWorkspaceCheck re-runs when the session changes
const noop = () => {}

/** Asks a signed-out user who opens a Workspace link to a Safe to sign in, or to continue without it. */
const SafeWorkspaceSignInDialog = (): ReactElement | null => {
  const action = useSafeWorkspaceAction()
  const removeUrlSpaceId = useRemoveUrlSpaceId()

  if (action !== 'signIn') return null

  return (
    <Dialog open onOpenChange={(open) => !open && removeUrlSpaceId()}>
      <DialogContent size="sm" surface="card" padding="sm" data-testid="safe-workspace-sign-in-dialog">
        <div className="flex flex-col gap-6 pt-5">
          <div className="flex flex-col gap-1">
            <Typography variant="h3" as={DialogTitle}>
              {translateMessage('ui.signInToOpenThisIn_185a6d77')}
            </Typography>
            <Typography color="muted">{translateMessage('ui.thisLinkOpensTheInA_14425628')}</Typography>
          </div>

          <SignInOptions afterSignIn={noop} />

          <Button variant="ghost-muted" size="sm" className="self-center" onClick={removeUrlSpaceId}>
            {translateMessage('ui.continueWithoutWorkspace_6268797f')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SafeWorkspaceSignInDialog
