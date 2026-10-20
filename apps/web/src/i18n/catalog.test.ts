import english from './locales/en.json'
import chinese from './locales/zh-CN.json'
import viewEnglish from '@safe-global/views/i18n/locales/en.json'
import viewChinese from '@safe-global/views/i18n/locales/zh-CN.json'

const originalBrandedAnnouncements = new Set([
  '工作空间已于 2026 年 10 月 6 日迁移至 8379',
  '工作空间将于 2026 年 10 月 6 日迁移至 8379',
])

const placeholders = (text: string) =>
  [...text.matchAll(/\{\{(\w+)\}\}/g)].map((match) => match[1].replace(/_(plural|day|be)$/, ''))

describe.each([
  ['web', chinese, english],
  ['views', viewChinese, viewEnglish],
] as const)('%s translation resources', (_name, zh, en) => {
  const chineseMessages: Record<string, string> = zh
  const englishMessages: Record<string, string> = en

  it('has matching language keys', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort())
  })

  it('retains interpolation parameters and 8379 branding', () => {
    for (const [key, value] of Object.entries(chineseMessages)) {
      const englishValue = englishMessages[key]
      expect(englishValue.length).toBeGreaterThan(0)
      for (const parameter of placeholders(value)) {
        expect(placeholders(englishValue)).toContain(parameter)
      }
      if (value.includes('8379')) expect(englishValue).toContain('8379')
    }
  })

  it('only preserves Chinese in English for the unchanged custom 8379 announcements', () => {
    for (const [key, value] of Object.entries(englishMessages)) {
      if (/[\u3400-\u9fff]/.test(value)) {
        expect(originalBrandedAnnouncements.has(value)).toBe(true)
        expect(chineseMessages[key]).toBe(value)
      }
    }
  })
})
