import { translateMessage } from '@/i18n'
import * as React from 'react'
import type { SafeApp as SafeAppData } from '@safe-global/store/gateway/AUTO_GENERATED/safe-apps'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import ModalDialog from '@/components/common/ModalDialog'

type Props = {
  open: boolean
  app: SafeAppData
  onClose: () => void
  onConfirm: (appId: number) => void
}

const RemoveCustomAppModal = ({ open, onClose, onConfirm, app }: Props) => (
  <ModalDialog open={open} onClose={onClose} dialogTitle={translateMessage('ui.confirmAppRemoval_4db7d29b')}>
    <div className="px-6 pb-4">
      <Typography variant="h4" className="pt-6">
        {translateMessage('ui.areYouSureYouWantTo_8d354e23')}
        <b>{app.name}</b> {translateMessage('ui.app_c46161e9')}
      </Typography>
    </div>
    <div className="flex justify-between gap-2 p-6 pt-2">
      <Button variant="ghost" onClick={onClose}>
        {translateMessage('ui.cancel_d94a8eaf')}
      </Button>
      <Button variant="destructive" onClick={() => onConfirm(app.id)}>
        {translateMessage('ui.remove_1498adee')}
      </Button>
    </div>
  </ModalDialog>
)

export { RemoveCustomAppModal }
