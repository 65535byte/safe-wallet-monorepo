import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  getLanguage,
  isLanguage,
  readLanguagePreference,
  registerMessages,
  setLanguage,
  translateMessage,
} from './index'

const messages = {
  'zh-CN': { 'test.amount': '授权 {{amount}} 给 {{name}}', 'test.fallback': '默认文案' },
  en: {
    'test.amount': 'Approve {{amount}} for {{name}}',
    'test.plural': '{{p0}} account{{p0_plural}}',
    'test.days': '{{p0}} {{p0_day}}',
    'test.be': 'There {{p0_be}} {{p0}} signature{{p0_plural}}',
  },
}

beforeEach(() => {
  registerMessages(messages)
  setLanguage(DEFAULT_LANGUAGE)
  window.localStorage.removeItem(LANGUAGE_STORAGE_KEY)
})

afterEach(() => {
  jest.restoreAllMocks()
  setLanguage(DEFAULT_LANGUAGE)
  window.localStorage.removeItem(LANGUAGE_STORAGE_KEY)
})

describe('web localization', () => {
  it.each(['en', 'zh-CN'])('accepts supported language %s', (language) => {
    expect(isLanguage(language)).toBe(true)
  })

  it.each([undefined, null, 'fr', 'en-US', '', '__proto__'])('rejects unsupported language %s', (language) => {
    expect(isLanguage(language)).toBe(false)
  })

  it('defaults to Chinese when no preference is saved', () => {
    expect(readLanguagePreference()).toBe('zh-CN')
  })

  it('reads and saves an English preference', () => {
    expect(setLanguage('en')).toBe(true)
    expect(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('en')
    expect(readLanguagePreference()).toBe('en')
    expect(getLanguage()).toBe('en')
    expect(document.documentElement.lang).toBe('en')
  })

  it('ignores an unsupported saved preference', () => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr')
    expect(readLanguagePreference()).toBe('zh-CN')
  })

  it('falls back to Chinese when storage cannot be read', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage is unavailable')
    })
    expect(readLanguagePreference()).toBe('zh-CN')
  })

  it('does not change language when the preference cannot be saved', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage is unavailable')
    })
    expect(setLanguage('en')).toBe(false)
    expect(getLanguage()).toBe('zh-CN')
  })

  it('interpolates strings and exact bigint amounts without translating their values', () => {
    setLanguage('en')
    const amount = 2n ** 256n - 1n
    expect(translateMessage('test.amount', { amount, name: '8379' })).toBe(`Approve ${amount} for 8379`)
  })

  it('preserves missing placeholders rather than silently dropping them', () => {
    expect(translateMessage('test.amount', { amount: 1 })).toBe('授权 1 给 {{name}}')
  })

  it('uses the default catalog when an English message is missing', () => {
    setLanguage('en')
    expect(translateMessage('test.fallback')).toBe('默认文案')
  })

  it.each([0, 1, 2])('keeps original English plural forms for count %s', (count) => {
    setLanguage('en')
    expect(translateMessage('test.plural', { p0: count })).toBe(`${count} account${count === 1 ? '' : 's'}`)
    expect(translateMessage('test.days', { p0: count })).toBe(`${count} ${count === 1 ? 'day' : 'days'}`)
    expect(translateMessage('test.be', { p0: count })).toBe(
      `There ${count === 1 ? 'is' : 'are'} ${count} signature${count === 1 ? '' : 's'}`,
    )
  })

  it('returns an unknown key unchanged', () => {
    expect(translateMessage('unknown.message')).toBe('unknown.message')
    expect(translateMessage('__proto__')).toBe('__proto__')
  })
})
