import { formatDistance } from 'date-fns'
import { setLanguage } from './index'
import { getDateLocale } from './date'

afterEach(() => setLanguage('zh-CN'))

describe('date localization', () => {
  it('uses Chinese relative dates', () => {
    setLanguage('zh-CN')
    expect(formatDistance(new Date(2026, 0, 2), new Date(2026, 0, 1), { locale: getDateLocale() })).toBe('1 天')
  })

  it('uses English relative dates', () => {
    setLanguage('en')
    expect(formatDistance(new Date(2026, 0, 2), new Date(2026, 0, 1), { locale: getDateLocale() })).toBe('1 day')
  })
})
