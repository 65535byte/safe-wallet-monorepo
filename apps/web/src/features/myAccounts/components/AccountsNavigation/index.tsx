import { translateMessage } from '@/i18n'
import NextLink from 'next/link'
import { AppRoutes } from '@/config/routes'
import { Tabs, TabsList, TabsTrigger } from '@safe-global/views/components/ui/tabs'

const AccountsNavigation = () => (
  <Tabs value={AppRoutes.welcome.accounts} className="w-full max-w-110">
    <TabsList
      variant="toggle"
      size="lg"
      aria-label={translateMessage('ui.accountsNavigation_20c173dc')}
      className="w-full"
    >
      <TabsTrigger
        value={AppRoutes.welcome.accounts}
        nativeButton={false}
        render={<NextLink href={AppRoutes.welcome.accounts} />}
      >
        {translateMessage('ui.myAccounts_837c511d')}
      </TabsTrigger>
    </TabsList>
  </Tabs>
)

export default AccountsNavigation
