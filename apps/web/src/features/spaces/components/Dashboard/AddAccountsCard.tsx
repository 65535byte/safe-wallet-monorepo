import { translateMessage } from '@/i18n'
import AddAccountsChooser from '../AddAccountsChooser'
import Image from 'next/image'
import { Typography } from '@safe-global/views/components/ui/typography'
import EmptyDashboard from '@/public/images/spaces/empty_dashboard.png'
import EmptyDashboardDark from '@/public/images/spaces/empty_dashboard_dark.png'

import css from './styles.module.css'
import { SPACE_EVENTS, SPACE_LABELS } from '@/services/analytics/events/spaces'
import Track from '@/components/common/Track'
import { useDarkMode } from '@/hooks/useDarkMode'

const AddAccountsCard = () => {
  const isDarkMode = useDarkMode()

  return (
    <div className="flex gap-6 rounded-xl bg-card p-6">
      <div className="flex flex-col-reverse items-center gap-6 md:flex-row">
        <div className="flex-[2]">
          <Typography variant="h4" className="mb-4">
            {translateMessage('ui.addYourAccounts_de3ec855')}
          </Typography>

          <Typography variant="paragraph" color="muted" className="mb-4">
            {translateMessage('ui.startByAddingAccountsToYour_cd1bce12')}
          </Typography>

          <Track {...SPACE_EVENTS.ADD_ACCOUNTS_MODAL} label={SPACE_LABELS.space_dashboard_card}>
            <AddAccountsChooser buttonLabel={translateMessage('ui.manageAccounts_44bc5685')} entryPoint="dashboard" />
          </Track>
        </div>

        <div>
          <Image
            className={css.image}
            src={isDarkMode ? EmptyDashboardDark : EmptyDashboard}
            alt={translateMessage('ui.illustrationOfTwoSafesWithTheir_fe7b2de9')}
            width={375}
            height={200}
          />
        </div>
      </div>
    </div>
  )
}

export default AddAccountsCard
