import { translateMessage } from '@/i18n'
import { upsertAddressBookEntries } from '@/store/addressBookSlice'
import { useAppDispatch } from '@/store'
import AddContactDialog from './AddContactDialog'

const AddLocalContact = () => {
  const dispatch = useAppDispatch()

  return (
    <AddContactDialog
      triggerLabel={translateMessage('ui.addContact_fa12fe86')}
      dialogTitle={translateMessage('ui.addContact_fa12fe86')}
      intro={translateMessage('ui.thisContactIsStoredLocallyIn_020fddaf')}
      successMessage={translateMessage('ui.contactAdded_37b4ac8f')}
      successGroupKey="add-local-contact-success"
      submit={(item) => {
        dispatch(upsertAddressBookEntries({ chainIds: item.chainIds, address: item.address, name: item.name }))
        return Promise.resolve({})
      }}
    />
  )
}

export default AddLocalContact
