import { translateMessage } from '@/i18n'
import SearchField from '@/components/common/SearchField'

interface GlobalSearchProps {
  value: string
  onChange: (value: string) => void
}

const GlobalSearch = ({ value, onChange }: GlobalSearchProps) => {
  return (
    <SearchField
      placeholder={translateMessage('ui.search_b3c8cd38')}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={translateMessage('ui.search_b3c8cd38')}
      autoFocus
    />
  )
}

export default GlobalSearch
