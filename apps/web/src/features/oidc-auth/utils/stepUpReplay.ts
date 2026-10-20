import { translateMessage } from '@/i18n'
import { SAFE_PRO_ENABLED } from '@/config/pro'
import { cgwApi } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'
import { cgwApi as billingApi } from '@safe-global/store/gateway/AUTO_GENERATED/billing'
import type { SerializedError, ThunkAction, UnknownAction } from '@reduxjs/toolkit'
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { AppDispatch, RootState } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { getRtkQueryErrorMessage } from '@/utils/rtkQuery'
import { getQuotaExceededError } from '@safe-global/utils/services/quotaErrors'
import { navigateTo } from '@/utils/navigation'
import { isElevationRequiredError } from './elevation'

const STEP_UP_KEY = 'oidc_step_up'

const STEP_UP_MAX_AGE_MS = 5 * 60 * 1_000

/**
 * A replay sends a request again without the user clicking anything, so the
 * endpoints it can do that to are listed here rather than taken from whichever
 * request was rejected.
 *
 * @see https://github.com/safe-global/safe-client-gateway/pull/3315
 */
const REPLAYABLE_ENDPOINTS = {
  spaceSafesCreateV1: translateMessage('ui.accountAdded_4eb2fe1f'),
  spaceSafesDeleteV1: translateMessage('ui.accountRemoved_f64b09ff'),
  spacesUpdateV1: translateMessage('ui.workspaceUpdated_06c87806'),
  spacesDeleteV1: translateMessage('ui.workspaceDeleted_c65f5a9b'),
  membersInviteUserV1: translateMessage('ui.invitationSent_6c41102e'),
  membersUpdateRoleV1: translateMessage('ui.roleUpdated_51b93d9f'),
  membersRemoveUserV1: translateMessage('ui.memberRemoved_8cef92fa'),
  addressBooksUpsertAddressBookItemsV1: translateMessage('ui.addressBookUpdated_ed7995ca'),
  addressBooksDeleteByAddressV1: translateMessage('ui.addressRemovedFromTheAddressBook_70a69e31'),
  addressBookRequestsApproveRequestV1: translateMessage('ui.addressBookRequestApproved_c0c4f483'),
  billingUpdateSubscriptionV1: translateMessage('ui.planUpdated_396dfc9b'),
  billingGetCheckoutUrlV1: translateMessage('ui.openingTheCheckout_8ad4534d'),
} as const

type ReplayableEndpoint = keyof typeof REPLAYABLE_ENDPOINTS

/** Requested for the page they return: the replay sends the user there instead of confirming with a toast. */
const REDIRECTING_ENDPOINTS: ReadonlyArray<ReplayableEndpoint> = ['billingGetCheckoutUrlV1']

export type PendingStepUpAction = {
  endpoint: ReplayableEndpoint
  args: unknown
}

const REPLAY_FAILED_MESSAGE = translateMessage('ui.verificationSucceededButTheActionCould_0610fe5f')

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null

const isReplayableEndpoint = (value: string): value is ReplayableEndpoint => value in REPLAYABLE_ENDPOINTS

const getRedirectUrl = (data: unknown): string | undefined =>
  isRecord(data) && typeof data.url === 'string' ? data.url : undefined

/** Checked field by field: the listener passes an `UnknownAction`, and RTK types `meta.arg` as `unknown`. */
export const getReplayableAction = (action: UnknownAction): PendingStepUpAction | undefined => {
  const arg = isRecord(action.meta) ? action.meta.arg : undefined
  if (!isRecord(arg) || typeof arg.endpointName !== 'string') return undefined
  if (!isReplayableEndpoint(arg.endpointName)) return undefined

  return { endpoint: arg.endpointName, args: arg.originalArgs }
}

export type StepUpTrip = {
  /** Missing when the endpoint that was rejected is not in the list above. */
  action?: PendingStepUpAction
}

export const saveStepUpTrip = (action?: PendingStepUpAction): void => {
  try {
    sessionStorage.setItem(STEP_UP_KEY, JSON.stringify({ ...action, createdAt: Date.now() }))
  } catch {
    // A storage failure must not block the redirect; the session still elevates.
  }
}

