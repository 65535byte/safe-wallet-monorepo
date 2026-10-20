import { translateMessage } from '@/i18n'
import type { AnyTransactionItem } from '@/utils/tx-list'
import type { ReactElement } from 'react'
import { useContext } from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import css from './styles.module.css'
import { ReplaceTxHoverContext, ReplaceTxHoverProvider } from './ReplaceTxHoverProvider'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'

import { HelpCenterArticle } from '@safe-global/utils/config/constants'

const Disclaimer = () => (
  <Typography>
    <b>{translateMessage('ui.conflictingTransactions_2cd251fb')}</b>
    {translateMessage('ui.executingOneWillAutomaticallyReplaceThe_03dbf0b8')}{' '}
    <ExternalLink
      href={HelpCenterArticle.CONFLICTING_TRANSACTIONS}
      title={translateMessage('ui.whyAreTransactionsWithTheSame_cbc551a8')}
      noIcon
      className="hover:text-muted-foreground"
    >
      {translateMessage('ui.whyDidThisHappen_1fede37b')}
    </ExternalLink>
  </Typography>
)

const TxGroup = ({ groupedListItems }: { groupedListItems: AnyTransactionItem[] }): ReactElement => {
  const nonce = isMultisigExecutionInfo(groupedListItems[0].transaction.executionInfo)
    ? groupedListItems[0].transaction.executionInfo.nonce
    : undefined

  const { replacedTxIds } = useContext(ReplaceTxHoverContext)

  return (
    <div className={css.container}>
      <Typography style={{ gridArea: 'nonce' }}>{nonce}</Typography>
      <div className={css.disclaimerContainer} style={{ gridArea: 'warning' }}>
        <Disclaimer />
      </div>
      <div className={css.line} style={{ gridArea: 'line' }} />
      <div className={css.txItems} style={{ gridArea: 'items' }}>
        {groupedListItems.map((tx) => (
          <div
            key={tx.transaction.id}
            className={replacedTxIds.includes(tx.transaction.id) ? css.willBeReplaced : undefined}
          >
            <ExpandableTransactionItem item={tx} isConflictGroup />
          </div>
        ))}
      </div>
    </div>
  )
}

const GroupedTxListItems = ({ groupedListItems }: { groupedListItems: AnyTransactionItem[] }): ReactElement | null => {
  if (groupedListItems.length === 0) return null

  return (
    <ReplaceTxHoverProvider groupedListItems={groupedListItems}>
      <TxGroup groupedListItems={groupedListItems} />
    </ReplaceTxHoverProvider>
  )
}

export default GroupedTxListItems
