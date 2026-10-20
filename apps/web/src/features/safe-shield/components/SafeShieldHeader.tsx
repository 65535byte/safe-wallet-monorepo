import { translateMessage } from '@/i18n'
import { type ReactElement } from 'react'
import { Typography } from '@safe-global/views/components/ui/typography'
import type {
  ContractAnalysisResults,
  DeadlockAnalysisResults,
  RecipientAnalysisResults,
  ThreatAnalysisResults,
} from '@safe-global/utils/features/safe-shield/types'
import { Severity } from '@safe-global/utils/features/safe-shield/types'
import type { AsyncResult } from '@safe-global/utils/hooks/useAsync'
import { SEVERITY_COLORS } from '../constants'
import type { ChecksCount } from '../utils/countChecks'
import { useDelayedLoading } from '../hooks/useDelayedLoading'

const headerVisibilityDelay = 500
const localizedTitles: Record<string, string> = {
  'Risk detected': translateMessage('ui.riskDetected_7f12b903'),
  'Issues found': translateMessage('ui.issuesFound_15f27d29'),
  'Review details': translateMessage('ui.viewDetails_b34027e8'),
  'Checks passed': translateMessage('ui.checksPassed_a6bb3236'),
  'Checks unavailable': translateMessage('ui.checksUnavailable_3d482602'),
}

export const SafeShieldHeader = ({
  recipient = [{}, undefined, false],
  contract = [{}, undefined, false],
  threat = [{}, undefined, false],
  deadlock = [{}, undefined, false],
  overallStatus,
  checks,
}: {
  recipient?: AsyncResult<RecipientAnalysisResults>
  contract?: AsyncResult<ContractAnalysisResults>
  threat?: AsyncResult<ThreatAnalysisResults>
  deadlock: AsyncResult<DeadlockAnalysisResults>
  overallStatus?: { severity: Severity; title: string }
  /** "N of M checks passed" replaces the plain title while nothing is amiss. */
  checks?: ChecksCount
}): ReactElement => {
  const [_recipientResults, recipientError, recipientLoading = false] = recipient
  const [_contractResults, contractError, contractLoading = false] = contract
  const [_threatResults, threatError, threatLoading = false] = threat
  const [_deadlockResults, deadlockError, deadlockLoading = false] = deadlock

  const loading = recipientLoading || contractLoading || threatLoading || deadlockLoading
  const error = recipientError || contractError || threatError || deadlockError
  const isLoadingVisible = useDelayedLoading(loading, headerVisibilityDelay)

  const headerBgColor =
    !overallStatus || !overallStatus?.severity || isLoadingVisible
      ? 'var(--color-background-default)'
      : SEVERITY_COLORS[overallStatus.severity].background

  const headerTextColor =
    !overallStatus || !overallStatus?.severity || isLoadingVisible
      ? 'var(--color-text-secondary)'
      : SEVERITY_COLORS[overallStatus.severity].main

  const okTitle =
    overallStatus?.severity === Severity.OK && checks && checks.total > 0
      ? translateMessage('ui.ofChecksPassed_80a4b1b9', { p0: checks.passed, p1: checks.total })
      : overallStatus?.title
  const label = error
    ? translateMessage('ui.checksUnavailable_3d482602')
    : isLoadingVisible
      ? translateMessage('ui.analyzing_af25c80d')
      : (okTitle ?? translateMessage('ui.copilot_f3a6bca9'))

  return (
    <div className="px-1 pt-1">
      <div
        data-testid="safe-shield-status"
        className="flex flex-row rounded-md px-4 py-2"
        style={{ backgroundColor: headerBgColor }}
      >
        <Typography variant="paragraph-mini-bold" className="uppercase" style={{ color: headerTextColor }}>
          {localizedTitles[label] ?? label}
        </Typography>
      </div>
    </div>
  )
}
