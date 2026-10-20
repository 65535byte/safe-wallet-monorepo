import { translateMessage } from '@/i18n'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'
import { ELEVATION_REQUIRED_MESSAGE, isElevationRequiredError } from '@/features/oidc-auth/utils/elevation'
import { getQuotaExceededMessage } from '@/utils/quotaMessage'

const HTTP_TOO_MANY_REQUESTS = 429
export const HTTP_UNAVAILABLE_FOR_LEGAL_REASONS = 451

// User-facing copy for transport-level failures, so raw JS error strings (e.g.
// "TypeError: Failed to fetch", "SyntaxError: ... is not valid JSON" from a plain-text
// "Rate limit reached" body) never reach users.
export const RTK_QUERY_ERROR_MESSAGES = {
  network: translateMessage('ui.couldnTConnectToTheServer_ec6a1d1d'),
  timeout: translateMessage('ui.theRequestTimedOutPleaseTry_f6126322'),
  rateLimit: translateMessage('ui.tooManyRequestsPleaseWaitA_fe097b1f'),
  generic: translateMessage('ui.somethingWentWrongPleaseTryAgain_1a2a47f6'),
} as const

// Shown for a blocked Safe, so the gateway's own wording — "Blocked in your region by provider
// edge-node-7", the reason for a legal block — never reaches users.
export const SAFE_UNAVAILABLE_MESSAGE = translateMessage('ui.thisAccountIsUnavailable_f1933326')

// Same general copy as `generic`, but keeps the HTTP status visible so the failure stays debuggable.
export const getGenericErrorWithStatus = (status: number): string =>
  translateMessage('ui.somethingWentWrongPleaseTryAgain_7963ce84', { p0: status })

// Backend messages are written for users, except the typed CGW refusals translated earlier (elevation, quota).
const getBackendMessage = (error: FetchBaseQueryError): string | undefined => {
  if (!('data' in error) || typeof error.data !== 'object' || !error.data) return undefined
  const { message } = error.data as Record<string, unknown>
  return typeof message === 'string' ? message : undefined
}

/**
 * Copy for a `451 Unavailable for legal reasons` response, or `undefined` for any other failure.
 * Callers use it to tell a blocked Safe apart from a generic loading error.
 */
export const getSafeUnavailableMessage = (
  error: FetchBaseQueryError | SerializedError | undefined,
): string | undefined => {
  if (!error || !('status' in error) || error.status !== HTTP_UNAVAILABLE_FOR_LEGAL_REASONS) return undefined
  return SAFE_UNAVAILABLE_MESSAGE
}

/**
 * Extract a user-friendly error message from RTK Query errors.
 *
 * Backend error payloads with a `message` are surfaced as-is (they're written for users,
 * e.g. validation messages), except the typed CGW refusals (elevation, quota), which get
 * our own copy. Transport-level failures (network drop, timeout, a non-JSON
 * body such as a plain-text "Rate limit reached") are translated to friendly copy instead
 * of leaking the raw JS error string.
 */
export const getRtkQueryErrorMessage = (error: FetchBaseQueryError | SerializedError): string => {
  if ('status' in error) {
    // FetchBaseQueryError
    const { status } = error

    if (status === 'FETCH_ERROR') return RTK_QUERY_ERROR_MESSAGES.network
    if (status === 'TIMEOUT_ERROR') return RTK_QUERY_ERROR_MESSAGES.timeout
    if (status === 'PARSING_ERROR') {
      return error.originalStatus === HTTP_TOO_MANY_REQUESTS
        ? RTK_QUERY_ERROR_MESSAGES.rateLimit
        : RTK_QUERY_ERROR_MESSAGES.generic
    }

    if (isElevationRequiredError(error)) return ELEVATION_REQUIRED_MESSAGE

    const quotaMessage = getQuotaExceededMessage(error)
    if (quotaMessage) return quotaMessage

    // HTTP error response: prefer the backend's own message when present.
    const backendMessage = getBackendMessage(error)
    if (backendMessage) return backendMessage

    if (status === HTTP_TOO_MANY_REQUESTS) return RTK_QUERY_ERROR_MESSAGES.rateLimit

    // CUSTOM_ERROR carries a developer-provided message string.
    if ('error' in error) return error.error

    return typeof status === 'number' ? getGenericErrorWithStatus(status) : RTK_QUERY_ERROR_MESSAGES.generic
  }
  // SerializedError
  return error.message || RTK_QUERY_ERROR_MESSAGES.generic
}
