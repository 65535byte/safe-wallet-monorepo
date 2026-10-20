import { translateMessage } from '@/i18n'
import type { ParseResult } from 'papaparse'

import { validateAddress } from '@safe-global/utils/utils/validation'

export const abCsvReaderValidator = ({ size }: File): string[] | undefined => {
  if (size > 1_000_000) {
    return [translateMessage('ui.addressBookCannotBeLargerThan_ac61ad31')]
  }
}

export const hasValidAbHeader = (header: string[]) => {
  return header.length === 3 && header[0] === 'address' && header[1] === 'name' && header[2] === 'chainId'
}

export const hasValidAbEntryAddresses = (entries: string[][]) => {
  return entries.every((entry) => entry.length >= 1 && !validateAddress(entry[0]))
}

export const hasValidAbNames = (entries: string[][]) => {
  return entries.every((entry) => entry.length >= 2 && !!entry[1])
}

export const abOnUploadValidator = ({ data, errors }: ParseResult<string[]>): string | undefined => {
  const [header, ...entries] = data

  // papaparse error
  if (errors.length > 0) {
    return errors[0].message
  }

  // Empty CSV
  if (data.length === 0) {
    return translateMessage('ui.cSVFileIsEmpty_c0732858')
  }

  // Wrong header
  if (!hasValidAbHeader(header)) {
    return translateMessage('ui.invalidOrCorruptAddressBookHeader_e1522261')
  }

  // No entries
  if (entries.length === 0) {
    return translateMessage('ui.noEntriesFoundInAddressBook_9e90c5a3')
  }

  // We + 2 to each row to make up for header and index

  // An entry has invalid address
  if (!hasValidAbEntryAddresses(entries)) {
    const i = entries.findIndex((entry) => (entry.length >= 1 ? validateAddress(entry[0]) : true))
    return translateMessage('ui.addressBookContainsAnInvalidAddress_a3648ad6', { p0: i + 2 })
  }

  // An entry has invalid name
  if (!hasValidAbNames(entries)) {
    const i = entries.findIndex((entry) => (entry.length >= 2 ? !entry[1] : true))
    return translateMessage('ui.addressBookContainsAnInvalidName_e70ba747', { p0: i + 2 })
  }
}
