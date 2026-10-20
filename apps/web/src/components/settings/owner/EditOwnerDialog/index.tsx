import { translateMessage } from '@/i18n'
import EthHashInfo from '@/components/common/EthHashInfo'
import ModalDialog from '@/components/common/ModalDialog'
import NameInput from '@/components/common/NameInput'
import Track from '@/components/common/Track'
import { SETTINGS_EVENTS } from '@/services/analytics/events/settings'
import { useAppDispatch } from '@/store'
import EditIcon from '@safe-global/views/assets/images/common/edit.svg'
import { Button } from '@safe-global/views/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { upsertAddressBookEntries } from '@/store/addressBookSlice'

type EditOwnerValues = {
  name: string
}

export const EditOwnerDialog = ({ chainId, address, name }: { chainId: string; address: string; name?: string }) => {
  const [open, setOpen] = useState(false)

  const dispatch = useAppDispatch()

  const handleClose = () => setOpen(false)

  const onSubmit = (data: EditOwnerValues) => {
    if (data.name !== name) {
      dispatch(
        upsertAddressBookEntries({
          chainIds: [chainId],
          address,
          name: data.name,
        }),
      )
      handleClose()
    }
  }

  const formMethods = useForm<EditOwnerValues>({
    defaultValues: {
      name: name || '',
    },
    mode: 'onChange',
  })

  const { handleSubmit, formState, watch } = formMethods

  const nameValue = watch('name')

  const buttonDisabled = !formState.isValid || nameValue === name || nameValue === ''

  return (
    <>
      <Track {...SETTINGS_EVENTS.SETUP.EDIT_OWNER}>
        <Tooltip>
          <TooltipTrigger
            render={
              <span>
                <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
                  <EditIcon className="size-4 text-muted-foreground" />
                </Button>
              </span>
            }
          />
          <TooltipContent>{translateMessage('ui.editSigner_3d66ed5c')}</TooltipContent>
        </Tooltip>
      </Track>

      <ModalDialog open={open} onClose={handleClose} dialogTitle={translateMessage('ui.editSignerName_4c615c29')}>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6">
              <div className="py-4">
                <NameInput label={translateMessage('ui.signerName_8893c373')} name="name" required />
              </div>

              <div className="py-4">
                <EthHashInfo address={address} showCopyButton shortAddress={false} />
              </div>
            </div>

            <div className="flex justify-between gap-2 p-6 pt-0">
              <Button variant="outline" onClick={handleClose}>
                {translateMessage('ui.cancel_d94a8eaf')}
              </Button>
              <Button type="submit" disabled={buttonDisabled}>
                {translateMessage('ui.save_5fe30f30')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </ModalDialog>
    </>
  )
}
