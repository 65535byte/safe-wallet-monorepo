import { translateMessage } from '@/i18n'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@safe-global/views/components/ui/accordion'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useState } from 'react'
import type { ReactElement } from 'react'
import Question from '@/public/images/common/question.svg'
import css from './styles.module.css'
import { trackEvent } from '@/services/analytics'
import { WALLETCONNECT_EVENTS } from '@/services/analytics/events/walletconnect'

const HintAccordion = ({
  title,
  items,
  expanded,
  onExpand,
}: {
  title: string
  items: Array<string>
  expanded: boolean
  onExpand: () => void
}): ReactElement => {
  return (
    <Accordion value={expanded ? ['item'] : []} onValueChange={onExpand}>
      <AccordionItem
        value="item"
        className="overflow-hidden rounded-lg border border-transparent transition-colors hover:border-[var(--color-success-light)] data-open:border-[var(--color-success-light)]"
      >
        <AccordionTrigger className="px-4 transition-colors hover:bg-[var(--color-success-background)] aria-expanded:bg-[var(--color-success-background)]">
          <Typography className={css.title}>
            <Question className={`size-4 ${css.questionIcon}`} />
            {title}
          </Typography>
        </AccordionTrigger>

        <AccordionContent className="px-4 pb-4 pt-0">
          <div className={css.list}>
            {items.map((item, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex ${css.listItemAvatar}`}>
                  <div
                    className={`flex items-center justify-center rounded-full bg-[var(--color-border-light)] text-foreground ${css.avatar}`}
                  >
                    {i + 1}
                  </div>
                </div>
                <Typography variant="paragraph-small">{item}</Typography>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

const ConnectionTitle = translateMessage('ui.howDoIConnectToA_d740be5c')
const ConnectionSteps = [
  translateMessage('ui.openAWalletConnectSupportedDApp_05d56cca'),
  translateMessage('ui.connectAWallet_c6475877'),
  translateMessage('ui.selectWalletConnectAsTheWallet_30980432'),
  translateMessage('ui.copyThePairingCodeAndPaste_fbad96f2'),
  translateMessage('ui.approveTheSession_d7751a2a'),
  translateMessage('ui.dAppIsNowConnectedToThe_a478dab3'),
]

const InteractionTitle = translateMessage('ui.howDoIInteractWithA_2d0c2c79')
const InteractionSteps = [
  translateMessage('ui.connectADAppByFollowingThe_640574b2'),
  translateMessage('ui.ensureTheDAppIsConnectedTo_9ac6070c'),
  translateMessage('ui.initiateATransactionSignatureRequestVia_862ce3b0'),
  translateMessage('ui.transactSignAsNormalViaThe_5889f9b3'),
]

const WcHints = (): ReactElement => {
  const [expandedAccordion, setExpandedAccordion] = useState<'connection' | 'interaction' | null>(null)

  const onExpand = (accordion: 'connection' | 'interaction') => {
    setExpandedAccordion((prev) => {
      return prev === accordion ? null : accordion
    })

    trackEvent(WALLETCONNECT_EVENTS.HINTS_EXPAND)
  }

  return (
    <div className="flex flex-col gap-2">
      <HintAccordion
        title={ConnectionTitle}
        items={ConnectionSteps}
        onExpand={() => onExpand('connection')}
        expanded={expandedAccordion === 'connection'}
      />
      <HintAccordion
        title={InteractionTitle}
        items={InteractionSteps}
        onExpand={() => onExpand('interaction')}
        expanded={expandedAccordion === 'interaction'}
      />
    </div>
  )
}

export default WcHints
