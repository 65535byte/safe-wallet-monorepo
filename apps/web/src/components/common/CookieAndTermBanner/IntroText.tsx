import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { AppRoutes } from '@/config/routes'
import { TERMS_URL } from '@safe-global/utils/config/constants'

const IntroText = ({ lastUpdated }: { lastUpdated: string }): ReactElement => {
  return (
    <Typography variant="paragraph-small" className="block mb-4">
      {translateMessage('ui.byBrowsingThisPageYouAccept_c1502a19')}
      <ExternalLink href={TERMS_URL}>{translateMessage('ui.termsConditions_9ac850da')}</ExternalLink>{' '}
      {translateMessage('ui.lastUpdated_cf24d3db')}
      {lastUpdated}
      {translateMessage('ui.andTheUseOfNecessaryCookies_1f28fe50')}{' '}
      <ExternalLink href={AppRoutes.cookie}>{translateMessage('ui.cookiePolicy_41bd3779')}</ExternalLink>
    </Typography>
  )
}

export default IntroText
