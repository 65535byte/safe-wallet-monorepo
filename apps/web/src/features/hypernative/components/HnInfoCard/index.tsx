import { translateMessage } from '@/i18n'
import { type ReactElement } from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'
import SafeShieldLogo from '@/public/images/safe-shield/safe-shield-logo-no-text.svg'
import InfoIcon from '@safe-global/views/assets/images/notifications/info.svg'
import { HypernativeTooltip } from '../HypernativeTooltip'
import type { HypernativeAuthStatus } from '../../hooks/useHypernativeOAuth'

export interface HnInfoCardProps {
  hypernativeAuth?: HypernativeAuthStatus
  showActiveStatus?: boolean
}

export const HnInfoCard = ({ hypernativeAuth, showActiveStatus = true }: HnInfoCardProps): ReactElement | null => {
  if (!hypernativeAuth || !showActiveStatus) {
    return null
  }

  return (
    <div className="flex flex-row items-center justify-between px-3 pt-3 pb-4">
      <div className="flex flex-row items-center gap-2">
        <SafeShieldLogo className="size-4 [&_.shield-img]:fill-[var(--color-border-light)]" />
        <Typography variant="paragraph-small" className="text-[var(--color-primary-light)]">
          {translateMessage('ui.hypernativeGuardianIsActive_1415915e')}
        </Typography>
      </div>
      <HypernativeTooltip title={translateMessage('ui.hypernativeGuardianIsActivelyMonitoringThis_d17bbf49')}>
        <InfoIcon className="size-4 text-[var(--color-border-main)]" />
      </HypernativeTooltip>
    </div>
  )
}
