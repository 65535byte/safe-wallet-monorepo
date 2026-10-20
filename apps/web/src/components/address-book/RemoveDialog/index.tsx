import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'

import { Typography } from '@safe-global/views/components/ui/typography'
import { Button } from '@safe-global/views/components/ui/button'
import ModalDialog from '@/components/common/ModalDialog'
import { useAppDispatch } from '@/store'
import { removeAddressBookEntry } from '@/store/addressBookSlice'
import useChainId from '@/hooks/useChainId'
import useAddressBook from '@/hooks/useAddressBook'

const RemoveDialog = ({ handleClose, address }: { handleClose: () => void; address: string }): ReactElement => {
  const dispatch = useAppDispatch()
  const chainId = useChainId()
  const addressBook = useAddressBook()

  const name = addressBook?.[address]

  const handleConfirm = () => {
    dispatch(removeAddressBookEntry({ chainId, address, notify: true }))
    handleClose()
  }

  return (
    <ModalDialog open onClose={handleClose} dialogTitle={translateMessage('ui.deleteEntry_15803e49')}>
      <div className="p-6">
        <Typography>
          {translateMessage('ui.areYouSureYouWantTo_db3af30f')}
          <b>{name}</b> {translateMessage('ui.fromYourAddressBook_27bff29a')}
        </Typography>
      </div>

      <div className="flex items-center justify-between gap-2 p-6 pt-2">
        <Button variant="ghost" onClick={handleClose}>
          {translateMessage('ui.cancel_d94a8eaf')}
        </Button>
        <Button onClick={handleConfirm} variant="destructive">
          {translateMessage('ui.delete_6cba6a2c')}
        </Button>
      </div>
    </ModalDialog>
  )
}

export default RemoveDialog
