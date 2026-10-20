import { translateMessage } from '@/i18n'
import { useCallback, useEffect } from 'react'
import type { ReactElement } from 'react'
import type { SessionTypes } from '@walletconnect/types'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import { Button } from '@safe-global/views/components/ui/button'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@safe-global/views/components/ui/tooltip'
import { Typography } from '@safe-global/views/components/ui/typography'
import WcHints from '../WcHints'
import WcSessionList from '../WcSessionList'
import WcInput from '../WcInput'
import WcLogoHeader from '../WcLogoHeader'
import css from './styles.module.css'
import useSafeInfo from '@/hooks/useSafeInfo'
import Track from '@/components/common/Track'
import { WALLETCONNECT_EVENTS } from '@/services/analytics/events/walletconnect'
import { BRAND_NAME } from '@/config/constants'

const WC_HINTS_KEY = 'wcHints'

const WcConnectionForm = ({ sessions, uri }: { sessions: SessionTypes.Struct[]; uri: string }): ReactElement => {
  const [showHints = true, setShowHints] = useLocalStorage<boolean>(WC_HINTS_KEY)
  const { safeLoaded } = useSafeInfo()

  const onToggle = useCallback(() => {
    setShowHints((prev) => !prev)
  }, [setShowHints])

  // Show the hints only once
  useEffect(() => {
    return () => setShowHints(false)
  }, [setShowHints])

  return (
    <div className="relative flex flex-col">
      <div className="pb-6 text-center">
        <Tooltip>
          <TooltipTrigger
            render={
              <span className={`inline-flex ${css.infoIcon}`}>
                <Track {...(showHints ? WALLETCONNECT_EVENTS.HINTS_HIDE : WALLETCONNECT_EVENTS.HINTS_SHOW)}>
                  <Button variant="ghost" size="icon" onClick={onToggle}>
                    <InfoIcon className="size-6 text-[var(--color-border-main)]" />
                  </Button>
                </Track>
              </span>
            }
          />
          <TooltipContent>
            {showHints
              ? translateMessage('ui.hideHowWalletConnectWorks_bb8ca5cc')
              : translateMessage('ui.howDoesWalletConnectWork_6cbe76bf')}
          </TooltipContent>
        </Tooltip>

        <WcLogoHeader />

        <Typography variant="paragraph-small" className="text-muted-foreground">
          {safeLoaded
            ? translateMessage('ui.pasteThePairingCodeBelowTo_c8739341', { p0: BRAND_NAME })
            : translateMessage('ui.pleaseOpenOneOfYourAccounts_75fda0e1')}
        </Typography>

        {safeLoaded ? (
          <div className="mt-6">
            <WcInput uri={uri} />
          </div>
        ) : null}
      </div>
      <Separator />
      <div className="py-6">
        <WcSessionList sessions={sessions} />
      </div>
      {showHints && (
        <>
          <Separator />

          <div className="pt-6">
            <WcHints />
          </div>
        </>
      )}
    </div>
  )
}

export default WcConnectionForm
