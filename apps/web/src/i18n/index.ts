import { registerMessages, translateMessage as translateViewMessage } from '@safe-global/views/i18n'
import type { MessageValues } from '@safe-global/views/i18n'
import english from './locales/en.json'
import chinese from './locales/zh-CN.json'

registerMessages({ 'zh-CN': chinese, en: english })

export type MessageKey = keyof typeof chinese | 'language.label' | 'language.saveError'
export const translateMessage = (key: MessageKey, values?: MessageValues): string => translateViewMessage(key, values)

export { getLanguage, isLanguage, setLanguage } from '@safe-global/views/i18n'
export type { Language, MessageValues } from '@safe-global/views/i18n'
