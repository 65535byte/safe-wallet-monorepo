import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { CalendarClock, HandCoins, UsersRound } from 'lucide-react'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import PolicyIntroDialog, {
  type PolicyIntroExplainer,
} from '@safe-global/views/features/spaces/components/Policies/PolicyIntroDialog'
import SpendingLimitPreview from './SpendingLimitPreview'

const EXPLAINERS: PolicyIntroExplainer[] = [
  {
    Icon: UsersRound,
    text: translateMessage('ui.anyoneCanBeASpenderThey_607afdc8'),
  },
  {
    Icon: CalendarClock,
    text: translateMessage('ui.chooseATokenAndAnAmount_c62fb533'),
  },
  {
    Icon: HandCoins,
    text: translateMessage('ui.creatingTheLimitRequiresATransaction_01d28fac'),
  },
]

export interface SpendingLimitIntroDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProceed: () => void
}

const SpendingLimitIntroDialog = ({ open, onOpenChange, onProceed }: SpendingLimitIntroDialogProps): ReactElement => (
  <PolicyIntroDialog
    open={open}
    onOpenChange={onOpenChange}
    onProceed={onProceed}
    title={translateMessage('ui.spendingLimit_26abdb30')}
    description={translateMessage('ui.letSpendersAccessAssetsWithoutCollecting_4450464f')}
    helpArticle={HelpCenterArticle.SPENDING_LIMITS}
    helpLabel={translateMessage('ui.learnMoreAboutSpendingLimits_f51b7cae')}
    explainers={EXPLAINERS}
    preview={<SpendingLimitPreview />}
    proceedLabel={translateMessage('ui.setUpSpendingLimit_07e06abe')}
    testId="spending-limit-intro-dialog"
  />
)

export default SpendingLimitIntroDialog
