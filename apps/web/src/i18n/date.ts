import { enUS, zhCN } from 'date-fns/locale'
import { getLanguage } from './index'

export const getDateLocale = () => (getLanguage() === 'en' ? enUS : zhCN)
