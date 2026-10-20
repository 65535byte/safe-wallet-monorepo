import { translateMessage } from '@safe-global/views/i18n'
import type { ReactElement } from 'react'
import { Alert } from '@safe-global/views/components/ui/alert'

import InfoOutlinedIcon from '@safe-global/views/assets/images/notifications/info.svg'
import css from './styles.module.css'

export const ImitationTransactionWarning = (): ReactElement => {
  return (
    <Alert
      className={css.alert}
      style={{
        borderLeft: '3px solid var(--color-error-main)',
        backgroundColor: 'var(--color-error-background)',
        color: 'var(--color-error-dark)',
      }}
    >
      <InfoOutlinedIcon className="size-4 text-[var(--color-error-main)]" />
      <span>
        <b>{translateMessage('ui.thisMayBeAMaliciousTransaction_be9bae94')}</b>{' '}
        {translateMessage('ui.checkAndConfirmTheAddressBefore_52a33836')}{' '}
      </span>
    </Alert>
  )
}
