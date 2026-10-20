import { translateMessage } from '@/i18n'
import type { MessageItem } from '@safe-global/store/gateway/AUTO_GENERATED/messages'
import { Button } from '@safe-global/views/components/ui/button'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Link } from '@safe-global/views/components/ui/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@safe-global/views/components/ui/accordion'
import { useContext, useEffect } from 'react'
import type { ReactElement } from 'react'
import type { RequestId } from '@safe-global/safe-apps-sdk'
import EthHashInfo from '@/components/common/EthHashInfo'
import RequiredIcon from '@/public/images/messages/required.svg'
import useSafeInfo from '@/hooks/useSafeInfo'

import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useWallet from '@/hooks/wallets/useWallet'
import useSafeMessage from '@/hooks/messages/useSafeMessage'
import useOnboard, { switchWallet } from '@/hooks/wallets/useOnboard'
import { TxModalContext } from '@/components/tx-flow'
import CopyButton from '@/components/common/CopyButton'
import MsgSigners from '@/components/safe-messages/MsgSigners'
import useDecodedSafeMessage from '@/hooks/messages/useDecodedSafeMessage'
import useSyncSafeMessageSigner from '@/hooks/messages/useSyncSafeMessageSigner'
import SuccessMessage from '@safe-global/views/components/tx/SuccessMessage'
import useHighlightHiddenTab from '@/hooks/useHighlightHiddenTab'
import InfoBox from '@safe-global/views/components/safe-messages/InfoBox'
import { DecodedMsg } from '@/components/safe-messages/DecodedMsg'
import TxCard, { TxCardActions } from '@safe-global/views/components/tx-flow/common/TxCard'
import { dispatchPreparedSignature } from '@/services/safe-messages/safeMsgNotifications'
import { trackEvent } from '@/services/analytics'
import { TX_EVENTS, TX_TYPES } from '@/services/analytics/events/transactions'
import { SafeTxContext } from '../../SafeTxProvider'
import RiskConfirmationError from '@/components/tx/shared/errors/RiskConfirmationError'
import { isBlindSigningPayload, isEIP712TypedData } from '@safe-global/utils/utils/safe-messages'
import ApprovalEditor from '@/components/tx/ApprovalEditor'
import ObservabilityErrorBoundary from '@/components/common/ObservabilityErrorBoundary'
import { isWalletRejection } from '@/utils/wallets'
import { getCgwErrorInfo } from '@/utils/cgw-errors'
import { getLedgerDeviceError, getLedgerUserMessage } from '@/services/onboard/ledger-errors'
import { useAppSelector } from '@/store'
import { selectBlindSigning } from '@/store/settingsSlice'
import NextLink from 'next/link'
import { AppRoutes } from '@/config/routes'
import MsgShareLink from '@/components/safe-messages/MsgShareLink'
import LinkIcon from '@/public/images/messages/link.svg'
import CheckWallet from '@/components/common/CheckWallet'
import NetworkWarning from '@/components/new-safe/create/NetworkWarning'
import { getDomainHash, getSafeMessageMessageHash } from '@safe-global/utils/utils/safe-hashes'
import type { SafeVersion } from '@safe-global/types-kit'
import { useSafeShield } from '@/features/safe-shield/SafeShieldContext'
import { RiskConfirmation } from '../../features/RiskConfirmation'
import { useSafeLinkQuery } from '@/hooks/useSafeLinkQuery'

const createSkeletonMessage = (confirmationsRequired: number): MessageItem => {
  return {
    confirmations: [],
    confirmationsRequired,
    confirmationsSubmitted: 0,
    creationTimestamp: 0,
    message: '',
    logoUri: null,
    messageHash: '',
    modifiedTimestamp: 0,
    name: null,
    proposedBy: {
      value: '',
    },
    preparedSignature: null,
    origin: null,
    safeAppInfo: null,
    safeAppId: null,
    status: 'NEEDS_CONFIRMATION',
    type: 'MESSAGE',
  }
}

