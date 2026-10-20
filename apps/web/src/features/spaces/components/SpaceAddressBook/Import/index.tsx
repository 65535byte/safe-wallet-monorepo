import { translateMessage } from '@/i18n'
import ImportIcon from '@/public/images/common/import.svg'
import { useMemo, useState } from 'react'
import ImportAddressBookDialog from './ImportAddressBookDialog'
import { Button } from '@safe-global/views/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import useAllAddressBooks from '@/hooks/useAllAddressBooks'
import { flattenAddressBook } from '../utils'

const ImportAddressBook = () => {
  const [open, setOpen] = useState(false)
  const allAddressBooks = useAllAddressBooks()
  const hasContacts = useMemo(() => flattenAddressBook(allAddressBooks).length > 0, [allAddressBooks])

  return (
    <>
      <Tooltip>
        <TooltipTrigger render={<div className="inline-flex" />}>
          <Button variant="outline" size="action" disabled={!hasContacts} onClick={() => setOpen(true)}>
            <ImportIcon className="size-4" />
            {translateMessage('ui.import_f0101b10')}
          </Button>
        </TooltipTrigger>
        {!hasContacts && <TooltipContent>{translateMessage('ui.youDonTHaveAnyContacts_f858984e')}</TooltipContent>}
      </Tooltip>
      {open && <ImportAddressBookDialog handleClose={() => setOpen(false)} />}
    </>
  )
}

export default ImportAddressBook
