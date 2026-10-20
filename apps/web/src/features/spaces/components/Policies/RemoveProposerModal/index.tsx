import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import ModalDialog from '@/components/common/ModalDialog'
import { Button } from '@safe-global/views/components/ui/button'
import { Spinner } from '@safe-global/views/components/ui/spinner'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useDarkMode } from '@/hooks/useDarkMode'
import { cn } from '@safe-global/views/utils/cn'

export type RemoveProposerModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  /** While the wallet signs and the proposer is deleted. */
  isRemoving?: boolean
  error?: string
}

const RemoveProposerModal = ({
  open,
  onClose,
  onConfirm,
  isRemoving = false,
  error,
}: RemoveProposerModalProps): ReactElement => {
  const isDarkMode = useDarkMode()

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      dialogTitle={translateMessage('ui.removeThisProposer_874ef976')}
      hideChainIndicator
      maxWidth="sm"
      data-testid="remove-proposer-modal"
    >
      <div className={cn('shadcn-scope', isDarkMode && 'dark')}>
        <div className="flex flex-col gap-4 px-6 pt-6">
          <Typography variant="paragraph">
            {translateMessage('ui.removingThisProposerWillPermanentlyRemove_b781e757')}
          </Typography>
          <Typography variant="paragraph">{translateMessage('ui.toCompleteThisActionConfirmIt_239da06a')}</Typography>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </div>

        <div className="flex flex-col-reverse gap-2 p-6 sm:flex-row">
          <Button
            variant="secondary"
            size="submit"
            className="sm:flex-1"
            onClick={onClose}
            disabled={isRemoving}
            data-testid="remove-proposer-cancel"
          >
            {translateMessage('ui.noKeepIt_39df34cb')}
          </Button>
          <Button
            variant="destructive"
            size="submit"
            className="sm:flex-1"
            onClick={onConfirm}
            disabled={isRemoving}
            data-testid="remove-proposer-confirm"
          >
            {isRemoving ? <Spinner /> : translateMessage('ui.yesDelete_185fdfd2')}
          </Button>
        </div>
      </div>
    </ModalDialog>
  )
}

export default RemoveProposerModal
