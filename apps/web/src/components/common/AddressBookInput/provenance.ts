import { translateMessage } from '@/i18n'
import { ContactSource, type ExtendedContact } from '@/hooks/useAllAddressBooks'
import { formatTimeInWords } from '@safe-global/utils/utils/date'

export type RecipientContact = ExtendedContact

const parseTimestamp = (timestamp?: string): number | undefined => {
  if (!timestamp) return undefined
  const time = Date.parse(timestamp)
  return Number.isNaN(time) ? undefined : time
}

export const formatRelativeTime = (timestamp: string): string | undefined => {
  const time = parseTimestamp(timestamp)
  return time === undefined ? undefined : formatTimeInWords(time)
}

export const formatExactTime = (timestamp: string): string | undefined => {
  const time = parseTimestamp(timestamp)
  return time === undefined
    ? undefined
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(time)
}

export type ProvenanceLine = {
  text: string
  actor?: string
  timestamp?: string
}

export const getProvenanceLine = (
  contact: RecipientContact,
  memberName?: string,
  resolveName?: (address: string) => string,
): ProvenanceLine | undefined => {
  if (contact.source === ContactSource.local) {
    return { text: translateMessage('ui.savedOnThisDevice_bfcd04cd') }
  }

  if (contact.createdBy) {
    // Prefer the space member name, then an address book name; otherwise show the
    // raw actor value (name, email, or address) as-is — the UI ellipsizes it
    return {
      text: translateMessage('ui.addedBy_8b1e27ae'),
      actor: memberName || resolveName?.(contact.createdBy) || contact.createdBy,
      timestamp: contact.createdAt || undefined,
    }
  }

  return undefined
}
