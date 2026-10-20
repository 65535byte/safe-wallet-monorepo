import { translateMessage } from '@/i18n'
import CheckWallet from '@/components/common/CheckWallet'
import Track from '@/components/common/Track'
import {
  encodeEIP1271Signature,
  usesV1DelegateEndpoint,
  signProposerDelegation,
  signProposerTypedDataForSafe,
} from '@/features/proposers/utils/utils'
import { useParentSafeThreshold } from '../hooks/useParentSafeThreshold'
import { buildDelegationOrigin, createDelegationMessage } from '../services/delegationMessages'
import NetworkWarning from '@/components/new-safe/create/NetworkWarning'
import useWallet from '@/hooks/wallets/useWallet'
import DeleteIcon from '@/public/images/common/delete.svg'
import { SETTINGS_EVENTS, trackEvent } from '@/services/analytics'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'
import { asError } from '@safe-global/utils/services/exceptions/utils'
import { shortenAddress } from '@safe-global/utils/utils/formatters'
import {
  useDelegatesDeleteDelegateV1Mutation,
  type Delegate,
} from '@safe-global/store/gateway/AUTO_GENERATED/delegates'
import { getDelegateTypedData } from '@safe-global/utils/services/delegates'
import React, { useState } from 'react'
import { Alert, AlertDescription, AlertSeverityIcon } from '@safe-global/views/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@safe-global/views/components/ui/dialog'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Button } from '@safe-global/views/components/ui/button'
import DialogActions from '@/components/common/DialogActions'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { XIcon } from 'lucide-react'
import madProps from '@/utils/mad-props'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain } from '@/hooks/useChains'
import { useDelegateMutations } from '@safe-global/utils/hooks/useDelegateMutations'
import useSafeAddress from '@/hooks/useSafeAddress'
import { getAssertedChainSigner } from '@/services/tx/tx-sender/sdk'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { getProposerErrorText } from '@/features/proposers/utils/proposerErrors'
import { useNestedSafeOwners } from '@/hooks/useNestedSafeOwners'
import { sameAddress } from '@safe-global/utils/utils/addresses'

type DeleteProposerProps = {
  wallet: ReturnType<typeof useWallet>
  safeAddress: ReturnType<typeof useSafeAddress>
  chainId: ReturnType<typeof useChainId>
  chain: ReturnType<typeof useCurrentChain>
  proposer: Delegate
}

