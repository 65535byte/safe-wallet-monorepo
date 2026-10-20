import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'

import TxCard, { TxCardActions } from '@safe-global/views/components/tx-flow/common/TxCard'
import RecoveryRecoverers from '@safe-global/views/assets/images/settings/spending-limit/beneficiary.svg'
import RecoveryRecoverer from '@/public/images/transactions/recovery-recoverer.svg'
import RecoveryDelay from '@safe-global/views/assets/images/settings/spending-limit/time.svg'
import RecoveryExecution from '@/public/images/transactions/recovery-execution.svg'

import css from './styles.module.css'
import { useContext } from 'react'
import { TxFlowContext } from '../../TxFlowProvider'
import { Typography } from '@safe-global/views/components/ui/typography'
import { Button } from '@safe-global/views/components/ui/button'
import { Separator } from '@safe-global/views/components/ui/separator'

const RecoverySteps = [
  {
    Icon: RecoveryRecoverers,
    title: translateMessage('ui.chooseARecovererAndSetA_aa769f59'),
    subtitle: translateMessage('ui.onlyYourChosenRecovererCanInitiate_ba4a4074'),
  },
  {
    Icon: RecoveryRecoverer,
    title: translateMessage('ui.lostAccessLetTheRecovererConnect_770032c2'),
    subtitle: translateMessage('ui.theRecoveryProcessCanBeInitiated_f4d4d88b'),
  },
  {
    Icon: RecoveryDelay,
    title: translateMessage('ui.startTheRecoveryProcess_b2535d98'),
    subtitle: translateMessage('ui.yourRecovererInitiatesTheRecoveryProcess_23de34ee'),
  },
  {
    Icon: RecoveryExecution,
    title: translateMessage('ui.allDoneTheAccountIsYours_5eec1dd0'),
    subtitle: translateMessage('ui.onceTheReviewWindowHasPassed_dcc1a631'),
  },
]

export function UpsertRecoveryFlowIntro(): ReactElement {
  const { onNext, data } = useContext(TxFlowContext)
  return (
    <TxCard>
      <div className={`${css.connector} flex flex-col gap-8`}>
        {RecoverySteps.map(({ Icon, title, subtitle }, index) => (
          <div key={index}>
            <div className="flex gap-6">
              <div className={css.icon}>
                <Icon />
              </div>
              <div className="flex-1">
                <Typography variant="h4" className="mb-1">
                  {title}
                </Typography>
                <Typography variant="paragraph-small" className="block">
                  {subtitle}
                </Typography>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Separator bleed="6" />
      <TxCardActions>
        <Button data-testid="next-btn" variant="default" onClick={() => onNext(data)}>
          {translateMessage('ui.next_9cff86c8')}
        </Button>
      </TxCardActions>
    </TxCard>
  )
}
