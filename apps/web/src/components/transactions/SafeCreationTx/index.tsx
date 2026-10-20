import { translateMessage } from '@/i18n'
import type { Transaction } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import React from 'react'
import css from './styles.module.css'
import { InfoDetails } from '@safe-global/views/components/transactions/InfoDetails'
import EthHashInfo from '@/components/common/EthHashInfo'
import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { dateString } from '@safe-global/utils/utils/formatters'
import { isCreationTxInfo } from '@/utils/transaction-guards'
import { NOT_AVAILABLE } from '@/components/transactions/TxDetails'
import NamedAddressInfo from '@/components/common/NamedAddressInfo'

type SafeCreationTxProps = {
  txSummary: Transaction
}

const SafeCreationTx = ({ txSummary }: SafeCreationTxProps) => {
  if (!isCreationTxInfo(txSummary.txInfo)) return null

  const timestamp = txSummary.timestamp
  const { creator, factory, implementation, transactionHash } = txSummary.txInfo

  return (
    <>
      <div className={css.txCreation}>
        <InfoDetails title={translateMessage('ui.creator_9558a531')}>
          <NamedAddressInfo
            address={creator.value}
            name={creator.name}
            shortAddress={false}
            showCopyButton
            hasExplorer
          />
        </InfoDetails>
        <InfoDetails title={translateMessage('ui.factory_926b77da')}>
          {factory ? (
            <EthHashInfo name={factory.name} address={factory.value} shortAddress={false} showCopyButton hasExplorer />
          ) : (
            NOT_AVAILABLE
          )}
        </InfoDetails>
        <InfoDetails title={translateMessage('ui.mastercopy_fae20eb3')}>
          {implementation ? (
            <EthHashInfo
              name={implementation.name}
              address={implementation.value}
              shortAddress={false}
              showCopyButton
              hasExplorer
            />
          ) : (
            NOT_AVAILABLE
          )}
        </InfoDetails>
      </div>
      <div className={css.txSummary}>
        <TxDataRow title={translateMessage('ui.transactionHash_f45d5f9f')}>
          {generateDataRowValue(transactionHash, 'hash', true)}
        </TxDataRow>
        <TxDataRow title={translateMessage('ui.created_767bfe83')}>
          {timestamp ? dateString(timestamp) : null}
        </TxDataRow>
      </div>
    </>
  )
}

export default SafeCreationTx
