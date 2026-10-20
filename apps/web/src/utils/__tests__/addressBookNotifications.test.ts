import {
  getContactAddedMessage,
  getContactRemovedMessage,
  getContactUpdatedMessage,
  getImportSuccessMessage,
  getWorkspaceAddressBookLabel,
  PERSONAL_ADDRESS_BOOK_LABEL,
} from '../addressBookNotifications'

describe('addressBookNotifications', () => {
  it('builds add/update/remove messages for the personal book', () => {
    expect(getContactAddedMessage(PERSONAL_ADDRESS_BOOK_LABEL)).toBe('联系人已添加到 your address book')
    expect(getContactUpdatedMessage(PERSONAL_ADDRESS_BOOK_LABEL)).toBe('联系人已在 your address book 中更新')
    expect(getContactRemovedMessage(PERSONAL_ADDRESS_BOOK_LABEL)).toBe('联系人已从 your address book 中移除')
  })

  it('builds add/update/remove messages for a named workspace book', () => {
    const label = getWorkspaceAddressBookLabel('Acme')
    expect(label).toBe('Acme 通讯录')
    expect(getContactAddedMessage(label)).toBe('联系人已添加到 Acme address book')
    expect(getContactUpdatedMessage(label)).toBe('联系人已在 Acme address book 中更新')
    expect(getContactRemovedMessage(label)).toBe('联系人已从 Acme address book 中移除')
  })

  it('pluralizes the import message and appends the multi-network hint', () => {
    expect(getImportSuccessMessage({ count: 1, networkCount: 1, bookLabel: PERSONAL_ADDRESS_BOOK_LABEL })).toBe(
      '1 contact 已导入至 your address book',
    )
    expect(getImportSuccessMessage({ count: 3, networkCount: 1, bookLabel: PERSONAL_ADDRESS_BOOK_LABEL })).toBe(
      '3 contacts 已导入至 your address book',
    )
    expect(
      getImportSuccessMessage({ count: 10, networkCount: 5, bookLabel: getWorkspaceAddressBookLabel('Acme') }),
    ).toBe(
      '10 contacts 已导入至 Acme address book across 5 networks. Only contacts on the current network are shown here',
    )
  })
})
