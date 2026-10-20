import { translateMessage } from '@safe-global/views/i18n'
import { Typography } from '@safe-global/views/components/ui/typography'
import EditIcon from '@safe-global/views/assets/images/common/edit.svg'
import css from './styles.module.css'
import TxSectionTitle from '@safe-global/views/components/tx-flow/common/TxSectionTitle'

export enum ConfirmationTitleTypes {
  sign = 'confirm',
  execute = 'execute',
}

const ConfirmationTitle = ({ isCreation, variant }: { isCreation?: boolean; variant: ConfirmationTitleTypes }) => {
  return (
    <div className={css.wrapper}>
      <div className={`${css.icon} ${variant === ConfirmationTitleTypes.sign ? css.sign : css.execute}`}>
        <EditIcon className="size-4" />
      </div>
      <div>
        <TxSectionTitle className="capitalize">{variant}</TxSectionTitle>
        <Typography variant="paragraph-small">
          {translateMessage('ui.youReAboutTo_981438f7')}
          {isCreation ? translateMessage('ui.createAnd_24b12072') : ''}
          {variant} {translateMessage('ui.thisTransaction_4a5df69e')}
        </Typography>
      </div>
    </div>
  )
}

export default ConfirmationTitle
