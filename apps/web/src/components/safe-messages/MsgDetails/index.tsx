import { translateMessage } from '@/i18n'
import type { MessageItem } from '@safe-global/store/gateway/AUTO_GENERATED/messages'
import { useMemo, type ReactElement } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@safe-global/views/components/ui/accordion'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Code as CodeIcon } from 'lucide-react'
import classNames from 'classnames'
import ObservabilityErrorBoundary from '@/components/common/ObservabilityErrorBoundary'

import { formatDateTime } from '@safe-global/utils/utils/date'
import EthHashInfo from '@/components/common/EthHashInfo'
import { InfoDetails } from '@safe-global/views/components/transactions/InfoDetails'
import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import MsgAuditLog from '@/components/safe-messages/MsgAuditLog'
import useWallet from '@/hooks/wallets/useWallet'
import SignMsgButton from '@/components/safe-messages/SignMsgButton'
import { generateSafeMessageMessage, isEIP712TypedData } from '@safe-global/utils/utils/safe-messages'

import txDetailsCss from '@/components/transactions/TxDetails/styles.module.css'
import singleTxDecodedCss from '@/components/transactions/TxDetails/TxData/DecodedData/SingleTxDecoded/styles.module.css'
import infoDetailsCss from '@safe-global/views/components/transactions/InfoDetails/styles.module.css'
import { DecodedMsg } from '../DecodedMsg'
import CopyButton from '@/components/common/CopyButton'
import NamedAddressInfo from '@/components/common/NamedAddressInfo'
import MsgShareLink from '../MsgShareLink'

const MsgDetails = ({ msg }: { msg: MessageItem }): ReactElement => {
  const wallet = useWallet()
  const isConfirmed = msg.status === 'CONFIRMED'
  const safeMessage = useMemo(() => {
    try {
      return generateSafeMessageMessage(msg.message)
    } catch (e) {
      return ''
    }
  }, [msg.message])
  const verifyingContract = isEIP712TypedData(msg.message) ? msg.message.domain.verifyingContract : undefined

  return (
    <div className={txDetailsCss.container}>
      <div className={txDetailsCss.details}>
        <div className={txDetailsCss.shareLink}>
          <MsgShareLink safeMessageHash={msg.messageHash} />
        </div>
        {msg.proposedBy && (
          <div className={txDetailsCss.txData}>
            <InfoDetails title={translateMessage('ui.createdBy_e03315ec')}>
              <EthHashInfo
                address={msg.proposedBy.value}
                name={msg.proposedBy.name}
                customAvatar={msg.proposedBy.logoUri || undefined}
                shortAddress={false}
                showCopyButton
                hasExplorer
              />
            </InfoDetails>
          </div>
        )}

        {verifyingContract && (
          <div className={txDetailsCss.txData}>
            <InfoDetails title={translateMessage('ui.verifyingContract_0b525af6')}>
              <NamedAddressInfo address={verifyingContract} shortAddress={false} showCopyButton hasExplorer />
            </InfoDetails>
          </div>
        )}

        <div className={txDetailsCss.txData}>
          <InfoDetails
            title={
              <>
                {translateMessage('ui.message_a553da04')}
                <CopyButton text={JSON.stringify(msg.message, null, 2)} />
              </>
            }
          >
            <ObservabilityErrorBoundary fallback={<div>{translateMessage('ui.errorDecodingMessage_b649e32c')}</div>}>
              <DecodedMsg message={msg.message} />
            </ObservabilityErrorBoundary>
          </InfoDetails>
        </div>

        <div className={txDetailsCss.txSummary}>
          <TxDataRow title={translateMessage('ui.created_d8278ec8')}>{formatDateTime(msg.creationTimestamp)}</TxDataRow>
          <TxDataRow title={translateMessage('ui.lastModified_85c7b6eb')}>
            {formatDateTime(msg.modifiedTimestamp)}
          </TxDataRow>
          <TxDataRow title={translateMessage('ui.messageHash_b8ce78e4')}>
            {generateDataRowValue(msg.messageHash, 'hash')}
          </TxDataRow>
          {safeMessage && <TxDataRow title="SafeMessage">{generateDataRowValue(safeMessage, 'hash')}</TxDataRow>}
        </div>

        {msg.preparedSignature && (
          <div className={classNames(txDetailsCss.txSummary, txDetailsCss.multiSend)}>
            <TxDataRow title={translateMessage('ui.preparedSignature_c32009f4')}>
              {generateDataRowValue(msg.preparedSignature, 'hash')}
            </TxDataRow>
          </div>
        )}

        <div className={classNames(txDetailsCss.multiSend, 'border-t border-border')}>
          <Accordion
            multiple
            defaultValue={msg.confirmations
              .filter((confirmation) => confirmation.owner.value === wallet?.address)
              .map((confirmation) => confirmation.signature)}
          >
            {msg.confirmations.map((confirmation, i) => (
              <AccordionItem value={confirmation.signature} key={confirmation.signature}>
                <AccordionTrigger
                  className={classNames('flex min-h-12 items-center px-4 py-3', singleTxDecodedCss.elevationTrigger)}
                >
                  <div className={singleTxDecodedCss.summary}>
                    <CodeIcon className="size-4 shrink-0 text-muted-foreground" />
                    <Typography className={singleTxDecodedCss.summaryLabel}>
                      <b>{translateMessage('ui.confirmation_2d8b1e66', { p0: i + 1 })}</b>
                    </Typography>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="p-4">
                  <div className={infoDetailsCss.container}>
                    <EthHashInfo
                      address={confirmation.owner.value || ''}
                      name={confirmation.owner.name}
                      customAvatar={confirmation.owner.logoUri || undefined}
                      shortAddress={false}
                      showCopyButton
                      hasExplorer
                    />
                  </div>
                  <TxDataRow title={translateMessage('ui.signature_c60d1296')}>
                    <EthHashInfo address={confirmation.signature} showAvatar={false} showCopyButton />
                  </TxDataRow>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
      <div className={txDetailsCss.txSigners}>
        <MsgAuditLog msg={msg} />
        {wallet && !isConfirmed && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <SignMsgButton msg={msg} />
          </div>
        )}
      </div>
    </div>
  )
}

export default MsgDetails