const InternalDeleteProposer = ({ wallet, safeAddress, chainId, chain, proposer }: DeleteProposerProps) => {
  const [open, setOpen] = useState<boolean>(false)
  const [error, setError] = useState<Error>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [multiSigInitiated, setMultiSigInitiated] = useState<boolean>(false)
  const [deleteDelegateV1] = useDelegatesDeleteDelegateV1Mutation()
  const { deleteDelegate } = useDelegateMutations()
  const dispatch = useAppDispatch()
  const nestedSafeOwners = useNestedSafeOwners()

  // For delete, the delegator is always the original creator (proposer.delegator).
  // Determine if it's a nested Safe to decide the signing path.
  const isNestedDelegator = nestedSafeOwners?.some((addr) => sameAddress(addr, proposer.delegator)) ?? false
  const parentSafeAddress = isNestedDelegator ? proposer.delegator : undefined
  const {
    threshold: parentThreshold,
    owners: parentOwners,
    isLoading: isParentLoading,
  } = useParentSafeThreshold(parentSafeAddress)

  const isMultiSigRequired = isNestedDelegator && parentThreshold !== undefined && parentThreshold > 1

  const onConfirm = async () => {
    setError(undefined)

    if (!wallet?.provider || !safeAddress || !chain) {
      setError(new Error(translateMessage('ui.pleaseConnectYourWalletFirst_7c9cf431')))
      return
    }

    setIsLoading(true)

    try {
      const useV1Endpoint = usesV1DelegateEndpoint(chain, wallet)
      const signer = await getAssertedChainSigner(wallet.provider)

      if (parentSafeAddress && isMultiSigRequired) {
        // Multi-sig flow: create off-chain message on parent Safe for signature collection
        const eoaSignature = await signProposerTypedDataForSafe(
          chain,
          proposer.delegate,
          parentSafeAddress,
          safeAddress,
          'delete',
          signer,
        )
        const delegateTypedData = getDelegateTypedData(chain, proposer.delegate, safeAddress, 'delete')
        const origin = buildDelegationOrigin('remove', proposer.delegate, safeAddress)

        await createDelegationMessage(dispatch, chainId, parentSafeAddress, delegateTypedData, eoaSignature, origin)

        setMultiSigInitiated(true)
        trackEvent(SETTINGS_EVENTS.PROPOSERS.SUBMIT_REMOVE_PROPOSER)
        setIsLoading(false)
        return
      }

      let signature: string

      if (parentSafeAddress) {
        // Single-sig nested Safe owner
        const eoaSignature = await signProposerTypedDataForSafe(
          chain,
          proposer.delegate,
          parentSafeAddress,
          safeAddress,
          'delete',
          signer,
        )
        signature = await encodeEIP1271Signature(parentSafeAddress, eoaSignature)

        await deleteDelegate({
          chain,
          delegateAddress: proposer.delegate,
          deleteDelegateDto: {
            delegator: parentSafeAddress,
            safe: safeAddress,
            signature,
          },
        })
      } else {
        signature = await signProposerDelegation({
          chain,
          wallet,
          proposerAddress: proposer.delegate,
          safeAddress,
          action: 'delete',
          signer,
        })

        if (useV1Endpoint) {
          await deleteDelegateV1({
            chainId,
            delegateAddress: proposer.delegate,
            deleteDelegateDto: {
              delegate: proposer.delegate,
              delegator: proposer.delegator,
              signature,
            },
          }).unwrap()
        } else {
          await deleteDelegate({
            chain,
            delegateAddress: proposer.delegate,
            deleteDelegateDto: {
              delegator: proposer.delegator,
              safe: safeAddress,
              signature,
            },
          })
        }
      }

      trackEvent(SETTINGS_EVENTS.PROPOSERS.SUBMIT_REMOVE_PROPOSER)

      dispatch(
        showNotification({
          variant: 'success',
          groupKey: 'delete-proposer-success',
          title: translateMessage('ui.proposerDeletedSuccessfully_61971f47'),
          message: translateMessage('ui.cannotSuggestTransactionsAnymore_92411942', {
            p0: shortenAddress(proposer.delegate),
          }),
        }),
      )
      setOpen(false)
    } catch (err) {
      setError(asError(err))
      return
    } finally {
      setIsLoading(false)
    }
  }

  const onCancel = () => {
    trackEvent(SETTINGS_EVENTS.PROPOSERS.CANCEL_REMOVE_PROPOSER)
    setOpen(false)
    setIsLoading(false)
    setError(undefined)
    setMultiSigInitiated(false)
  }

  const canDelete =
    sameAddress(wallet?.address, proposer.delegate) ||
    sameAddress(wallet?.address, proposer.delegator) ||
    (nestedSafeOwners?.some((addr) => sameAddress(addr, proposer.delegator)) ?? false)

  return (
    <>
      <CheckWallet>
        {(isOk) => {
          const tooltipTitle =
            isOk && canDelete
              ? translateMessage('ui.deleteProposer_38c3d85d')
              : isOk && !canDelete
                ? translateMessage('ui.onlyTheOwnerOfThisProposer_5f44b53f')
                : ''

          const button = (
            <span tabIndex={0}>
              <Button
                variant="ghost"
                size="icon-sm"
                data-testid="delete-proposer-btn"
                onClick={() => setOpen(true)}
                disabled={!isOk || !canDelete}
              >
                <DeleteIcon className="size-4 text-destructive" />
              </Button>
            </span>
          )

          return (
            <Track {...SETTINGS_EVENTS.PROPOSERS.REMOVE_PROPOSER}>
              {tooltipTitle ? (
                <Tooltip>
                  <TooltipTrigger render={button} />
                  <TooltipContent>{tooltipTitle}</TooltipContent>
                </Tooltip>
              ) : (
                button
              )}
            </Track>
          )
        }}
      </CheckWallet>

      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
        <DialogContent padding="none" showCloseButton={false}>
          <DialogHeader className="flex-row items-center justify-between">
            <DialogTitle>
              {multiSigInitiated
                ? translateMessage('ui.signatureCollectionInitiated_470f1242')
                : translateMessage('ui.deleteThisProposer_e730958b')}
            </DialogTitle>

            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={translateMessage('ui.close_aaaeeafe')}
              onClick={onCancel}
            >
              <XIcon />
            </Button>
          </DialogHeader>

          <Separator />

          <div className="p-4">
            {multiSigInitiated ? (
              <>
                <Alert variant="info" className="mb-4">
                  <AlertSeverityIcon variant="info" />
                  <AlertDescription>
                    {translateMessage('ui.of_f7914142')}
                    {parentThreshold} {translateMessage('ui.signaturesCollected_f16e16fc')}
                  </AlertDescription>
                </Alert>

                <Typography variant="paragraph-small" className="mb-4 block">
                  {translateMessage('ui.theRemovalRequestHasBeenCreated_5774eddc')}
                </Typography>

                <Typography variant="paragraph-small" color="muted">
                  {translateMessage('ui.theOtherParentOwnersCanFind_9c6237ad')}
                </Typography>
              </>
            ) : (
              <>
                {isMultiSigRequired && (
                  <Alert variant="info" className="mb-4">
                    <AlertSeverityIcon variant="info" />
                    <AlertDescription>
                      {translateMessage('ui.thisRequires_2744d66b')}
                      {parentThreshold} / {parentOwners?.length ?? '?'}{' '}
                      {translateMessage('ui.parentOwnerSignaturesToComplete_450bc591')}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mb-4">
                  <Typography>
                    {translateMessage('ui.deletingThisProposerWillPermanentlyRemove_f91b714c')}
                    <br />
                    <br />
                    {translateMessage('ui.toCompleteThisActionConfirmIt_8264229d')}
                  </Typography>
                </div>

                {error && (
                  <div className="mt-4">
                    <ErrorMessage error={error}>
                      {getProposerErrorText(error, translateMessage('ui.errorDeletingProposer_6294c60d'))}
                    </ErrorMessage>
                  </div>
                )}

                <NetworkWarning action="sign" />
              </>
            )}
          </div>

          <Separator />

          {/* eslint-disable-next-line no-restricted-syntax -- p-6: bespoke footer padding around DialogActions (item A), no token */}
          <DialogFooter className="p-6">
            {multiSigInitiated ? (
              <DialogActions confirmLabel={translateMessage('ui.done_23c91b78')} onConfirm={onCancel} />
            ) : (
              <DialogActions
                onCancel={onCancel}
                cancelLabel={translateMessage('ui.noKeepIt_39df34cb')}
                cancelTestId="reject-delete-proposer-btn"
                confirmLabel={translateMessage('ui.yesDelete_185fdfd2')}
                confirmTestId="confirm-delete-proposer-btn"
                confirmDestructive
                confirmLoading={isLoading}
                confirmDisabled={isParentLoading || !canDelete}
                confirmCheckWallet={{ checkNetwork: !isLoading }}
                onConfirm={onConfirm}
              />
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

const DeleteProposerDialog = madProps(InternalDeleteProposer, {
  wallet: useWallet,
  chainId: useChainId,
  chain: useCurrentChain,
  safeAddress: useSafeAddress,
})

export default DeleteProposerDialog
