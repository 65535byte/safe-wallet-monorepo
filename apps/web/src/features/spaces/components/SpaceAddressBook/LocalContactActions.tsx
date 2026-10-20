import { translateMessage } from '@/i18n'
import { type MouseEvent, useState } from 'react'
import EditIcon from '@safe-global/views/assets/images/common/edit.svg'
import DeleteIcon from '@/public/images/common/delete.svg'
import EntryDialog from '@/components/address-book/EntryDialog'
import ModalDialog from '@/components/common/ModalDialog'
import { Button } from '@safe-global/views/components/ui/button'
import DialogActions from '@/components/common/DialogActions'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Typography } from '@safe-global/views/components/ui/typography'
import { removeAddressBookEntry } from '@/store/addressBookSlice'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'
import type { AddressBookEntry } from './SpaceAddressBookTable'

enum ModalType {
  EDIT = 'edit',
  REMOVE = 'remove',
}

const defaultOpen = { [ModalType.EDIT]: false, [ModalType.REMOVE]: false }

const LocalContactActions = ({ entry }: { entry: AddressBookEntry }) => {
  const [open, setOpen] = useState<typeof defaultOpen>(defaultOpen)
  const dispatch = useAppDispatch()

  const handleOpenModal = (e: MouseEvent, type: keyof typeof open) => {
    e.stopPropagation()
    setOpen((prev) => ({ ...prev, [type]: true }))
  }

  const handleCloseModal = () => {
    setOpen(defaultOpen)
  }

  const handleRemove = () => {
    for (const chainId of entry.chainIds) {
      dispatch(removeAddressBookEntry({ chainId, address: entry.address }))
    }
    dispatch(
      showNotification({
        message: translateMessage('ui.contactRemoved_d222265e'),
        variant: 'success',
        groupKey: 'remove-local-contact-success',
      }),
    )
    handleCloseModal()
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button type="button" variant="ghost" size="icon-sm" onClick={(e) => handleOpenModal(e, ModalType.EDIT)} />
          }
        >
          <EditIcon className="size-4 text-[var(--color-border-main)]" />
        </TooltipTrigger>
        <TooltipContent>{translateMessage('ui.editContact_f59645be')}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={(e) => handleOpenModal(e, ModalType.REMOVE)}
            />
          }
        >
          <DeleteIcon className="size-4 text-[var(--color-error-main)]" />
        </TooltipTrigger>
        <TooltipContent>{translateMessage('ui.deleteContact_f4540923')}</TooltipContent>
      </Tooltip>

      {open[ModalType.EDIT] && (
        <EntryDialog
          handleClose={handleCloseModal}
          defaultValues={{ name: entry.name, address: entry.address }}
          disableAddressInput
          chainIds={entry.chainIds}
        />
      )}

      {open[ModalType.REMOVE] && (
        <ModalDialog
          open
          onClose={handleCloseModal}
          dialogTitle={translateMessage('ui.deleteContact_f4540923')}
          hideChainIndicator
        >
          <div className="px-6 py-4">
            <Typography variant="paragraph-small">
              {translateMessage('ui.thisRemoves_9540a3d2')}
              <b>{entry.name}</b> {translateMessage('ui.fromTheAddressBookInThis_bfa8887b')}
            </Typography>
          </div>
          <DialogActions
            className="px-6 pt-0 pb-6"
            onCancel={handleCloseModal}
            cancelTestId="cancel-btn"
            confirmLabel={translateMessage('ui.delete_6cba6a2c')}
            onConfirm={handleRemove}
            confirmDestructive
            confirmTestId="delete-btn"
          />
        </ModalDialog>
      )}
    </>
  )
}

export default LocalContactActions
