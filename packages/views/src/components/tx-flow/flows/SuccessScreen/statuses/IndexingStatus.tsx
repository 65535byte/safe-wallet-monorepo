import { translateMessage } from '@safe-global/views/i18n'
import classNames from 'classnames'
import css from '@safe-global/views/components/tx-flow/flows/SuccessScreen/styles.module.css'
import { Typography } from '@safe-global/views/components/ui/typography'

export const IndexingStatus = ({ willDeploySafe: isCreatingSafe }: { willDeploySafe: boolean }) => (
  <div className="mt-6 px-6">
    <Typography data-testid="transaction-status" variant="h4" className="mt-4">
      {!isCreatingSafe ? 'Transaction' : translateMessage('ui.nested_945d8f67')}{' '}
      {translateMessage('ui.wasProcessed_e451448e')}
    </Typography>
    <div className={classNames(css.instructions, css.infoBg)}>
      <Typography variant="paragraph-small"> {translateMessage('ui.itIsNowBeingIndexed_e8d4687f')}</Typography>
    </div>
  </div>
)
