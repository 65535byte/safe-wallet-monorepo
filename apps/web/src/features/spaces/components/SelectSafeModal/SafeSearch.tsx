import { translateMessage } from '@/i18n'
import { SearchInput } from '@safe-global/views/components/ui/search-input'

interface SafeSearchProps {
  value: string
  onChange: (value: string) => void
}

const SafeSearch = ({ value, onChange }: SafeSearchProps) => {
  return (
    <SearchInput
      placeholder={translateMessage('ui.searchForSafes_5231b39c')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={translateMessage('ui.searchForSafes_5231b39c')}
    />
  )
}

export default SafeSearch
