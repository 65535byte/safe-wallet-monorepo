import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import NextLink from 'next/link'
import { AppRoutes } from '@/config/routes'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@safe-global/utils/utils/chains'
import { LockedCheckRow } from '@safe-global/views/features/safe-shield/components/LockedCheckRow'
import { useSafeLinkQuery } from '@/hooks/useSafeLinkQuery'

/** Without Pro or an own Tenderly project nothing is called; "Set" leads to settings to bring one's own project. */
export const TenderlySimulationLocked = (): ReactElement | null => {
  const hasSimulation = useHasFeature(FEATURES.TX_SIMULATION) === true
  const safeLinkQuery = useSafeLinkQuery()
  if (!hasSimulation) return null

  return (
    <LockedCheckRow
      data-testid="tenderly-simulation-locked"
      tooltip={translateMessage('ui.builtInSimulationIsPartOf_5526ede8')}
      action={
        <NextLink
          href={{
            pathname: AppRoutes.settings.environmentVariables,
            query: safeLinkQuery,
          }}
          data-testid="set-simulation-link"
          className="inline-flex items-center rounded-2xs bg-[var(--color-border-light)] px-2 py-0.5 no-underline hover:bg-[var(--color-border-main)]"
        >
          <Typography variant="paragraph-mini" className="text-[var(--color-text-primary)] [letter-spacing:0.4px]">
            {translateMessage('ui.set_e052743b')}
          </Typography>
        </NextLink>
      }
    >
      {translateMessage('ui.transactionSimulation_1e0bcc02')}
    </LockedCheckRow>
  )
}
