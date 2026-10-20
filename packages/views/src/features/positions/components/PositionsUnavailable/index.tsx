import { translateMessage } from '@safe-global/views/i18n'
import DefiIcon from '@safe-global/views/assets/images/balances/defi.svg'
import { Typography } from '@safe-global/views/components/ui/typography'

// This component is displayed when the positions feature flag is enabled,
// but the API does not return data from CGW (Client Gateway), or errors out.
const PositionsUnavailable = ({ hasError = false }: { hasError?: boolean }) => {
  const title = hasError
    ? translateMessage('ui.couldnTLoadYourPositions_5da3025f')
    : translateMessage('ui.positionsAreNotAvailableOnThis_a3036099')

  const subtitle = hasError
    ? translateMessage('ui.tryAgainLater_c5d3afb3')
    : translateMessage('ui.positionsFeatureIsStillInBeta_5b4307b5')

  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <div className="flex justify-center">
        <DefiIcon />
      </div>

      <Typography data-testid="positions-unavailable-text" align="center" className="text-[var(--color-primary-light)]">
        {title}
      </Typography>

      <Typography variant="paragraph-mini" align="center" className="mt-2 block text-[var(--color-primary-light)]">
        {subtitle}
      </Typography>
    </div>
  )
}

export default PositionsUnavailable
