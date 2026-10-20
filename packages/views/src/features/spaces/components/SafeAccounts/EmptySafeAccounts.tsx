import { translateMessage } from '@safe-global/views/i18n'
import { Typography } from '@safe-global/views/components/ui/typography'
import SafeAccountsIcon from '@safe-global/views/assets/images/spaces/safe-accounts.svg'

const EmptySafeAccounts = () => {
  return (
    <div className="rounded-xl bg-card p-10 text-center">
      <div className="flex justify-center">
        <SafeAccountsIcon />
      </div>

      <Typography variant="paragraph" color="muted" className="mt-4">
        {translateMessage('ui.addExistingAccountsInYourSpace_f982bdd2')}
      </Typography>
    </div>
  )
}

export default EmptySafeAccounts
