import { translateMessage } from '@/i18n'
import { BRAND_NAME } from '@/config/constants'
import type { ReactElement } from 'react'
import { PencilLine, ShieldCheck, UsersRound } from 'lucide-react'
import { HelpCenterArticle } from '@safe-global/utils/config/constants'
import PolicyIntroDialog, {
  type PolicyIntroExplainer,
} from '@safe-global/views/features/spaces/components/Policies/PolicyIntroDialog'
import ProposerPreview from './ProposerPreview'

const EXPLAINERS: PolicyIntroExplainer[] = [
  {
    Icon: UsersRound,
    text: translateMessage('ui.proposersCanSuggestTransactionsButCannot_9aaca19a'),
  },
  {
    Icon: ShieldCheck,
    text: translateMessage('ui.separateTransactionPreparationFromTransactionApproval_3aaa5ff8'),
  },
  {
    Icon: PencilLine,
    text: translateMessage('ui.anyChangesRequireOwnerSignaturesAnd_f158cd8a', { p0: BRAND_NAME }),
  },
]

export interface ProposerIntroDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProceed: () => void
}

const ProposerIntroDialog = ({ open, onOpenChange, onProceed }: ProposerIntroDialogProps): ReactElement => (
  <PolicyIntroDialog
    open={open}
    onOpenChange={onOpenChange}
    onProceed={onProceed}
    title={translateMessage('ui.proposerRole_1d90df3b')}
    description={translateMessage('ui.letTeammatesWithoutSigningRightsPropose_65ac3715')}
    helpArticle={HelpCenterArticle.PROPOSERS}
    helpLabel={translateMessage('ui.learnMoreAboutProposers_9fabb4ac')}
    explainers={EXPLAINERS}
    preview={<ProposerPreview />}
    proceedLabel={translateMessage('ui.setUpProposer_0e2c6e67')}
    testId="proposer-intro-dialog"
  />
)

export default ProposerIntroDialog
