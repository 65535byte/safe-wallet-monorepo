import { translateMessage } from '@/i18n'
const safeAccountsLimitRaw = Number.parseInt(process.env.NEXT_PUBLIC_SPACES_SAFE_ACCOUNTS_LIMIT ?? '', 10)

/**
 * Maximum number of Safe accounts a single workspace can hold. This is a spaces
 * domain rule, not sidebar config — import it from the spaces feature root.
 *
 * Note: the backend enforces the real limit but does not expose it, so this
 * client-side value can silently drift from the server's. Keep them in sync.
 */
export const SAFE_ACCOUNTS_LIMIT = !Number.isNaN(safeAccountsLimitRaw) ? safeAccountsLimitRaw : 40

/** Maximum number of workspaces a user can have. A spaces domain rule — import it from here, not from sidebar config. */
export const SPACES_LIMIT = 10

/** Maximum length of a workspace name. Enforced on both create and rename. */
export { SPACE_NAME_MAX_LENGTH } from '@safe-global/utils/validation/names'

/** Friendly notice shown when a workspace is already at the Safe accounts cap. */
export const safeAccountsLimitReachedText = (limit: number = SAFE_ACCOUNTS_LIMIT) =>
  translateMessage('ui.youVeReachedTheMaximumOf_cc53c022', { p0: limit })

export const TRIAL_DISCLAIMER = translateMessage('ui.yourPaidSubscriptionOnlyStartsOnce_07c89d36')

/** Zoho Bookings page the "Talk to sales" CTAs open in a new tab, to schedule a call with sales. */
export const CONTACT_SALES_URL = 'http://zbooking.eu/3H4cf'

/** Proposer and contact confirmations carry more than a status, so they stay a little longer than the 5s default. */
export const WORKSPACE_CONFIRMATION_HIDE_MS = 7000
