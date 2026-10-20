import { useState } from 'react'
import { reloadPage } from '@/utils/navigation'
import { getLanguage, isLanguage, setLanguage, translateMessage } from '@/i18n'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@safe-global/views/components/ui/select'
import { Typography } from '@safe-global/views/components/ui/typography'

const languageNames = { 'zh-CN': '中文', en: 'English' }

const LanguageSelector = ({ disabled = false }: { disabled?: boolean }) => {
  const [language] = useState(getLanguage)
  const [hasError, setHasError] = useState(false)

  const changeLanguage = (value: string | null) => {
    if (!isLanguage(value) || value === language) return
    if (!setLanguage(value)) {
      setHasError(true)
      return
    }
    reloadPage()
  }

  return (
    <div className="flex flex-col gap-1">
      <Select value={language} items={languageNames} onValueChange={changeLanguage} disabled={disabled}>
        <SelectTrigger variant="ghost" aria-label={translateMessage('language.label')}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectItem value="zh-CN">中文</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
      {hasError && (
        <Typography variant="paragraph-mini" className="text-destructive" role="alert">
          {translateMessage('language.saveError')}
        </Typography>
      )}
    </div>
  )
}

export default LanguageSelector
