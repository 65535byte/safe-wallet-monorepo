import { translateMessage } from '@/i18n'
import { TriangleAlert } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@safe-global/views/components/ui/dialog'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import DialogActions from '@/components/common/DialogActions'
import EthHashInfo from '@/components/common/EthHashInfo'

interface SimilarityConfirmDialogProps {
  open: boolean
  /** Only the address and name are rendered, so any flagged safe/line can be passed. */
  safe: { address: string; name?: string }
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Confirmation dialog for selecting an address flagged as similar to another address
 * Warns user about potential address poisoning attack
 */
const SimilarityConfirmDialog = ({ open, safe, onConfirm, onCancel }: SimilarityConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{translateMessage('ui.similarAddressDetected_fc23da03')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-4">
          <Alert variant="warning" outlined={false}>
            <AlertSeverityIcon variant="warning" />
            <AlertDescription>{translateMessage('ui.thisAddressIsSimilarToAnother_d5359dcd')}</AlertDescription>
          </Alert>

          <div>
            <p className="mb-1 text-sm text-muted-foreground">{translateMessage('ui.selectedSafe_cc1f931b')}</p>
            <div className="overflow-hidden rounded-md border border-border/50 bg-background p-4">
              <EthHashInfo address={safe.address} showCopyButton shortAddress={false} showAvatar avatarSize={32} />
              {safe.name && (
                <p className="mt-2 text-sm text-foreground">
                  {translateMessage('ui.name_edc01aef')}
                  {safe.name}
                </p>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {translateMessage('ui.verifyTheFullAddressCarefullyContinue_2def48de')}
          </p>
        </div>

        <DialogActions
          className="p-4"
          onCancel={onCancel}
          onConfirm={onConfirm}
          confirmLabel={
            <>
              <TriangleAlert className="size-4" />
              {translateMessage('ui.iUnderstandContinueAnyway_5a9e9229')}
            </>
          }
        />
      </DialogContent>
    </Dialog>
  )
}

export default SimilarityConfirmDialog
