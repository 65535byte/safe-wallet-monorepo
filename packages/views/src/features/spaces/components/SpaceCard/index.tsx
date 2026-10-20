import { translateMessage } from '@safe-global/views/i18n'
import { Typography } from '@safe-global/views/components/ui/typography'

import css from './styles.module.css'
import classNames from 'classnames'

export const SpaceSummary = ({
  name,
  numberOfAccounts,
  numberOfMembers,
  isCompact = false,
}: {
  name: string
  numberOfAccounts: number
  numberOfMembers: number
  isCompact?: boolean
}) => {
  return (
    <div>
      <Typography variant="paragraph-bold" data-testid="org-name">
        {name}
      </Typography>

      <div className={classNames('flex flex-row items-center gap-2', isCompact ? 'mt-0' : 'mt-0.5')}>
        <Typography variant="paragraph-mini" color="muted">
          {numberOfAccounts} {translateMessage('ui.account_9eaf55d5')}
        </Typography>

        <div className={css.dot} />

        <Typography variant="paragraph-mini" color="muted">
          {numberOfMembers} {translateMessage('ui.member_f50da31c')}
        </Typography>
      </div>
    </div>
  )
}
