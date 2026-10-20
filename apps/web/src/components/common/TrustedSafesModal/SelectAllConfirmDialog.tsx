import { translateMessage } from '@/i18n'
import { TriangleAlert } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@safe-global/views/components/ui/dialog'
import { Button } from '@safe-global/views/components/ui/button'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import EthHashInfo from '@/components/common/EthHashInfo'
import type { SelectableItem } from './useTrustedSafesModal.types'

interface SelectAllConfirmDialogProps {
  open: boolean
  similarAddresses: SelectableItem[]
  onConfirm: () => void
  onSkip: () => void
  onCancel: () => void
}

const SelectAllConfirmDialog = ({
  open,
  similarAddresses,
  onConfirm,
  onSkip,
  onCancel,
}: SelectAllConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{translateMessage('ui.similarAddressesDetected_f8d9af4a')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-4">
          <Alert variant="warning" outlined={false}>
            <AlertSeverityIcon variant="warning" />
            <AlertDescription>
              {similarAddresses.length} 8379{similarAddresses.length === 1 ? '' : 's'}{' '}
              {translateMessage('ui.inYourListCloselyResembleOther_720b10ff')}
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground">
            {translateMessage('ui.theFollowingAddressesHaveBeenFlagged_156dc4ed')}
          </p>

          <ul className="max-h-[200px] overflow-auto rounded-md border border-border/50 bg-background">
            {similarAddresses.map((item) => (
              <li key={item.address} className="px-3 py-2">
                <div className="w-full">
                  <EthHashInfo address={item.address} showCopyButton shortAddress={false} showAvatar avatarSize={24} />
                  {item.name && <span className="text-xs text-muted-foreground">{item.name}</span>}
                </div>
              </li>
            ))}
          </ul>

          <p className="text-sm text-muted-foreground">{translateMessage('ui.doYouWantToIncludeThese_945046e3')}</p>
        </div>

        <DialogFooter>
          <Button onClick={onSkip} variant="ghost">
            {translateMessage('ui.noSkipSimilarAddresses_b8284cb0')}
          </Button>
          <Button onClick={onConfirm}>
            <TriangleAlert className="size-4" />
            {translateMessage('ui.yesIncludeThemAnyway_904d101d')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SelectAllConfirmDialog
