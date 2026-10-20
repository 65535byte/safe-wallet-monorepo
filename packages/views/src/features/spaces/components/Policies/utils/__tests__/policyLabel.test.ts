import {
  MOCK_ADDRESSES,
  asActivePolicy,
  mockMultiSpenderPolicy,
  mockPendingRemoval,
  mockProposerPolicy,
  mockRecoveryPolicy,
  mockSpendingLimitPolicy,
} from '@/features/spaces/components/Policies/mocks/policies'
import {
  formatAllowance,
  formatContactLabel,
  getPolicyLabel,
  getPolicySummary,
  getResetPeriodLabel,
} from '../policyLabel'

describe('getResetPeriodLabel', () => {
  it('should, when the period is zero, label it as one time', () => {
    expect(getResetPeriodLabel(0)).toBe('一次性')
  })

  it('should, when the period is one day, label it as day', () => {
    expect(getResetPeriodLabel(1_440)).toBe('day')
  })

  it('should, when the period is seven days, label it as week', () => {
    expect(getResetPeriodLabel(1_440 * 7)).toBe('week')
  })

  it('should, when the period is thirty days, label it as month', () => {
    expect(getResetPeriodLabel(1_440 * 30)).toBe('month')
  })

  it('should, when the period is one of the short test periods, label it in minutes', () => {
    expect(getResetPeriodLabel(5)).toBe('5 分钟')
  })

  it('should, when the period is not one the design names, fall back to minutes', () => {
    expect(getResetPeriodLabel(1234)).toBe('1234 分钟')
  })

  // CGW returns minutes; reading them as seconds silently mislabels every repeating period.
  it('should, when handed a seconds-valued period, not resolve a named label', () => {
    expect(getResetPeriodLabel(86_400)).toBe('86400 分钟')
  })
})

describe('formatAllowance', () => {
  it('should, when the allowance repeats, render the amount, the token and the period', () => {
    const allowance = mockSpendingLimitPolicy().data.spenders[0].allowances[0]

    expect(formatAllowance(allowance)).toBe('1,500 USDC / month')
  })

  it('should, when the allowance does not repeat, render it as one time', () => {
    const allowance = mockSpendingLimitPolicy().data.spenders[0].allowances[0]

    expect(formatAllowance({ ...allowance, resetPeriodMinutes: 0, resetsAtMinute: null })).toBe('1,500 USDC，仅一次')
  })
})

describe('getPolicyLabel', () => {
  it('should, when the policy is a spending limit, label it Spending limit', () => {
    expect(getPolicyLabel(asActivePolicy(mockSpendingLimitPolicy()))).toBe('支出限额')
  })

  it('should, when the policy is a recovery, label it Account recovery', () => {
    expect(getPolicyLabel(asActivePolicy(mockRecoveryPolicy()))).toBe('账户恢复')
  })

  it('should, when the policy is a proposer grant, label it Proposer', () => {
    expect(getPolicyLabel(asActivePolicy(mockProposerPolicy()))).toBe('提案人')
  })
})

describe('getPolicySummary', () => {
  it('should, when a spending limit holds one allowance, summarise it as that allowance', () => {
    const policy = mockSpendingLimitPolicy()
    policy.data.spenders[0].allowances = [policy.data.spenders[0].allowances[0]]

    expect(getPolicySummary(asActivePolicy(policy))).toBe('1,500 USDC / month')
  })

  it('should, when a spending limit holds several spenders, summarise it by counting them', () => {
    expect(getPolicySummary(asActivePolicy(mockMultiSpenderPolicy()))).toBe('3 spenders · 4 项限额')
  })

  it('should, when a spending limit holds no allowances, still return a summary', () => {
    const policy = mockSpendingLimitPolicy()
    policy.data.spenders = []

    expect(getPolicySummary(asActivePolicy(policy))).toBe('未设置限额')
  })

  it('should, when the policy is a recovery, summarise it by its review window', () => {
    expect(getPolicySummary(asActivePolicy(mockRecoveryPolicy()))).toBe('28 days 审核期')
  })

  it('should, when the policy is a proposer grant, summarise it as never expiring', () => {
    expect(getPolicySummary(asActivePolicy(mockProposerPolicy()))).toBe('永不过期')
  })

  it('should, when a removal is queued, say the limit is being removed rather than gone', () => {
    expect(getPolicySummary(mockPendingRemoval())).toMatch(/^Removing /)
  })

  it('should, when a queued removal drops a spender with no limits, name the spender count', () => {
    const removal = mockPendingRemoval()
    removal.data = { spenders: [{ spender: MOCK_ADDRESSES.alice, allowances: [] }] }

    expect(getPolicySummary(removal)).toBe('Removing 1 位支出授权人')
  })
})

describe('formatContactLabel', () => {
  const address = '0x8675B754342754A30A2AeF474D114d8460bca19b'

  it('puts the shortened address in parentheses after the name', () => {
    expect(formatContactLabel(address, 'Nicole')).toBe('Nicole (0x8675...a19b)')
  })

  it('falls back to the shortened address without a name', () => {
    expect(formatContactLabel(address)).toBe('0x8675...a19b')
    expect(formatContactLabel(address, '')).toBe('0x8675...a19b')
  })
})
