import { translateMessage } from '@/i18n'
import Track from '@/components/common/Track'
import { RECOVERY_EVENTS } from '@/services/analytics/events/recovery'
import { type ReactElement, useContext, useMemo } from 'react'

import { Button } from '@safe-global/views/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Typography } from '@safe-global/views/components/ui/typography'
import ExternalLink from '@safe-global/views/components/common/ExternalLink'
import { DelayModifierRow } from './DelayModifierRow'
import useRecovery from '../../hooks/useRecovery'
import EthHashInfo from '@/components/common/EthHashInfo'
import EnhancedTable from '@safe-global/views/components/common/EnhancedTable'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import CheckWallet from '@/components/common/CheckWallet'
import { getDetailedPeriod } from '@safe-global/views/utils/formatPeriod'
import { TOOLTIP_TITLES } from '@safe-global/views/components/tx-flow/common/constants'

import tableCss from '@safe-global/views/components/common/EnhancedTable/styles.module.css'
import { HelpCenterArticle, HelperCenterArticleTitles } from '@safe-global/utils/config/constants'
import { TxModalContext } from '@/components/tx-flow'
import UpsertRecoveryFlow from '@/components/tx-flow/flows/UpsertRecovery'
import SettingsCard from '@safe-global/views/components/settings/SettingsCard'

enum HeadCells {
  Recoverer = 'recoverer',
  Delay = 'delay',
  Expiry = 'expiry',
  Actions = 'actions',
}

const headCells = [
  { id: HeadCells.Recoverer, label: translateMessage('ui.recoverer_4d82da71') },
  {
    id: HeadCells.Delay,
    label: (
      <>
        {translateMessage('ui.reviewWindow_d007ef5d')}{' '}
        <Tooltip>
          <TooltipTrigger render={<span />}>
            <InfoIcon className="ml-1 inline size-4 fill-current align-middle text-[var(--color-border-main)]" />
          </TooltipTrigger>
          <TooltipContent>{TOOLTIP_TITLES.REVIEW_WINDOW}</TooltipContent>
        </Tooltip>
      </>
    ),
  },
  {
    id: HeadCells.Expiry,
    label: (
      <>
        {translateMessage('ui.proposalExpiry_368c328d')}{' '}
        <Tooltip>
          <TooltipTrigger render={<span />}>
            <InfoIcon className="ml-1 inline size-4 fill-current align-middle text-[var(--color-border-main)]" />
          </TooltipTrigger>
          <TooltipContent>{TOOLTIP_TITLES.PROPOSAL_EXPIRY}</TooltipContent>
        </Tooltip>
      </>
    ),
  },
  { id: HeadCells.Actions, label: '', sticky: true },
]

function RecoverySettings(): ReactElement {
  const [recovery] = useRecovery()

  const isRecoveryEnabled = recovery && recovery.length > 0

  const rows = useMemo(() => {
    return recovery?.flatMap((delayModifier) => {
      const { recoverers, delay, expiry } = delayModifier

      return recoverers.map((recoverer) => {
        const delaySeconds = Number(delay)
        const expirySeconds = Number(expiry)

        return {
          cells: {
            [HeadCells.Recoverer]: {
              rawValue: recoverer,
              content: <EthHashInfo address={recoverer} showCopyButton hasExplorer />,
            },
            [HeadCells.Delay]: {
              rawValue: delaySeconds,
              content: (
                <Typography>
                  {delaySeconds === 0 ? translateMessage('ui.none_48d72ef0') : getDetailedPeriod(delaySeconds)}
                </Typography>
              ),
            },
            [HeadCells.Expiry]: {
              rawValue: expirySeconds,
              content: (
                <Typography>
                  {expirySeconds === 0 ? translateMessage('ui.never_e0a41e0b') : getDetailedPeriod(expirySeconds)}
                </Typography>
              ),
            },
            [HeadCells.Actions]: {
              rawValue: '',
              content: (
                <div className={tableCss.actions}>
                  <DelayModifierRow delayModifier={delayModifier} />
                </div>
              ),
            },
          },
        }
      })
    })
  }, [recovery])

  return (
    <SettingsCard title={translateMessage('ui.accountRecovery_a5ed5ee0')} titleClassName="mb-2">
      <Typography className="mb-4">
        {isRecoveryEnabled
          ? translateMessage('ui.theTrustedRecovererWillBeAble_b48a8538')
          : translateMessage('ui.chooseATrustedRecovererToRecover_3afd17b9')}{' '}
        <Track {...RECOVERY_EVENTS.LEARN_MORE} label="settings">
          <ExternalLink
            className="font-bold hover:text-muted-foreground"
            href={HelpCenterArticle.RECOVERY}
            title={HelperCenterArticleTitles.RECOVERY}
          >
            {translateMessage('ui.learnMore_0c11daba')}
          </ExternalLink>
        </Track>
      </Typography>

      {!isRecoveryEnabled ? (
        <SetupRecoveryButton eventLabel="settings" />
      ) : rows ? (
        <EnhancedTable rows={rows} headCells={headCells} />
      ) : null}
    </SettingsCard>
  )
}

const SetupRecoveryButton = ({ eventLabel }: { eventLabel: string }) => {
  const { setTxFlow } = useContext(TxModalContext)
  return (
    <>
      <CheckWallet>
        {(isOk) => (
          <Track {...RECOVERY_EVENTS.SETUP_RECOVERY} label={eventLabel}>
            <Button
              data-testid="setup-recovery-btn"
              variant="default"
              disabled={!isOk}
              onClick={() => setTxFlow(<UpsertRecoveryFlow />)}
              className="mt-4"
            >
              {translateMessage('ui.setUpRecovery_480572ee')}
            </Button>
          </Track>
        )}
      </CheckWallet>
    </>
  )
}

export default RecoverySettings
