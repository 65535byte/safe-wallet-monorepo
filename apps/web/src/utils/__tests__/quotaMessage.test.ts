import { getQuotaExceededMessage } from '../quotaMessage'

const quotaError = (data: Record<string, unknown>) => ({
  status: 402,
  data: { code: 'QUOTA_EXCEEDED', quota: 20, used: 20, resetsAt: null, message: 'Quota exceeded', ...data },
})

describe('getQuotaExceededMessage', () => {
  it('says how many Safe accounts the plan covers and how many the Workspace holds', () => {
    expect(getQuotaExceededMessage(quotaError({ feature: 'safe_seats' }))).toBe(
      'Your plan covers 20 个 Safe 账户s and this Workspace already holds 20. Remove one to add another, or upgrade your plan.',
    )
  })

  it('says how many sponsored transactions were used and when they come back', () => {
    expect(
      getQuotaExceededMessage(
        quotaError({ feature: 'sponsored_transactions', quota: 50, used: 50, resetsAt: '2026-11-01T00:00:00.000Z' }),
      ),
    ).toBe('工作空间已用完本周期的 50 笔赞助交易 until Nov 1, 2026，请改用已连接钱包支付 Gas。')
  })

  it('leaves the date out when the sponsored cycle never resets', () => {
    expect(getQuotaExceededMessage(quotaError({ feature: 'sponsored_transactions', quota: 10, used: 10 }))).toBe(
      '工作空间已用完本周期的 10 笔赞助交易，请改用已连接钱包支付 Gas。',
    )
  })

  it('returns undefined for a feature without copy', () => {
    expect(getQuotaExceededMessage(quotaError({ feature: 'address_book_entries' }))).toBeUndefined()
    expect(getQuotaExceededMessage(quotaError({}))).toBeUndefined()
  })

  it('returns undefined for an error that is not a quota refusal', () => {
    expect(getQuotaExceededMessage({ status: 500, data: { message: 'Boom' } })).toBeUndefined()
  })
})
