import { translateMessage } from '@safe-global/views/i18n'
import type { ReactNode } from 'react'
import type { SpaceAuditLogEntryDto } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'

// Payload shapes mirror the CGW audit event taxonomy. Payloads arrive
// untyped, so every field is treated as optional and unknown event types
// fall back to a generic description.

const FALLBACK_TARGET = translateMessage('ui.aFormerMember_940a290d')

type Payload = Record<string, unknown>

const asPayload = (payload: object | undefined): Payload =>
  payload && typeof payload === 'object' ? (payload as Payload) : {}

const asString = (value: unknown): string | undefined => (typeof value === 'string' ? value : undefined)

const asCount = (value: unknown): number => (Array.isArray(value) ? value.length : 0)

const formatRole = (value: unknown): string | undefined => asString(value)?.toLowerCase()

const pluralize = (count: number, noun: string): string => `${count} ${noun}${count === 1 ? '' : 's'}`

const Em = ({ children }: { children: ReactNode }) => <span className="font-bold">{children}</span>

type Contact = { name?: string; address?: string }

const asContact = (value: unknown): Contact => {
  const item = asPayload(value as object)
  return { name: asString(item.name), address: asString(item.address) }
}

const asContacts = (value: unknown): Contact[] => (Array.isArray(value) ? value.map(asContact) : [])

const hasContactDetail = (contact: Contact): boolean => Boolean(contact.name || contact.address)

const ContactRef = ({ contact }: { contact: Contact }) => (
  <>
    {contact.name ? <Em>{contact.name}</Em> : translateMessage('ui.aContact_78d7f688')}
    {contact.address ? <span className="break-all"> ({contact.address})</span> : null}
  </>
)

export function getTargetUserId(payload: SpaceAuditLogEntryDto['payload']): number | undefined {
  const targetUserId = asPayload(payload).targetUserId
  return typeof targetUserId === 'number' ? targetUserId : undefined
}

export function getDefaultTargetDisplay(event: SpaceAuditLogEntryDto): string {
  return event.targetUser || FALLBACK_TARGET
}

