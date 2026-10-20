import { translateMessage } from '@/i18n'
import React, { useCallback, useMemo, useState, type ReactElement } from 'react'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import AddAccounts from '../../../AddAccounts'
import { HnSignupFlow } from '@/features/hypernative'
import Track from '@/components/common/Track'
import { SPACE_EVENTS, SPACE_LABELS } from '@/services/analytics/events/spaces'
import { WidgetEmptyState } from '../../../SafeWidget'
import { Card } from '@safe-global/views/components/ui/card'
import { Typography } from '@safe-global/views/components/ui/typography'
import css from './styles.module.css'
import { cn } from '@safe-global/views/utils/cn'

interface EmptyCardItemProps {
  iconNode: React.ReactNode | string
  title: string
  label?: string
  description: string
  onClick: () => void
}

const HELP_CENTER_ARTICLE = 'https://help.safe.global/articles/9622260218-account-recovery-with-saferecoveryhub'

const EmptyCardItem = ({ iconNode, title, description, label, onClick }: EmptyCardItemProps) => {
  return (
    <Card className={cn(css.emptyCardState, 'group')} onClick={onClick}>
      {typeof iconNode === 'string' ? (
        <div>
          <img alt="" className="w-[54px] rounded-md" src={iconNode} />
        </div>
      ) : (
        <div className="flex size-14 items-center justify-center rounded-md bg-green-100">{iconNode}</div>
      )}

      {label && (
        <Typography
          variant="paragraph-mini-bold"
          className="group-hover:opacity-0 transition-opacity uppercase absolute right-6 top-6"
          color="muted"
        >
          {label}
        </Typography>
      )}

      <div className="rounded-full absolute top-6 right-6 scale-0 transition-all opacity-0 group-hover:opacity-100 group-hover:scale-100 bg-primary aspect-square text-primary-foreground w-[34px] flex items-center justify-center">
        <ArrowUpRight className="w-5" />
      </div>

      <div>
        <Typography variant="h4" className="mb-1">
          {title}
        </Typography>
        <Typography variant="paragraph-small" color="muted">
          {description}
        </Typography>
      </div>
    </Card>
  )
}

const SecurityEmptyState = (): ReactElement => {
  const [isHnSignupOpen, setIsHnSignupOpen] = useState(false)

  const handleAccountRecoveryClick = useCallback(() => {
    window.open(HELP_CENTER_ARTICLE, '_blank')
  }, [])

  const handleHypernativeClick = useCallback(() => {
    setIsHnSignupOpen(true)
  }, [])

  const handleHnSignupClose = useCallback(() => {
    setIsHnSignupOpen(false)
  }, [])

  const CARDS = useMemo(
    () => [
      // TODO: We're hidding it because of the incident
      // {
      //   label: 'free',
      //   title: 'Account recovery',
      //   description: 'Never lose access to your Safe.',
      //   icon: <KeyRound />,
      //   onClick: handleAccountRecoveryClick,
      // },
      {
        label: 'enterprise',
        title: 'Hypernative Guardian',
        description: translateMessage('ui.blockRiskyTransactionsAutomatically_35e0c478'),
        icon: '/images/hypernative/hypernative-icon.svg',
        onClick: handleHypernativeClick,
      },
    ],
    [handleAccountRecoveryClick, handleHypernativeClick],
  )

  return (
    <>
      <div data-testid="security-empty-state" className="rounded-lg bg-card">
        <WidgetEmptyState
          className="max-w-[360px] mx-auto py-16"
          icon={<ShieldCheck className="size-6 text-green-500" />}
          text={translateMessage('ui.noAccountsToCheckYet_562c7907')}
          subtitle={translateMessage('ui.addAAccountToThisWorkspace_ece5a264')}
          action={
            <Track {...SPACE_EVENTS.ADD_ACCOUNTS_MODAL} label={SPACE_LABELS.security_page}>
              <AddAccounts buttonVariant="default" buttonLabel={translateMessage('ui.addAccount_22fb37e4')} />
            </Track>
          }
        />
      </div>

      <Typography as="h4" variant="paragraph-mini" className="my-3 text-secondary-foreground">
        {translateMessage('ui.aVAILABLEONEVERYSAFEYOUADD_3410d0d7')}
      </Typography>

      <div className="flex gap-4 flex-1 md:flex-row flex-col">
        {CARDS.map((card, index) => (
          <EmptyCardItem
            onClick={card.onClick}
            key={index}
            label={card.label}
            iconNode={card.icon}
            title={card.title}
            description={card.description}
          />
        ))}
      </div>

      <HnSignupFlow open={isHnSignupOpen} onClose={handleHnSignupClose} />
    </>
  )
}

export default SecurityEmptyState