const MessageHashField = ({ label, hashValue }: { label: string; hashValue: string }) => (
  <>
    <Typography variant="paragraph-small" className="mt-4 block font-bold">
      {label}:
    </Typography>
    <div data-testid="message-hash" className="text-sm">
      <EthHashInfo address={hashValue} showAvatar={false} shortAddress={false} showCopyButton />
    </div>
  </>
)

const DialogHeader = ({ threshold }: { threshold: number }) => (
  <>
    <div className="mb-4 text-center">
      <RequiredIcon className="inline-block size-9" />
    </div>
    <Typography variant="h4" align="center" className="mb-2">
      {translateMessage('ui.confirmMessage_88910180')}
    </Typography>
    {threshold > 1 && (
      <Typography align="center" className="mb-4">
        {translateMessage('ui.toSignThisMessageCollectSignatures_e26197e6')}
        <b>
          {threshold} {translateMessage('ui.signers_10e182d9')}
        </b>{' '}
        {translateMessage('ui.ofYourAccount_90eb75c9')}
      </Typography>
    )}
  </>
)

// The single place a message-signing failure is rendered: the toast for the
// same failure was dropped so it is shown once, next to the CTA (WA-3502).
const MessageDialogError = ({ isOwner, submitError }: { isOwner: boolean; submitError: Error | undefined }) => {
  const wallet = useWallet()
  const onboard = useOnboard()

  if (!wallet || !onboard) {
    return <ErrorMessage>{translateMessage('ui.noWalletIsConnected_07cdf9f7')}</ErrorMessage>
  }

  if (!isOwner) {
    return <ErrorMessage>{translateMessage('ui.youAreCurrentlyNotASigner_364be4d5')}</ErrorMessage>
  }

  if (!submitError) {
    return null
  }

  if (isWalletRejection(submitError)) {
    return <ErrorMessage>{translateMessage('ui.userRejectedSigning_d1a98a28')}</ErrorMessage>
  }

  // A Ledger device failure states its own reason; its raw error is a dump of
  // DMK class names, ethers codes and the viem version (WA-3243).
  const ledgerError = getLedgerDeviceError(submitError)
  if (ledgerError) {
    return <ErrorMessage error={submitError}>{getLedgerUserMessage(ledgerError)}</ErrorMessage>
  }

  // A known CGW response state replaces the copy and gets a code-only support
  // reference — never the response body, which can be an HTML page (WA-3252).
  const cgwError = getCgwErrorInfo(submitError)

  return (
    <ErrorMessage error={submitError}>
      {cgwError ? cgwError.message : translateMessage('ui.errorConfirmingTheMessageTryAgain_2b93a8fd')}
    </ErrorMessage>
  )
}

const AlreadySignedByOwnerMessage = ({ hasSigned }: { hasSigned: boolean }) => {
  const onboard = useOnboard()

  const handleSwitchWallet = () => {
    if (onboard) {
      switchWallet(onboard)
    }
  }
  if (!hasSigned) {
    return null
  }
  return (
    <SuccessMessage>
      <div className="flex flex-row justify-between gap-4">
        <div className="basis-7/12">{translateMessage('ui.yourConnectedWalletHasAlreadySigned_a3694c0e')}</div>
        <div className="basis-4/12">
          <Button size="sm" onClick={handleSwitchWallet} className="w-full">
            {translateMessage('ui.switchWallet_b2cf4f66')}
          </Button>
        </div>
      </div>
    </SuccessMessage>
  )
}

const BlindSigningWarning = ({
  isBlindSigningEnabled,
  isBlindSigningPayload,
}: {
  isBlindSigningEnabled: boolean
  isBlindSigningPayload: boolean
}) => {
  const safeLinkQuery = useSafeLinkQuery()
  const query = safeLinkQuery.safe ? safeLinkQuery : undefined

  if (!isBlindSigningPayload) {
    return null
  }

  return (
    <ErrorMessage level={isBlindSigningEnabled ? 'warning' : 'error'}>
      {translateMessage('ui.thisRequestInvolves_00ed553a')}
      <Link render={<NextLink href={{ pathname: AppRoutes.settings.security, query }} />}>
        {translateMessage('ui.blindSigning_60af8648')}
      </Link>
      {translateMessage('ui.whichCanLeadToUnpredictableOutcomes_f3a7fa3a')}
      <br />
      {isBlindSigningEnabled ? (
        translateMessage('ui.proceedWithCaution_639fd7d0')
      ) : (
        <>
          {translateMessage('ui.ifYouWishToProceedYou_4a2ac4f5')}{' '}
          <Link render={<NextLink href={{ pathname: AppRoutes.settings.security, query }} />}>
            {translateMessage('ui.enableBlindSigning_70321bea')}
          </Link>
          .
        </>
      )}
    </ErrorMessage>
  )
}