export function getAuditEventDescription(
  event: SpaceAuditLogEntryDto,
  targetDisplay: string = getDefaultTargetDisplay(event),
): ReactNode {
  const payload = asPayload(event.payload)
  const target = targetDisplay

  switch (event.eventType) {
    case 'SPACE_CREATED': {
      const name = asString(payload.name)
      return name ? (
        <>
          {translateMessage('ui.createdTheWorkspace_6443711c')}
          <Em>{name}</Em>
        </>
      ) : (
        translateMessage('ui.createdTheWorkspace_6258f9eb')
      )
    }
    case 'SPACE_UPDATED': {
      const oldName = asString(asPayload(payload.old as object).name)
      const newName = asString(asPayload(payload.new as object).name)
      if (oldName && newName) {
        return (
          <>
            {translateMessage('ui.renamedTheWorkspaceFrom_7cf7b56d')}
            <Em>{oldName}</Em> {translateMessage('ui.to_e512ffaf')}
            <Em>{newName}</Em>
          </>
        )
      }
      return translateMessage('ui.updatedTheWorkspace_c5512892')
    }
    case 'SPACE_DELETED': {
      const name = asString(payload.name)
      return name ? (
        <>
          {translateMessage('ui.deletedTheWorkspace_b5da92d5')}
          <Em>{name}</Em>
        </>
      ) : (
        translateMessage('ui.deletedTheWorkspace_76928b69')
      )
    }
    case 'MEMBER_INVITED': {
      const role = formatRole(payload.role)
      return (
        <>
          {payload.reinvite === true ? 're-invited' : 'invited'} <Em>{target}</Em>
          {role ? translateMessage('ui.as_d3071f12', { p0: role }) : ''}
        </>
      )
    }
    case 'MEMBER_INVITE_ACCEPTED':
      return translateMessage('ui.acceptedTheirInvitation_e610c69c')
    case 'MEMBER_INVITE_DECLINED':
      return translateMessage('ui.declinedTheirInvitation_24555227')
    case 'MEMBER_INVITE_RENEWED':
      return (
        <>
          {translateMessage('ui.renewedTheInvitationFor_97b3dd6d')}
          <Em>{target}</Em>
        </>
      )
    case 'MEMBER_ROLE_UPDATED': {
      const oldRole = formatRole(payload.oldRole)
      const newRole = formatRole(payload.newRole)
      if (oldRole && newRole) {
        return (
          <>
            {translateMessage('ui.changedTheRoleOf_2097d9e5')}
            <Em>{target}</Em> {translateMessage('ui.from_12af86bc')}
            {oldRole} {translateMessage('ui.to_e512ffaf')}
            {newRole}
          </>
        )
      }
      return (
        <>
          {translateMessage('ui.changedTheRoleOf_2097d9e5')}
          <Em>{target}</Em>
        </>
      )
    }
    case 'MEMBER_ALIAS_UPDATED':
      return translateMessage('ui.updatedTheirAlias_6e45b0a9')
    case 'MEMBER_REMOVED':
      return (
        <>
          {translateMessage('ui.removed_594e12ac')}
          <Em>{target}</Em> {translateMessage('ui.fromTheWorkspace_17e80136')}
        </>
      )
    case 'MEMBER_LEFT':
      return payload.accountDeleted === true
        ? translateMessage('ui.leftTheWorkspaceAccountDeleted_0ce2d5ca')
        : translateMessage('ui.leftTheWorkspace_7839ea00')
    case 'SAFE_ADDED': {
      const count = asCount(payload.safes)
      return count > 0
        ? translateMessage('ui.added_5b7abc5a', { p0: pluralize(count, translateMessage('ui.account_7e251525')) })
        : translateMessage('ui.addedAccounts_84d3bb68')
    }
    case 'SAFE_REMOVED': {
      const count = asCount(payload.safes)
      return count > 0
        ? translateMessage('ui.removed_2c4043f1', { p0: pluralize(count, translateMessage('ui.account_7e251525')) })
        : translateMessage('ui.removedAccounts_f3f6fea6')
    }
    case 'ADDRESS_BOOK_UPSERTED': {
      const created = asContacts(payload.created)
      const updated = asContacts(payload.updated)
      const approvedSuffix =
        typeof payload.onBehalfOfUserId === 'number' ? translateMessage('ui.approvedRequest_576ed3c7') : ''

      if (created.length === 1 && updated.length === 0 && hasContactDetail(created[0])) {
        return (
          <>
            {translateMessage('ui.addedTheContact_5b342d55')}
            <ContactRef contact={created[0]} />
            {approvedSuffix}
          </>
        )
      }
      if (updated.length === 1 && created.length === 0 && hasContactDetail(updated[0])) {
        return (
          <>
            {translateMessage('ui.updatedTheContact_261008c1')}
            <ContactRef contact={updated[0]} />
            {approvedSuffix}
          </>
        )
      }

      const parts: string[] = []
      if (created.length > 0)
        parts.push(translateMessage('ui.added_5b7abc5a', { p0: pluralize(created.length, 'contact') }))
      if (updated.length > 0)
        parts.push(translateMessage('ui.updated_30e67c8b', { p0: pluralize(updated.length, 'contact') }))
      const summary = parts.length > 0 ? parts.join(' and ') : translateMessage('ui.updatedTheAddressBook_2615d04d')
      return `${summary}${approvedSuffix}`
    }
    case 'ADDRESS_BOOK_DELETED': {
      const contact = asContact(payload)
      return hasContactDetail(contact) ? (
        <>
          {translateMessage('ui.removedTheContact_3d87f42b')}
          <ContactRef contact={contact} />
        </>
      ) : (
        translateMessage('ui.removedAContact_fa9167b1')
      )
    }
    case 'ADDRESS_BOOK_REQUEST_CREATED': {
      const contact = asContact(payload)
      return hasContactDetail(contact) ? (
        <>
          {translateMessage('ui.requestedToAddTheContact_6b912ed5')}
          <ContactRef contact={contact} /> {translateMessage('ui.toWorkspace_b24b12d0')}
        </>
      ) : (
        translateMessage('ui.requestedToAddAContactTo_1e00e329')
      )
    }
    case 'ADDRESS_BOOK_REQUEST_REJECTED': {
      const contact = asContact(payload)
      return hasContactDetail(contact) ? (
        <>
          {translateMessage('ui.rejectedTheRequestToAddThe_81bb0112')}
          <ContactRef contact={contact} /> {translateMessage('ui.toWorkspace_b24b12d0')}
        </>
      ) : (
        translateMessage('ui.rejectedTheRequestToAddA_95a7f482')
      )
    }
    default:
      return translateMessage('ui.madeAChange_0bfb2b92')
  }
}
