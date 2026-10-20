import { refreshSpaceEntitlements } from './refreshSpaceEntitlements'

describe('refreshSpaceEntitlements', () => {
  it('does not dispatch an entitlement request while Pro is disabled', async () => {
    const dispatch = jest.fn()
    expect(await refreshSpaceEntitlements(dispatch, 'space-1')).toEqual({ data: undefined })
    expect(dispatch).not.toHaveBeenCalled()
  })
})
