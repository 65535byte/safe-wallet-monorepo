import { translateMessage } from '@/i18n'
import { LabelValue } from '@safe-global/store/gateway/types'
import type { LabelQueuedItem } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import type { ReactElement } from 'react'
import css from './styles.module.css'
import useSafeInfo from '@/hooks/useSafeInfo'

const GroupLabel = ({ item }: { item: LabelQueuedItem }): ReactElement => {
  const { safe } = useSafeInfo()

  const label =
    item.label === LabelValue.Queued
      ? translateMessage('ui.transactionWithNonceNeedsToBe_b5a698b1', { p0: item.label, p1: safe.nonce })
      : item.label

  return <div className={css.container}>{label}</div>
}

export default GroupLabel
