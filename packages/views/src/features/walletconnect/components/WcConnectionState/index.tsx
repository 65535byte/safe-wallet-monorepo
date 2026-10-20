import { translateMessage } from '@safe-global/views/i18n'
import classNames from 'classnames'
import type { CoreTypes } from '@walletconnect/types'
import { Typography } from '@safe-global/views/components/ui/typography'
import SafeAppIconCard from '@safe-global/views/components/safe-apps/SafeAppIconCard'
import ConnectionDots from '@safe-global/views/assets/images/common/connection-dots.svg'
import css from './styles.module.css'

const WcConnectionState = ({ metadata, isDelete }: { metadata?: CoreTypes.Metadata; isDelete: boolean }) => {
  const name = metadata?.name || 'dApp'
  const icon = metadata?.icons[0] || ''

  return (
    <div data-testid="wc-connection-state" className={css.container}>
      <div>
        <img
          src="/images/brand-logo.png"
          alt={translateMessage('ui.safeLogo_9a51e835')}
          className="size-7 rounded-sm object-contain"
        />

        <ConnectionDots
          data-testid="connection-dots"
          className={classNames('mx-4 size-6', css.dots, { [css.errorDots]: isDelete })}
        />

        <SafeAppIconCard src={icon} width={28} height={28} alt={translateMessage('ui.logo_efd72bef', { p0: name })} />
      </div>

      <Typography variant="h4" className="mt-6">
        {isDelete
          ? translateMessage('ui.disconnected_24f76641', { p0: name })
          : translateMessage('ui.successfullyConnected_13872ba0', { p0: name })}
      </Typography>
    </div>
  )
}

export default WcConnectionState
