import { translateMessage } from '@/i18n'
import { useState } from 'react'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Button } from '@safe-global/views/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Clock, Plus } from 'lucide-react'
import InvalidContactNameTooltip from './InvalidContactNameTooltip'
import { Badge } from '@safe-global/views/components/ui/badge'
import { Typography } from '@safe-global/views/components/ui/typography'
import DialogActions from '@/components/common/DialogActions'
import ModalDialog from '@/components/common/ModalDialog'
import EthHashInfo from '@/components/common/EthHashInfo'
import { NetworkLogosTooltip } from '@/features/multichain'
import useChains from '@/hooks/useChains'
import { useAddOrRequestWorkspaceContact } from '../../hooks/useAddOrRequestWorkspaceContact'
import { validateContactName } from './utils'

type RequestToAddButtonProps = {
  address: string
  name: string
  chainIds: string[]
  alreadyRequested?: boolean
  isCompact?: boolean
}

const RequestToAddButton = ({ address, name, chainIds, alreadyRequested, isCompact }: RequestToAddButtonProps) => {
  const chains = useChains()
  const addOrRequestContact = useAddOrRequestWorkspaceContact()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [requested, setRequested] = useState(false)
  const [open, setOpen] = useState(false)

  const isDone = alreadyRequested || requested
  const nameError = validateContactName(name)

  const handleConfirm = async () => {
    if (isDone) return

    setIsSubmitting(true)
    try {
      const result = await addOrRequestContact({ address, name, chainIds })
      if (result === 'requested' || result === 'pending') {
        setRequested(true)
        setOpen(false)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDone) {
    return isCompact ? (
      <Tooltip>
        <TooltipTrigger
          render={<span className="inline-flex" aria-label={translateMessage('ui.requested_391ebaff')} />}
        >
          <Clock className="text-muted-foreground size-4" />
        </TooltipTrigger>
        <TooltipContent>{translateMessage('ui.requested_391ebaff')}</TooltipContent>
      </Tooltip>
    ) : (
      <Badge variant="secondary">{translateMessage('ui.requested_391ebaff')}</Badge>
    )
  }

  // Compact has no room for the label, so it moves into the accessible name and a tooltip
  const button = (
    <Button
      variant="outline"
      size={isCompact ? 'icon-sm' : 'sm'}
      aria-label={isCompact ? translateMessage('ui.requestToAdd_a5a8e23e') : undefined}
      onClick={() => setOpen(true)}
      disabled={!!nameError}
    >
      {isCompact ? <Plus className="size-4" /> : translateMessage('ui.requestToAdd_a5a8e23e')}
    </Button>
  )

  const trigger = isCompact ? (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>{button}</TooltipTrigger>
      <TooltipContent>{translateMessage('ui.requestToAdd_a5a8e23e')}</TooltipContent>
    </Tooltip>
  ) : (
    button
  )

  return (
    <>
      {nameError ? <InvalidContactNameTooltip nameError={nameError}>{button}</InvalidContactNameTooltip> : trigger}

      <ModalDialog
        open={open}
        onClose={() => setOpen(false)}
        dialogTitle={translateMessage('ui.requestToAddContact_03e1beb5')}
        hideChainIndicator
      >
        <div className="px-6 py-4">
          <div className="flex flex-col gap-4">
            <Typography variant="paragraph-small" color="muted">
              {translateMessage('ui.anAdminHasToApproveThe_0a08cf05')}
            </Typography>

            <div className="flex flex-col gap-1">
              <Typography variant="paragraph-small" color="muted">
                {translateMessage('ui.name_84f28b85')}
              </Typography>
              <Typography>{name}</Typography>
            </div>

            <div className="flex flex-col gap-1">
              <Typography variant="paragraph-small" color="muted">
                {translateMessage('ui.address_ad6c5986')}
              </Typography>
              <EthHashInfo address={address} shortAddress={false} showPrefix={false} showName={false} avatarSize={24} />
            </div>

            <div className="flex flex-col gap-2">
              <Typography variant="paragraph-small" color="muted">
                {translateMessage('ui.networks_e4d25fbc')}
              </Typography>
              {chains.configs.length === chainIds.length ? (
                <Typography>{translateMessage('ui.allNetworks_ec5f6f6c')}</Typography>
              ) : (
                <NetworkLogosTooltip
                  networks={chainIds.map((chainId) => ({ chainId }))}
                  maxVisible={6}
                  triggerRender={<span className="inline-flex" />}
                />
              )}
            </div>

            {nameError && (
              <Alert variant="warning" outlined={false}>
                <AlertSeverityIcon variant="warning" />
                <AlertDescription>
                  {translateMessage('ui.renameThisContactToShareIt_0df21022')}
                  {nameError}.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogActions
          className="px-6 pt-0 pb-6"
          onCancel={() => setOpen(false)}
          cancelTestId="cancel-btn"
          confirmLabel={translateMessage('ui.requestToAdd_a5a8e23e')}
          onConfirm={handleConfirm}
          confirmTestId="confirm-request-btn"
          confirmDisabled={!!nameError || isSubmitting}
          confirmLoading={isSubmitting}
        />
      </ModalDialog>
    </>
  )
}

export default RequestToAddButton
