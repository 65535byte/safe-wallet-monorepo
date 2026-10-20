import { translateMessage } from '@/i18n'
export const OIDC_AUTH_PENDING_KEY = 'oidc_auth_pending'
export const OIDC_AUTH_CONNECTION_KEY = 'oidc_auth_connection'

export const STEP_UP_FAILED_MESSAGE = translateMessage('ui.verificationWasNotCompletedPleaseTry_958a55de')

/**
 * `access_denied` also covers an Action denying access or crashing, so the
 * cancellation is told apart by the description Auth0 documents for it.
 * @see https://support.auth0.com/center/s/article/troubleshooting-the-access-denied-error
 */
export const STEP_UP_CANCELLED = {
  error: 'access_denied',
  description: translateMessage('ui.userHasCanceledTheInteraction_89b687ad'),
}

export enum OidcConnection {
  EMAIL = 'email',
  GOOGLE = 'google-oauth2',
}

export const DEFAULT_SIGN_IN_ERROR_MESSAGE = translateMessage('ui.somethingWentWrongWhileSigningIn_4c6c49ee')

/**
 * Maps known OIDC/Auth0 error_description values to user-friendly messages.
 * Falls back to DEFAULT_SIGN_IN_ERROR_MESSAGE for unknown descriptions.
 */
export const SIGN_IN_ERROR_DESCRIPTION_MAP: Record<string, string> = {
  method_conflict_otp_required: translateMessage('ui.youHaveSignedInWithThis_d9ea2336'),
  method_conflict_google_required: translateMessage('ui.youHaveSignedInWithGoogle_575625c7'),
  method_conflict: translateMessage('ui.youHaveSignedInWithThis_9964a54e'),
  multiple_verified_primary_users_found: translateMessage('ui.multipleAccountsFoundWithThisEmail_918af09e'),
}
