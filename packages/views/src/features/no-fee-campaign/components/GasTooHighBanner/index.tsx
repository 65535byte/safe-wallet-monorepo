import { translateMessage } from '@safe-global/views/i18n'
import { InfoIcon } from 'lucide-react'
import { Typography } from '@safe-global/views/components/ui/typography'
import css from './styles.module.css'

const GasTooHighBanner = () => {
  return (
    <div className={css.banner}>
      <div className={css.iconContainer}>
        <InfoIcon className={css.icon} />
      </div>
      <div className={css.messageContainer}>
        <Typography variant="paragraph-small" className={css.message}>
          {translateMessage('ui.gasPricesAreTooHighRight_a76180e1')}
        </Typography>
      </div>
    </div>
  )
}

export default GasTooHighBanner
