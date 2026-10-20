import chains from '@safe-global/utils/config/chains'
import { getResetTimeOptions } from '../constants'

describe('getResetTimeOptions', () => {
  it('offers only the production periods on a production chain', () => {
    expect(getResetTimeOptions('1').map((option) => option.label)).toEqual(['一次性', '1 天', '1 周', '1 个月'])
  })

  it('offers the production periods and the short test periods on Sepolia, shortest first', () => {
    expect(getResetTimeOptions(chains.sep).map((option) => option.value)).toEqual([
      '0',
      '5',
      '30',
      '60',
      '1440',
      '10080',
      '43200',
    ])
  })

  it('keeps the same labels for the test periods the e2e suite already relies on', () => {
    const labels = getResetTimeOptions(chains.sep).map((option) => option.label)

    expect(labels).toEqual(['一次性', '5 分钟', '30 分钟', '1 小时', '1 天', '1 周', '1 个月'])
  })

  it('falls back to the production periods without a chain id', () => {
    expect(getResetTimeOptions()).toHaveLength(4)
  })

  it('does not mutate the production list when building the test-chain list', () => {
    getResetTimeOptions(chains.sep)

    expect(getResetTimeOptions('1')).toHaveLength(4)
  })
})
