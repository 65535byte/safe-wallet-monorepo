import { translateMessage } from '@safe-global/views/i18n'
import type { TwapOrderTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { DataRow } from '@safe-global/views/components/common/Table/DataRow'
import { getPeriod } from '@safe-global/views/utils/formatPeriod'

export const PartDuration = ({ order }: { order: Pick<TwapOrderTransactionInfo, 'timeBetweenParts'> }) => {
  const { timeBetweenParts } = order
  return (
    <DataRow title={translateMessage('ui.partDuration_fc3be479')} key="part_duration">
      {getPeriod(+timeBetweenParts)}
    </DataRow>
  )
}
