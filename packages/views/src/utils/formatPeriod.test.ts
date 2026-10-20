import { getDetailedPeriod, getPeriod } from './formatPeriod'

describe('Chinese period labels', () => {
  it.each([
    [60, '1 分钟'],
    [120, '2 分钟'],
    [3600, '1 小时'],
    [86400, '1 天'],
    [90000, '1 天'],
  ])('shows the largest unit for %i seconds', (seconds, label) => {
    expect(getPeriod(seconds)).toBe(label)
  })

  it('does not round sub-minute durations up to a minute', () => {
    expect(getPeriod(59)).toBeUndefined()
    expect(getPeriod(0)).toBeUndefined()
  })

  it('keeps every nonzero unit in detailed recovery periods', () => {
    expect(getDetailedPeriod(90061)).toBe('1 天 1 小时 1 分钟 1 秒')
    expect(getDetailedPeriod(65)).toBe('1 分钟 5 秒')
    expect(getDetailedPeriod(0)).toBe('')
  })
})
