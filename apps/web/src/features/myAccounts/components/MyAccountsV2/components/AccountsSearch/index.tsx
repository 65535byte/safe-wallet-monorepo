import { translateMessage } from '@/i18n'
import { type Dispatch, type SetStateAction, useCallback } from 'react'
import debounce from 'lodash/debounce'
import { SearchInput } from '@safe-global/views/components/ui/search-input'

type AccountsSearchProps = {
  setSearchQuery: Dispatch<SetStateAction<string>>
}

const AccountsSearch = ({ setSearchQuery }: AccountsSearchProps) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(debounce(setSearchQuery, 300), [])

  return (
    <div className="w-full">
      <SearchInput
        variant="surface"
        className="shadow-xs"
        id="search-by-name"
        placeholder={translateMessage('ui.byNameAddressOrNetwork_5c37a5de')}
        aria-label={translateMessage('ui.searchAccountsByNameAddressOr_cda42767')}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  )
}

export default AccountsSearch
