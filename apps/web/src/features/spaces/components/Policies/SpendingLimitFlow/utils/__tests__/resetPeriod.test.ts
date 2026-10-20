import chains from '@safe-global/utils/config/chains'
import { getResetTimeOptions } from '@/features/spending-limits'
import { ONE_TIME_HELPER_TEXT } from '@safe-global/views/features/spaces/components/Policies/SpendingLimitFlow/constants'
import { describeResetPeriod, resetPeriodEventLabel } from '../resetPeriod'

describe('describeResetPeriod', () => {
  it('explains that a one-time limit never resets', () => {
    expect(describeResetPeriod({ label: '一次性', value: '0' })).toBe(ONE_TIME_HELPER_TEXT)
  })

  it.each([
    ['1 天', '限额每 天 重置'],
    ['1 周', '限额每 week 重置'],
    ['1 个月', '限额每 month 重置'],
    ['1 小时', '限额每 小时 重置'],
    ['5 分钟', '限额每 5 minutes 重置'],
    ['30 分钟', '限额每 30 minutes 重置'],
  ])('describes "%s" as "%s"', (label, expected) => {
    expect(describeResetPeriod({ label, value: '1' })).toBe(expected)
  })

  it('has a helper for every option the app offers on a test chain', () => {
    for (const option of getResetTimeOptions(chains.sep)) {
      expect(describeResetPeriod(option)).not.toBe('')
    }
  })

  it('renders nothing without an option', () => {
    expect(describeResetPeriod(undefined)).toBe('')
  })
})

describe('resetPeriodEventLabel', () => {
  it('reports a one-time limit with the wording the Safe-level flow uses', () => {
    expect(resetPeriodEventLabel('0', chains.sep)).toBe('一次性支出限额')
  })

  it.each([
    ['1440', '1 天'],
    ['10080', '1 周'],
    ['43200', '1 个月'],
  ])('reports %s minutes as the dropdown label "%s"', (resetTimeMin, expected) => {
    expect(resetPeriodEventLabel(resetTimeMin, '1')).toBe(expected)
  })

  it('knows the short periods a test chain offers', () => {
    expect(resetPeriodEventLabel('5', chains.sep)).toBe('5 分钟')
  })

  it('falls back to the raw minutes for a period no dropdown offers', () => {
    expect(resetPeriodEventLabel('7', '1')).toBe('7 分钟')
  })
})
