import { translateMessage } from '@/i18n'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { TERMS_URL } from '@safe-global/utils/config/constants'
import { Typography } from '@safe-global/views/components/ui/typography'
import { type ReactElement } from 'react'
import css from './styles.module.css'

const LegalDisclaimerContent = ({
  withTitle = true,
  isSafeApps = true,
}: {
  withTitle?: boolean
  isSafeApps?: boolean
}): ReactElement => (
  <div className={css.disclaimerContainer}>
    {withTitle && (
      <Typography variant="h3" className="my-6 font-bold">
        {translateMessage('ui.disclaimer_7271ee86')}
      </Typography>
    )}
    <div className={css.disclaimerInner}>
      <Typography className="mb-8">
        {translateMessage('ui.youAreNowAccessing_321e7b5f')}
        {isSafeApps ? translateMessage('ui.thirdPartyApps_63b0ea26') : translateMessage('ui.aThirdPartyApp_83eedc83')}
        {translateMessage('ui.whichWeDoNotOwnControl_2167434a')}
        {isSafeApps ? 'apps' : 'app'}
        {translateMessage('ui.whichIsAtYourOwnRisk_d5a69eb6')}
      </Typography>

      <Typography className="mb-8">
        {translateMessage('ui.youMustReadOurTermsWhich_1670e55d')}
        {isSafeApps ? 'apps' : 'app'}.
      </Typography>

      <Typography>
        {translateMessage('ui.iHaveReadAndUnderstoodThe_6e19c19b')}{' '}
        <ExternalLink
          href={TERMS_URL}
          className="font-bold no-underline hover:text-muted-foreground hover:no-underline"
        >
          {translateMessage('ui.terms_3c2528e1')}
        </ExternalLink>{' '}
        {translateMessage('ui.andThisDisclaimerAndAgreeTo_5024ca60')}
      </Typography>
    </div>
  </div>
)

export default LegalDisclaimerContent
