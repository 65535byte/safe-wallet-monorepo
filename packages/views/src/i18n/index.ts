import english from './locales/en.json'
import chinese from './locales/zh-CN.json'

export type Language = 'zh-CN' | 'en'
export type MessageValues = Record<string, unknown>
export type MessageCatalog = Record<Language, Record<string, string>>

export const DEFAULT_LANGUAGE: Language = 'zh-CN'
export const LANGUAGE_STORAGE_KEY = '8379.language'

export const isLanguage = (value: unknown): value is Language => value === 'zh-CN' || value === 'en'

export const readLanguagePreference = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguage(saved) ? saved : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

let language = readLanguagePreference()
const catalogs: MessageCatalog = { 'zh-CN': { ...chinese }, en: { ...english } }

export const getLanguage = (): Language => language

export const registerMessages = (messages: MessageCatalog): void => {
  Object.assign(catalogs['zh-CN'], messages['zh-CN'])
  Object.assign(catalogs.en, messages.en)
}

export const setLanguage = (next: Language): boolean => {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next)
  } catch {
    return false
  }
  language = next
  document.documentElement.lang = next
  return true
}

export const translateMessage = (key: string, values: MessageValues = {}): string => {
  const selected = catalogs[language]
  const fallback = catalogs[DEFAULT_LANGUAGE]
  const message = Object.prototype.hasOwnProperty.call(selected, key)
    ? selected[key]
    : Object.prototype.hasOwnProperty.call(fallback, key)
      ? fallback[key]
      : key
  return message.replace(/\{\{(\w+)\}\}/g, (placeholder, name: string) => {
    if (Object.prototype.hasOwnProperty.call(values, name)) return String(values[name])
    const derived = /^(p\d+|count)_(plural|day|be)$/.exec(name)
    if (!derived || !Object.prototype.hasOwnProperty.call(values, derived[1])) return placeholder
    const count = values[derived[1]]
    const singular = count === 1 || count === 1n || count === '1'
    if (derived[2] === 'plural') return singular ? '' : 's'
    if (derived[2] === 'day') return singular ? 'day' : 'days'
    return singular ? 'is' : 'are'
  })
}
