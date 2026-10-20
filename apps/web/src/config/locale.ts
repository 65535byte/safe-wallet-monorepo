import { setDefaultOptions } from 'date-fns'
import { getLanguage } from '@/i18n'
import { getDateLocale } from '@/i18n/date'

setDefaultOptions({ locale: getDateLocale() })

if (typeof document !== 'undefined') {
  document.documentElement.lang = getLanguage()
}