const SuccessCard = ({ safeMessage, onContinue }: { safeMessage: MessageItem; onContinue: () => void }) => {
  return (
    <TxCard>
      <Typography variant="h4" align="center" className="mb-2">
        {translateMessage('ui.messageSuccessfullySigned_30df7551')}
      </Typography>
      <MsgSigners msg={safeMessage} showOnlyConfirmations showMissingSignatures />
      <TxCardActions>
        <Button onClick={onContinue} disabled={!safeMessage.preparedSignature}>
          {translateMessage('ui.continue_a4bd8255')}
        </Button>
      </TxCardActions>
    </TxCard>
  )
}

type BaseProps = Pick<MessageItem, 'logoUri' | 'name' | 'message'>

export type SignMessageProps = BaseProps & {
  origin?: string
  requestId?: RequestId
}

const SignMessage = ({ message, origin, requestId }: SignMessageProps): ReactElement => {
  // Hooks & variables
  const { setTxFlow } = useContext(TxModalContext)
  const { setSafeMessage: setContextSafeMessage, setSafeMessageHash: setContextSafeMessageHash } =
    useContext(SafeTxContext)
  const { needsRiskConfirmation, isRiskConfirmed } = useSafeShield()
  const { safe } = useSafeInfo()
  const isOwner = useIsSafeOwner()
  const wallet = useWallet()
  useHighlightHiddenTab()

  const { decodedMessage, safeMessageMessage, safeMessageHash } = useDecodedSafeMessage(message, safe)

  const [safeMessage, setSafeMessage] = useSafeMessage(safeMessageHash)
  const domainHash = getDomainHash({
    chainId: safe.chainId,
    safeAddress: safe.address.value,
    safeVersion: safe.version as SafeVersion,
  })
  const messageHash = getSafeMessageMessageHash({ message: decodedMessage, safeVersion: safe.version as SafeVersion })
  const isPlainTextMessage = typeof decodedMessage === 'string'
  const decodedMessageAsString = isPlainTextMessage ? decodedMessage : JSON.stringify(decodedMessage, null, 2)
  const signedByCurrentSafe = !!safeMessage?.confirmations.some(({ owner }) => owner.value === wallet?.address)
  const hasSignature = safeMessage?.confirmations && safeMessage.confirmations.length > 0
  const isFullySigned = !!safeMessage?.preparedSignature
  const isEip712 = isEIP712TypedData(decodedMessage)
  const isBlindSigningRequest = isBlindSigningPayload(decodedMessage)
  const isBlindSigningEnabled = useAppSelector(selectBlindSigning)
  const isDisabled =
    !isOwner ||
    signedByCurrentSafe ||
    !safe.deployed ||
    (!isBlindSigningEnabled && isBlindSigningRequest) ||
    (needsRiskConfirmation && !isRiskConfirmed)

  const { onSign, submitError } = useSyncSafeMessageSigner(
    safeMessage,
    decodedMessage,
    safeMessageHash,
    requestId,
    origin,
    () => setTxFlow(undefined),
  )

  const handleSign = async () => {
    const updatedMessage = await onSign()

    if (updatedMessage) {
      setSafeMessage(updatedMessage)
    }

    // Track first signature as creation
    const isCreation = updatedMessage?.confirmations.length === 1
    trackEvent({ ...(isCreation ? TX_EVENTS.CREATE : TX_EVENTS.CONFIRM), label: TX_TYPES.typed_message })
  }

  const onContinue = async () => {
    if (!safeMessage) {
      return
    }
    await dispatchPreparedSignature(safeMessage, safeMessageHash, () => setTxFlow(undefined), requestId)
  }

  // Set message for Safe Shield threat analysis
  useEffect(() => {
    if (isEip712) {
      setContextSafeMessage(decodedMessage)
      setContextSafeMessageHash(safeMessageHash as `0x${string}`)
    } else {
      setContextSafeMessage(undefined)
      setContextSafeMessageHash(undefined)
    }
  }, [decodedMessage, isEip712, setContextSafeMessage, setContextSafeMessageHash, safeMessageHash])

  return (
    <>
      <TxCard>
        <div className="p-4">
          <DialogHeader threshold={safe.threshold} />

          {isEip712 && (
            <ObservabilityErrorBoundary fallback={<div>{translateMessage('ui.errorParsingData_92756433')}</div>}>
              <ApprovalEditor safeMessage={decodedMessage} />
            </ObservabilityErrorBoundary>
          )}

          <BlindSigningWarning
            isBlindSigningEnabled={isBlindSigningEnabled}
            isBlindSigningPayload={isBlindSigningRequest}
          />

          <Typography className="mt-4 mb-2 font-bold">
            {translateMessage('ui.message_3fd06741')}
            <CopyButton text={decodedMessageAsString} />
          </Typography>
          <DecodedMsg message={decodedMessage} isInModal />

          <Accordion className="mt-4">
            <AccordionItem value="message-details">
              <AccordionTrigger data-testid="message-details">
                {translateMessage('ui.safeMessageDetails_f1fdc5a7')}
              </AccordionTrigger>
              <AccordionContent>
                <MessageHashField label="SafeMessage" hashValue={safeMessageMessage} />
                <MessageHashField label={translateMessage('ui.safeMessageHash_eed47d92')} hashValue={safeMessageHash} />
                <MessageHashField label={translateMessage('ui.domainHash_3bc1e9ef')} hashValue={domainHash} />
                <MessageHashField label={translateMessage('ui.messageHash_b8ce78e4')} hashValue={messageHash} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="[&:not(:empty)]:mt-4">
            <RiskConfirmation />
          </div>
        </div>
      </TxCard>
      {isFullySigned ? (
        <SuccessCard onContinue={onContinue} safeMessage={safeMessage} />
      ) : (
        <>
          <TxCard>
            <AlreadySignedByOwnerMessage hasSigned={signedByCurrentSafe} />

            <InfoBox
              title={translateMessage('ui.collectAllTheConfirmations_3c483da1')}
              message={
                requestId && !hasSignature
                  ? translateMessage('ui.keepThisModalOpenUntilAll_779dece4')
                  : translateMessage('ui.theSignatureWillBeSubmittedTo_e2d7ec67')
              }
            >
              <MsgSigners
                msg={safeMessage ?? createSkeletonMessage(safe.threshold)}
                showOnlyConfirmations
                showMissingSignatures
                backgroundColor="var(--color-info-background)"
              />
            </InfoBox>

            {hasSignature && (
              <InfoBox
                title={translateMessage('ui.shareTheLinkWithOtherOwners_b720843f')}
                message={
                  <>
                    <Typography className="mb-4">
                      {translateMessage('ui.theOwnersWillReceiveANotification_923678c8')}
                    </Typography>
                    <MsgShareLink safeMessageHash={safeMessageHash} button />
                  </>
                }
                icon={LinkIcon}
              />
            )}

            <NetworkWarning />

            <MessageDialogError isOwner={isOwner} submitError={submitError} />

            <RiskConfirmationError />

            {!safe.deployed && (
              <ErrorMessage>{translateMessage('ui.yourAccountIsNotActivatedYet_07ab6f15')}</ErrorMessage>
            )}
          </TxCard>
          <TxCard>
            <TxCardActions>
              <CheckWallet checkNetwork={!isDisabled}>
                {(isOk) => (
                  <Button onClick={handleSign} disabled={!isOk || isDisabled}>
                    {translateMessage('ui.sign_1e67e9a4')}
                  </Button>
                )}
              </CheckWallet>
            </TxCardActions>
          </TxCard>
        </>
      )}
    </>
  )
}

export default SignMessage
