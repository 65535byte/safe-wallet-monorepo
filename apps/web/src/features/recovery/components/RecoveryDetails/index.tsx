import { translateMessage } from '@/i18n'
import { Operation } from '@safe-global/store/gateway/types'
import type { ReactElement } from 'react'

import { dateString } from '@safe-global/utils/utils/formatters'
import { generateDataRowValue, TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import ColorCodedTxAccordion from '@/components/tx/ColorCodedTxAccordion'
import RecoverySigners from '../RecoverySigners'
import RecoveryDescription from '../RecoveryDescription'
import type { RecoveryQueueItem } from '../../services/recovery-state'
import classNames from 'classnames'

import txDetailsCss from '@/components/transactions/TxDetails/styles.module.css'

export default function RecoveryDetails({ item }: { item: RecoveryQueueItem }): ReactElement {
  const { transactionHash, timestamp, validFrom, expiresAt, args, address } = item

  return (
    <div className={classNames(txDetailsCss.container, txDetailsCss.containerContrast)}>
      <div className={txDetailsCss.details}>
        <div className={txDetailsCss.txData}>
          <RecoveryDescription item={item} />
        </div>

        <div className={txDetailsCss.txSummary}>
          <TxDataRow title={translateMessage('ui.transactionHash_62979280')}>
            {generateDataRowValue(transactionHash, 'hash', true)}
          </TxDataRow>
          <TxDataRow title={translateMessage('ui.created_d8278ec8')}>
            <div className="text-sm">{dateString(Number(timestamp))}</div>
          </TxDataRow>
          <TxDataRow title={translateMessage('ui.executable_340f4d3b')}>
            <div className="text-sm">{dateString(Number(validFrom))}</div>
          </TxDataRow>

          {expiresAt !== null && (
            <TxDataRow title={translateMessage('ui.expires_b8d5dbf9')}>
              <div className="text-sm">{dateString(Number(expiresAt))}</div>
            </TxDataRow>
          )}

          <div className="mt-4">
            <ColorCodedTxAccordion>
              <div className="flex flex-col gap-2">
                <TxDataRow title={translateMessage('ui.module_46c34f61')}>
                  {generateDataRowValue(address, 'address', true)}
                </TxDataRow>
                <TxDataRow title={translateMessage('ui.value_5f04a161')}>
                  {generateDataRowValue(args.value.toString())}
                </TxDataRow>
                <TxDataRow title={translateMessage('ui.operation_f02643fa')}>
                  {generateDataRowValue(
                    `${Number(args.operation)} (${Operation[Number(args.operation)].toLowerCase()})`,
                  )}
                </TxDataRow>
                <TxDataRow title={translateMessage('ui.rawData_21e300a4')}>
                  {generateDataRowValue(args.data, 'rawData')}
                </TxDataRow>
              </div>
            </ColorCodedTxAccordion>
          </div>
        </div>
      </div>

      <div className={txDetailsCss.txSigners}>
        <RecoverySigners item={item} />
      </div>
    </div>
  )
}
