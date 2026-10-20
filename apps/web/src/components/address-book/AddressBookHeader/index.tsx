import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { Plus } from 'lucide-react'
import Link from 'next/link'

import AddressBookSearchInput from '@/components/common/AddressBookSearchInput'
import Track from '@/components/common/Track'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Button } from '@safe-global/views/components/ui/button'
import { Link as ShadcnLink } from '@safe-global/views/components/ui/link'
import { ADDRESS_BOOK_EVENTS } from '@/services/analytics/events/addressBook'
import { ModalType } from '../AddressBookTable'
import { useAppSelector } from '@/store'
import { type AddressBookState, selectAllAddressBooks } from '@/store/addressBookSlice'
import ImportIcon from '@/public/images/common/import.svg'
import ExportIcon from '@/public/images/common/export.svg'
import mapProps from '@/utils/mad-props'
import { AppRoutes } from '@/config/routes'
import { useCurrentSpaceId, useIsAdmin, useIsQualifiedSafe } from '@/features/spaces'
import { isAuthenticated } from '@/store/authSlice'
import { useSpacesGetOneV1Query } from '@safe-global/store/gateway/AUTO_GENERATED/spaces'

const SpaceAddressBookCTA = () => {
  const isQualifiedSafe = useIsQualifiedSafe()
  const isAdmin = useIsAdmin()
  const spaceId = useCurrentSpaceId()
  const isUserSignedIn = useAppSelector(isAuthenticated)
  const { currentData: space } = useSpacesGetOneV1Query({ id: spaceId ?? '' }, { skip: !isUserSignedIn || !spaceId })

  if (!isQualifiedSafe || !isAdmin) return null

  return (
    <Typography className="max-w-[500px] text-sm">
      {translateMessage('ui.thisDataIsStoredInYour_cb03043c')}
      <b>{space?.name}</b> {translateMessage('ui.workspaceAddressBookInstead_15dee886')}{' '}
      <ShadcnLink render={<Link href={{ pathname: AppRoutes.spaces.addressBook, query: { spaceId } }} passHref />}>
        {translateMessage('ui.clickHere_14350b1b')}
      </ShadcnLink>
    </Typography>
  )
}

type Props = {
  allAddressBooks: AddressBookState
  handleOpenModal: (type: ModalType) => () => void
  searchQuery: string
  onSearchQueryChange: (searchQuery: string) => void
  hasEntries: boolean
}

function AddressBookHeader({
  allAddressBooks,
  handleOpenModal,
  searchQuery,
  onSearchQueryChange,
  hasEntries,
}: Props): ReactElement {
  const canExport = Object.values(allAddressBooks).some((addressBook) => Object.keys(addressBook || {}).length > 0)

  return (
    <div className="mt-8 flex flex-col gap-6 px-6">
      <SpaceAddressBookCTA />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex shrink-0 flex-wrap gap-2">
          <Track {...ADDRESS_BOOK_EVENTS.CREATE_ENTRY}>
            <Button size="action" onClick={handleOpenModal(ModalType.ENTRY)}>
              <Plus className="mr-1 size-4 text-green-500" />
              {translateMessage('ui.newEntry_48b5995d')}
            </Button>
          </Track>

          <Track {...ADDRESS_BOOK_EVENTS.IMPORT_BUTTON}>
            <Button variant="outline" size="action" onClick={handleOpenModal(ModalType.IMPORT)}>
              <ImportIcon className="size-4" />
              {translateMessage('ui.import_f0101b10')}
            </Button>
          </Track>

          <Track {...ADDRESS_BOOK_EVENTS.DOWNLOAD_BUTTON}>
            <Button variant="outline" size="action" onClick={handleOpenModal(ModalType.EXPORT)} disabled={!canExport}>
              <ExportIcon className="size-4" />
              {translateMessage('ui.export_9bb429ef')}
            </Button>
          </Track>
        </div>

        {hasEntries && (
          <AddressBookSearchInput
            value={searchQuery}
            onChange={onSearchQueryChange}
            placeholder={translateMessage('ui.searchForContacts_b534aed3')}
            inputSize="default"
          />
        )}
      </div>
    </div>
  )
}

const useAllAddressBooks = () => useAppSelector(selectAllAddressBooks)

export default mapProps(AddressBookHeader, {
  allAddressBooks: useAllAddressBooks,
})
