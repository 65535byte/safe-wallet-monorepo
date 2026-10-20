import { translateMessage } from '@/i18n'
import type { FormEvent } from 'react'
import { Button } from '@safe-global/views/components/ui/button'
import { Input } from '@safe-global/views/components/ui/input'
import { Field, FieldLabel } from '@safe-global/views/components/ui/field'
import { Typography } from '@safe-global/views/components/ui/typography'
import ModalDialog from '@/components/common/ModalDialog'
import pkStore from './pk-popup-store'
const { useStore, setStore } = pkStore

const PkModulePopup = () => {
  const { isOpen, privateKey } = useStore() ?? { isOpen: false, privateKey: '' }

  const onClose = () => {
    setStore({ isOpen: false, privateKey })
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const privateKey = (e.target as unknown as { 'private-key': HTMLInputElement })['private-key'].value

    setStore({
      isOpen: false,
      privateKey,
    })
  }

  return (
    <ModalDialog
      dialogTitle={translateMessage('ui.connectWithPrivateKey_8bb73454')}
      onClose={onClose}
      open={isOpen}
      className="z-[var(--z-above-onboard)]"
      overlayClassName="z-[var(--z-above-onboard)]"
    >
      <div className="p-4">
        <Typography className="mb-6">{translateMessage('ui.enterYourSignerPrivateKeyThe_46f5477b')}</Typography>

        <form onSubmit={onSubmit} action="#" method="post">
          <Field className="mb-6">
            <FieldLabel htmlFor="private-key">{translateMessage('ui.privateKey_c790df19')}</FieldLabel>
            <Input type="password" required id="private-key" name="private-key" data-testid="private-key-input" />
          </Field>

          <Button data-testid="pk-connect-btn" type="submit" className="w-full">
            {translateMessage('ui.connect_32941c64')}
          </Button>
        </form>
      </div>
    </ModalDialog>
  )
}

export default PkModulePopup
