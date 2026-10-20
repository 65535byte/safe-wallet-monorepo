import { translateMessage } from '@/i18n'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@safe-global/views/components/ui/dialog'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import type { ReactElement } from 'react'
import EthHashInfo from '@/components/common/EthHashInfo'
import useChainId from '@/hooks/useChainId'

interface SimilarityConfirmDialogProps {
  address: string
  similarAddresses: string[]
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Confirmation dialog shown when a user tries to select an address
 * that has been flagged for similarity to another address.
 */
export function SimilarityConfirmDialog({
  address,
  similarAddresses,
  onConfirm,
  onCancel,
}: SimilarityConfirmDialogProps): ReactElement {
  const chainId = useChainId()

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <DialogContent data-testid="similarity-confirm-dialog" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-bold">{translateMessage('ui.similarAddressDetected_fc23da03')}</DialogTitle>
        </DialogHeader>
        <div className="px-4">
          <Typography variant="paragraph-small" color="muted" className="block mb-4">
            {translateMessage('ui.thisAddressLooksSimilarToOther_c0ed952d')}
          </Typography>

          <div className="mb-4">
            <Typography variant="paragraph-small-medium" className="mb-2 block">
              {translateMessage('ui.selectedAddress_28d83737')}
            </Typography>
            <EthHashInfo address={address} chainId={chainId} showCopyButton hasExplorer shortAddress={false} />
          </div>

          {similarAddresses.length > 0 && (
            <div>
              <Typography variant="paragraph-small-medium" className="mb-2 block">
                {translateMessage('ui.similar_46e84608')}
                {similarAddresses.length === 1 ? 'address' : 'addresses'}:
              </Typography>
              {similarAddresses.map((addr) => (
                <div key={addr} className="mb-2">
                  <EthHashInfo address={addr} chainId={chainId} showCopyButton hasExplorer shortAddress={false} />
                </div>
              ))}
            </div>
          )}

          <Typography variant="paragraph-small-medium" className="mt-4 block text-[var(--color-warning-main)]">
            {translateMessage('ui.pleaseVerifyThisIsTheCorrect_098825a9')}
          </Typography>
        </div>
        <div className="flex justify-between gap-2 p-4 pt-0 pb-6">
          <Button variant="outline" onClick={onCancel} data-testid="similarity-cancel-button">
            {translateMessage('ui.cancel_d94a8eaf')}
          </Button>
          <Button onClick={onConfirm} data-testid="similarity-confirm-button">
            {translateMessage('ui.iUnderstandProceed_50587849')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
