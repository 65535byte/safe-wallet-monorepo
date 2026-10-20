import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useCurrentChain } from '@/hooks/useChains'

import NavTabs from '@/components/common/NavTabs'
import { safeAppsNavItems } from '@/components/common/NavTabs/navItemsConfig'
import css from './styles.module.css'

const SafeAppsHeader = (): ReactElement => {
  const chain = useCurrentChain()
  return (
    <>
      <div className={css.container}>
        {/* Safe Apps Title */}
        <Typography variant="h3" className={css.title}>
          {translateMessage('ui.exploreThe_966fa8c5')}
          {chain?.chainName} {translateMessage('ui.ecosystem_0ab378de')}
        </Typography>

        {/* Safe Apps Subtitle */}
        <Typography className={css.subtitle}>
          {translateMessage('ui.connectToYourFavouriteWeb3Applications_016bb1d2')}
        </Typography>
      </div>

      {/* Safe Apps Tabs */}
      <div className={css.tabs}>
        <NavTabs tabs={safeAppsNavItems} />
      </div>
    </>
  )
}

export default SafeAppsHeader
