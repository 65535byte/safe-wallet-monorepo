import { translateMessage } from '@/i18n'
import Track from '@/components/common/Track'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { ATTENTION_PANEL_EVENTS } from '@/services/analytics/events/attention-panel'
import { Button } from '@safe-global/views/components/ui/button'
import { Card } from '@safe-global/views/components/ui/card'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import { useRecoveryTxState } from '../../hooks/useRecoveryTxState'
import { Countdown } from '@safe-global/views/components/common/Countdown'
import RecoveryPending from '@/public/images/common/recovery-pending.svg'
import { ActionCard } from '@/components/common/ActionCard'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { AppRoutes } from '@/config/routes'
import type { RecoveryQueueItem } from '../../services/recovery-state'

import css from './styles.module.css'
import { HelpCenterArticle, HelperCenterArticleTitles } from '@safe-global/utils/config/constants'

type Props =
  | {
      orientation?: 'vertical'
      onClose: () => void
      recovery: RecoveryQueueItem
    }
  | {
      orientation: 'horizontal'
      onClose?: never
      recovery: RecoveryQueueItem
    }

export function RecoveryInProgressCard({ orientation = 'vertical', onClose, recovery }: Props): ReactElement {
  const { isExecutable, isExpired, remainingSeconds } = useRecoveryTxState(recovery)
  const router = useRouter()

  const onClick = async () => {
    await router.push({
      pathname: AppRoutes.transactions.queue,
      query: router.query,
    })
    onClose?.()
  }

  const icon = <RecoveryPending />
  const title = isExecutable
    ? translateMessage('ui.accountCanBeRecovered_9e4fa245')
    : isExpired
      ? translateMessage('ui.accountRecoveryExpired_9dc62e40')
      : translateMessage('ui.accountRecoveryInProgress_6184aaf2')
  const desc = isExecutable
    ? translateMessage('ui.theReviewWindowHasPassedAnd_82dcfa51')
    : isExpired
      ? translateMessage('ui.thePendingRecoveryProposalHasExpired_bb81663b')
      : translateMessage('ui.theRecoveryProcessHasStartedThis_8ce97cd1')

  if (orientation === 'horizontal') {
    return (
      <ActionCard
        severity="info"
        title={title}
        content={
          <>
            {desc}
            {!isExecutable && !isExpired && (
              <>
                {' '}
                <Countdown seconds={remainingSeconds} />
              </>
            )}
          </>
        }
        learnMore={{
          href: HelpCenterArticle.RECOVERY,
          trackingEvent: RECOVERY_EVENTS.LEARN_MORE,
          label: 'in-progress-card',
        }}
        action={{ label: translateMessage('ui.goToQueue_08d730af'), onClick }}
        trackingEvent={ATTENTION_PANEL_EVENTS.CHECK_RECOVERY_PROPOSAL}
        testId="recovery-in-progress-card"
      />
    )
  }

  return (
    // eslint-disable-next-line no-restricted-syntax -- gap-8 spaces the recovery card sections; css.card owns padding/margin, radius comes from the Card default (lg)
    <Card className={[css.card, 'flex flex-col gap-8'].join(' ')}>
      <div className="flex justify-between">
        {icon}

        <Track {...RECOVERY_EVENTS.LEARN_MORE} label="in-progress-card">
          <ExternalLink href={HelpCenterArticle.RECOVERY} title={HelperCenterArticleTitles.RECOVERY}>
            {translateMessage('ui.learnMore_0c11daba')}
          </ExternalLink>
        </Track>
      </div>

      <div>
        <Typography variant="h4" className="mb-4">
          {title}
        </Typography>

        <Typography className="mb-4">{desc}</Typography>

        <Countdown seconds={remainingSeconds} />
      </div>

      <Separator className="mx-[calc(-1*var(--space-4))]" />

      <Track {...RECOVERY_EVENTS.CHECK_RECOVERY_PROPOSAL}>
        <Button data-testid="queue-btn" variant="default" onClick={onClick} className="self-end">
          {translateMessage('ui.goToQueue_08d730af')}
        </Button>
      </Track>
    </Card>
  )
}
