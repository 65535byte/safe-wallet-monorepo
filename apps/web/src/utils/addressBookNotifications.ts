import { translateMessage } from '@/i18n'
// `bookLabel` is "your address book" or "{Workspace name} address book".

export const getContactAddedMessage = (bookLabel: string): string =>
  translateMessage('ui.contactAddedTo_8129e256', { p0: bookLabel })

export const getContactUpdatedMessage = (bookLabel: string): string =>
  translateMessage('ui.contactUpdatedIn_69a7a1b9', { p0: bookLabel })

export const getContactRemovedMessage = (bookLabel: string): string =>
  translateMessage('ui.contactRemovedFrom_0acf6029', { p0: bookLabel })

export const getImportSuccessMessage = ({
  count,
  networkCount,
  bookLabel,
}: {
  count: number
  networkCount: number
  bookLabel: string
}): string => {
  const contactLabel = count === 1 ? 'contact' : 'contacts'
  const base = translateMessage('ui.importedTo_d1936270', { p0: count, p1: contactLabel, p2: bookLabel })

  return networkCount > 1
    ? translateMessage('ui.acrossNetworksOnlyContactsOnThe_f3fa477e', { p0: base, p1: networkCount })
    : base
}

export const PERSONAL_ADDRESS_BOOK_LABEL = translateMessage('ui.yourAddressBook_02905168')

export const WORKSPACE_ADDRESS_BOOK_FALLBACK_LABEL = translateMessage('ui.theWorkspaceAddressBook_41f26a12')

export const getWorkspaceAddressBookLabel = (spaceName: string): string =>
  translateMessage('ui.addressBook_5e9ea564', { p0: spaceName })

export const ADMIN_ONLY_RENAME_MESSAGE = translateMessage('ui.onlyWorkspaceAdminsCanRenameThis_b67da656')

export const ADMIN_ONLY_EDIT_CONTACT_MESSAGE = translateMessage('ui.onlyWorkspaceAdminsCanEditContacts_ad903f95')

export const ADMIN_ONLY_DELETE_CONTACT_MESSAGE = translateMessage('ui.onlyWorkspaceAdminsCanDeleteContacts_1969f848')