/** Reads and removes in one step, so a saved request cannot run twice, or on a later return. */
export const takeStepUpTrip = (): StepUpTrip | undefined => {
  const raw = sessionStorage.getItem(STEP_UP_KEY)
  if (!raw) return undefined

  sessionStorage.removeItem(STEP_UP_KEY)

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || typeof parsed.createdAt !== 'number') return undefined
    if (Date.now() - parsed.createdAt > STEP_UP_MAX_AGE_MS) return undefined
    if (typeof parsed.endpoint !== 'string' || !isReplayableEndpoint(parsed.endpoint)) return {}

    return { action: { endpoint: parsed.endpoint, args: parsed.args } }
  } catch {
    return undefined
  }
}

// Built on demand: tests mock the generated modules partially, and a module-load spread would read `undefined`.
const replayableEndpoints = () => ({ ...cgwApi.endpoints, ...billingApi.endpoints })

type ReplayOutcome = { data?: unknown; error?: FetchBaseQueryError | SerializedError }

/**
 * `cgwApi.endpoints[name].initiate` is a different signature per endpoint, so a
 * union of names gives a union of thunks that `dispatch` rejects, and `args` lost
 * its type when it went through JSON. Collapsing both to one signature is safe
 * because an endpoint and its arguments are only ever stored together, taken from
 * the single request that was rejected.
 */
type ReplayInitiator = (args: unknown) => ThunkAction<Promise<ReplayOutcome>, RootState, unknown, UnknownAction>

const asReplayInitiator = (endpoint: ReplayableEndpoint): ReplayInitiator =>
  replayableEndpoints()[endpoint].initiate as unknown as ReplayInitiator

/** Resolves to `true` when the replay sends the browser to another page, so the caller keeps the splash up. */
export const replayStepUpAction = async (dispatch: AppDispatch, pending: PendingStepUpAction): Promise<boolean> => {
  if (!SAFE_PRO_ENABLED && pending.endpoint.startsWith('billing')) return false
  const result = await dispatch(asReplayInitiator(pending.endpoint)(pending.args))

  if (result.error) {
    // Rejected again means the user walked away from the challenge, which is a
    // cancellation and not something to report back to them.
    if (isElevationRequiredError(result.error)) return false

    const isQuotaRefusal = getQuotaExceededError(result.error) !== undefined
    dispatch(
      showNotification({
        message: getRtkQueryErrorMessage(result.error) || REPLAY_FAILED_MESSAGE,
        variant: isQuotaRefusal ? 'warning' : 'error',
        groupKey: 'step-up-replay-failed',
      }),
    )
    return false
  }

  if (REDIRECTING_ENDPOINTS.includes(pending.endpoint)) {
    const url = getRedirectUrl(result.data)
    if (url) {
      navigateTo(url)
      return true
    }
    dispatch(showNotification({ message: REPLAY_FAILED_MESSAGE, variant: 'error', groupKey: 'step-up-replay-failed' }))
    return false
  }

  // The success message must not appear while the lists still show the old data.
  // This thunk returns one promise per running query, not a single promise.
  await Promise.all(dispatch(cgwApi.util.getRunningQueriesThunk()))

  // The replay runs during page load, so a query it invalidates can still be in
  // flight when the mutation completes. RTK Query does not start a second fetch
  // for such a query, and its `delayed` invalidation does not wait for it either:
  // the pending counter behind it is also decremented by the rejection that a
  // duplicate `initiate` of the same in-flight query produces, so the counter is
  // zero while the first request is still open. The query then keeps the response
  // it gets, which may have been produced before the write. Invalidating again
  // once nothing is in flight fetches every affected query with the written data.
  // Every endpoint in `REPLAYABLE_ENDPOINTS` invalidates one of these two tags; refetching the other is harmless.
  dispatch(cgwApi.util.invalidateTags(['spaces']))
  dispatch(billingApi.util.invalidateTags(['billing']))
  await Promise.all(dispatch(cgwApi.util.getRunningQueriesThunk()))

  dispatch(
    showNotification({
      message: REPLAYABLE_ENDPOINTS[pending.endpoint],
      variant: 'success',
      groupKey: 'step-up-replay-success',
    }),
  )

  return false
}
