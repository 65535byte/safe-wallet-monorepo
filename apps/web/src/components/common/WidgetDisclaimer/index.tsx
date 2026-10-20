import { translateMessage } from '@/i18n'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { TERMS_URL } from '@safe-global/utils/config/constants'
import { Typography } from '@safe-global/views/components/ui/typography'

import css from './styles.module.css'

const linkClassName = 'no-underline hover:no-underline'

const WidgetDisclaimer = ({ widgetName }: { widgetName: string }) => (
  <div className={css.disclaimerContainer}>
    <div className={css.disclaimerInner}>
      <Typography className="mb-8 mt-8">{translateMessage('ui.youAreNowAccessingAThird_b2435ec6')}</Typography>

      <Typography className="mb-8">
        {translateMessage('ui.pleaseNoteThatWeDoNot_b995cadc')}
        {widgetName}
        {translateMessage('ui.useOfTheWidgetIsSubject_4e554638')}
      </Typography>

      <Typography className="mb-8">
        {translateMessage('ui.our_075d7cb2')}{' '}
        <ExternalLink href={TERMS_URL} className={linkClassName}>
          {translateMessage('ui.terms_0af7f334')}
        </ExternalLink>{' '}
        {translateMessage('ui.containMoreDetailedProvisionsBindingOn_6e91b9ac')}
      </Typography>
      <Typography>
        {translateMessage('ui.byClickingContinueYouReConfirm_ff3f011f')}{' '}
        <ExternalLink href={TERMS_URL} className={linkClassName}>
          {translateMessage('ui.terms_0af7f334')}
        </ExternalLink>{' '}
        {translateMessage('ui.andThisMessageAndAgreeTo_ac41e82e')}
      </Typography>
    </div>
  </div>
)

export default WidgetDisclaimer
