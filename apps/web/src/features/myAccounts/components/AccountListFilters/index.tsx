import { translateMessage } from '@/i18n'
import { useAppDispatch, useAppSelector } from '@/store'
import { type OrderByOption, selectOrderByPreference, setOrderByPreference } from '@/store/orderByPreferenceSlice'
import debounce from 'lodash/debounce'
import { type Dispatch, type SetStateAction, useCallback } from 'react'
import OrderByButton from '../OrderByButton'
import { SearchInput } from '@safe-global/views/components/ui/search-input'

const AccountListFilters = ({ setSearchQuery }: { setSearchQuery: Dispatch<SetStateAction<string>> }) => {
  const dispatch = useAppDispatch()
  const { orderBy } = useAppSelector(selectOrderByPreference)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(debounce(setSearchQuery, 300), [])

  const handleOrderByChange = (orderBy: OrderByOption) => {
    dispatch(setOrderByPreference({ orderBy }))
  }

  return (
    <div className="px-4 py-2">
      <div className="flex w-full items-center justify-between gap-2">
        <SearchInput
          inputSize="sm"
          className="w-full"
          id="search-by-name"
          placeholder={translateMessage('ui.searchByNameENSAddressOr_69359e90')}
          aria-label={translateMessage('ui.searchListByName_8e4b5943')}
          onChange={(e) => {
            handleSearch(e.target.value)
          }}
        />
        <OrderByButton orderBy={orderBy} onOrderByChange={handleOrderByChange} />
      </div>
    </div>
  )
}

export default AccountListFilters
