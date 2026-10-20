import { translateMessage } from '@/i18n'
import { type ReactNode, useMemo, useState } from 'react'
import { Button } from '@safe-global/views/components/ui/button'
import { shortenAddress } from '@safe-global/utils/utils/formatters'
import type { EvidenceItem, SafeGrade, ScanContext, ScanResult, SecurityGrade } from '@/features/security/types'
import { SecurityFeature } from '@/features/security'
import { useLoadFeature } from '@/features/__core__'
import {
  EvidenceList,
  Row,
  buildExpanded,
  isPassingStatus,
  makeBuildCta,
  sortBySeverity,
  type SectionRow,
} from '../primitives'
import {
  GRADE_TONE,
  resolveStatusTone,
  SeverityIcon,
  type SeverityTone,
} from '@safe-global/views/features/spaces/components/SecurityHub/components/SeverityIcon/SeverityIcon'
import {
  VULNERABLE_MODULE_INTRO,
  ZODIAC_VULNERABILITY_CTA,
  getModuleRowContent,
} from '@safe-global/views/features/spaces/components/SecurityHub/components/SecurityChecks/utils'
import { useUrlSpaceId } from '@/hooks/useUrlSpaceId'

export type FailingRow = { key: string; node: ReactNode; grade: SafeGrade }

export type UseSecurityChecksResult = {
  isReady: boolean
  failingRows: FailingRow[]
  passingRows: { key: string; node: ReactNode }[]
}

/** Maps a per-check severity to the SafeGrade used by the issue chips. */
const SEVERITY_TO_SAFE_GRADE: Record<SecurityGrade, SafeGrade> = {
  Critical: 'critical',
  High: 'at_risk',
  Medium: 'needs_attention',
  Low: 'needs_attention',
}

/** Accent-bar + icon colour per grade, matching the SafeGrade chip's text colour. */
const GRADE_ROW_COLOR: Record<SafeGrade, string> = {
  critical: 'error.main',
  at_risk: 'warning.main',
  needs_attention: 'review.main',
  passing: 'success.main',
}

/**
 * Tone for a check row's accent bar + leading icon. Failing rows take their grade group's
 * colour (so the bar/icon match the section chip); passing / N-A / inconclusive rows keep
 * their neutral status tone. `needs_attention` rows also swap their per-status glyph for
 * the grade's info icon — so a partial Medium check reads as info, not a warning triangle.
 */
const rowTone = (status: ScanResult['status'], severity: SecurityGrade): SeverityTone => {
  const base = resolveStatusTone(status, severity)
  if (isPassingStatus(status)) return base
  const grade = SEVERITY_TO_SAFE_GRADE[severity]
  const Icon = grade === 'needs_attention' ? GRADE_TONE.needs_attention.Icon : base.Icon
  return { Icon, color: GRADE_ROW_COLOR[grade] }
}

/**
 * Derives the rows rendered by `SecurityChecksSection` from raw scan results.
 *
 * Owns the `modulesExpanded` UI state because it directly affects which rows
 * are produced (collapsed summary vs. one row per module). The footer's
 * `passingExpanded` state stays in the rendering component since it only
 * toggles visibility of an already-built list.
 */
export const useSecurityChecks = (
  scanContext: ScanContext,
  results: Record<string, ScanResult>,
  safeQueryParam: string | undefined,
  /** Opens the Hypernative signup flow for a partner-tagged guard nudge (drawer-provided). */
  onHnSignupClick?: () => void,
): UseSecurityChecksResult => {
  const security = useLoadFeature(SecurityFeature)
  const [modulesExpanded, setModulesExpanded] = useState(false)
  const spaceId = useUrlSpaceId()

  const buildCta = useMemo(
    () => (security.$isReady ? makeBuildCta(security.checkDefs, spaceId) : null),
    [security.$isReady, security.checkDefs, spaceId],
  )

  const isKnownModuleByName = security.$isReady ? security.isKnownModuleByName : null
  const zeroAddress = security.$isReady ? security.zeroAddress : null

  const { failingRows, passingRows } = useMemo(() => {
    if (!buildCta || !isKnownModuleByName || !zeroAddress) {
      return {
        failingRows: [] as FailingRow[],
        passingRows: [] as { key: string; node: ReactNode }[],
      }
    }

    const hasGuard = scanContext.guard !== null && scanContext.guard.value !== zeroAddress
    const hasFallback = scanContext.fallbackHandler !== null && scanContext.fallbackHandler.value !== zeroAddress
    const activeModules = (scanContext.modules ?? [])
      .filter((m) => m.value !== zeroAddress)
      // Defensive de-dupe: never render the same module address twice.
      .filter((m, i, arr) => arr.findIndex((o) => o.value.toLowerCase() === m.value.toLowerCase()) === i)
    // The Safe is affected by a known Zodiac vulnerability when the modules scanner sets
    // `vulnerableModules` (an empty array still means "affected" — see the nested case below).
    const vulnerableModules = results['modules']?.vulnerableModules
    const isVulnerable = Array.isArray(vulnerableModules)
    const vulnerableSet = new Set(vulnerableModules ?? [])
    // Never collapse into a summary when affected — the vulnerable row + remove CTA must stay visible.
    const showModuleSummary = activeModules.length > 2 && !modulesExpanded && !isVulnerable

    const items: SectionRow[] = []
    const iconFor = (r: ScanResult) => <SeverityIcon tone={rowTone(r.status, r.severity)} />
    const toneFor = (r: ScanResult) => rowTone(r.status, r.severity)
    // Surface the remediation as the row subtitle for failing checks (passing rows need no action).
    const subtitleFor = (r: ScanResult) => (!isPassingStatus(r.status) && r.remediation ? r.remediation : undefined)

    const accountSetupResult = results['account_setup']
    if (accountSetupResult) {
      const ok = isPassingStatus(accountSetupResult.status)
      const title = ok
        ? translateMessage('ui.signingThresholdIsStrong_7ae456c7')
        : scanContext.threshold === 1
          ? translateMessage('ui.singleSignerControlsThis_23b723f2')
          : translateMessage('ui.signingThresholdIsLow_d153ec7a')
      items.push({
        key: 'threshold',
        severity: accountSetupResult.severity,
        isPassing: ok,
        node: (
          <Row
            leadIcon={iconFor(accountSetupResult)}
            accentTone={toneFor(accountSetupResult)}
            subtitle={subtitleFor(accountSetupResult)}
            title={title}
            expandedContent={buildExpanded(
              accountSetupResult,
              buildCta('account_setup', accountSetupResult, safeQueryParam),
            )}
          />
        ),
      })
    }

    const multichainResult = results['multichain_setup']
    if (multichainResult && multichainResult.status !== 'not_applicable') {
      const ok = isPassingStatus(multichainResult.status)
      const title = ok
        ? translateMessage('ui.signersAreConsistentAcrossNetworks_c6902b23')
        : translateMessage('ui.signersDifferAcrossNetworks_eaf5bba6')
      items.push({
        key: 'multichain',
        severity: multichainResult.severity,
        isPassing: ok,
        node: (
          <Row
            leadIcon={iconFor(multichainResult)}
            accentTone={toneFor(multichainResult)}
            subtitle={subtitleFor(multichainResult)}
            title={title}
            expandedContent={buildExpanded(
              multichainResult,
              buildCta('multichain_setup', multichainResult, safeQueryParam),
            )}
          />
        ),
      })
    }

    const recoveryResult = results['recovery']
    if (recoveryResult) {
      const ok = isPassingStatus(recoveryResult.status)
      const title =
        recoveryResult.status === 'clear'
          ? translateMessage('ui.recoveryIsConfigured_21d6eeba')
          : recoveryResult.status === 'not_applicable'
            ? translateMessage('ui.recoveryNotAvailableOnThisNetwork_2f182569')
            : translateMessage('ui.recoveryIsNotConfigured_99734089')
      items.push({
        key: 'recovery',
        severity: recoveryResult.severity,
        isPassing: ok,
        node: (
          <Row
            leadIcon={iconFor(recoveryResult)}
            accentTone={toneFor(recoveryResult)}
            subtitle={subtitleFor(recoveryResult)}
            title={title}
            expandedContent={buildExpanded(recoveryResult, buildCta('recovery', recoveryResult, safeQueryParam))}
          />
        ),
      })
    }

    const versionResult = results['contract_version']
    if (versionResult) {
      const ok = isPassingStatus(versionResult.status)
      const title = !ok
        ? translateMessage('ui.contractVersionIsOutdated_49a1c75f')
        : versionResult.upgradeAvailable
          ? translateMessage('ui.newContractVersionAvailable_ce108188')
          : translateMessage('ui.contractVersionIsUpToDate_c190c7bf')
      items.push({
        key: 'version',
        severity: versionResult.severity,
        isPassing: ok,
        node: (
          <Row
            leadIcon={iconFor(versionResult)}
            accentTone={toneFor(versionResult)}
            subtitle={subtitleFor(versionResult)}
            title={title}
            expandedContent={buildExpanded(versionResult, buildCta('contract_version', versionResult, safeQueryParam))}
          />
        ),
      })
    }

    const factoryResult = results['factory_validation']
    if (factoryResult) {
      const ok = isPassingStatus(factoryResult.status)
      const title =
        factoryResult.status === 'clear'
          ? translateMessage('ui.deployedViaOfficialFactory_1a07468a')
          : factoryResult.status === 'inconclusive'
            ? translateMessage('ui.deploymentOriginNotYetVerified_d208fad0')
            : translateMessage('ui.deployedFromAnUnrecognizedSource_f67e2051')
      items.push({
        key: 'factory',
        severity: factoryResult.severity,
        isPassing: ok,
        node: (
          <Row
            leadIcon={iconFor(factoryResult)}
            accentTone={toneFor(factoryResult)}
            subtitle={subtitleFor(factoryResult)}
            title={title}
            expandedContent={buildExpanded(
              factoryResult,
              buildCta('factory_validation', factoryResult, safeQueryParam),
            )}
          />
        ),
      })
    }

    const guardResult = results['guard']
    if (guardResult) {
      const ok = isPassingStatus(guardResult.status)
      const title = ok
        ? hasGuard
          ? translateMessage('ui.transactionGuardIsActive_9708f80e')
          : translateMessage('ui.noUnsupportedGuardInstalled_60b14566')
        : hasGuard
          ? translateMessage('ui.transactionGuardIsUnverified_eba40ff1')
          : translateMessage('ui.transactionGuardIsRecommended_02b36d54')
      // A partner-tagged, actionable guard result opens the Hypernative signup flow in place of a
      // deep-link. Passing results already get no CTA (buildCta returns null), so this only fires
      // for the Tier-3 nudge (no guard, high-value, Hypernative chain).
      const guardCta =
        !ok && guardResult.partner === 'hypernative' && onHnSignupClick
          ? { label: guardResult.ctaLabelOverride || 'Set up protection', onClick: onHnSignupClick }
          : buildCta('guard', guardResult, safeQueryParam)
      items.push({
        key: 'guard',
        severity: guardResult.severity,
        isPassing: ok,
        node: (
          <Row
            leadIcon={iconFor(guardResult)}
            accentTone={toneFor(guardResult)}
            subtitle={subtitleFor(guardResult)}
            title={title}
            expandedContent={buildExpanded(guardResult, guardCta)}
          />
        ),
      })
    }

    const fallbackResult = results['fallback_handler']
    if (fallbackResult) {
      const ok = isPassingStatus(fallbackResult.status)
      // Scanner emits a human label like "Official Safe fallback handler" / "CoW Protocol TWAP handler"
      // in evidence — reuse it directly so the title auto-matches each variant.
      const handlerLabel = fallbackResult.evidence?.find(
        (e): e is { label: string; value: string } => typeof e !== 'string' && e.label === 'Status',
      )?.value
      const title = ok
        ? hasFallback
          ? handlerLabel || 'Fallback handler is active'
          : translateMessage('ui.noFallbackHandlerInUse_1115e732')
        : translateMessage('ui.fallbackHandlerIsUnverified_c3978f3c')
      items.push({
        key: 'fallback',
        severity: fallbackResult.severity,
        isPassing: ok,
        node: (
          <Row
            leadIcon={iconFor(fallbackResult)}
            accentTone={toneFor(fallbackResult)}
            subtitle={subtitleFor(fallbackResult)}
            title={title}
            expandedContent={buildExpanded(
              fallbackResult,
              buildCta('fallback_handler', fallbackResult, safeQueryParam),
            )}
          />
        ),
      })
    }

    const modulesResult = results['modules']
    if (modulesResult) {
      if (activeModules.length === 0) {
        items.push({
          key: 'modules-empty',
          severity: modulesResult.severity,
          isPassing: isPassingStatus(modulesResult.status),
          node: (
            <Row
              leadIcon={iconFor(modulesResult)}
              accentTone={toneFor(modulesResult)}
              subtitle={subtitleFor(modulesResult)}
              title={translateMessage('ui.noUnsupportedModuleInstalled_0fd5e8db')}
              expandedContent={buildExpanded(modulesResult, buildCta('modules', modulesResult, safeQueryParam))}
            />
          ),
        })
      } else if (showModuleSummary) {
        // Collapsed summary row — not expandable, acts as a gateway to per-module rows.
        items.push({
          key: 'modules-summary',
          severity: modulesResult.severity,
          isPassing: isPassingStatus(modulesResult.status),
          node: (
            <Row
              leadIcon={iconFor(modulesResult)}
              accentTone={toneFor(modulesResult)}
              title={translateMessage('ui.modulesExtensionsInstalled_a6cae4e6', { p0: activeModules.length })}
              trailing={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    setModulesExpanded(true)
                  }}
                  // eslint-disable-next-line no-restricted-syntax -- inline text toggle: auto-height, no padding
                  className="h-auto min-w-0 p-0 text-[0.7rem] font-semibold normal-case"
                >
                  {translateMessage('ui.viewAll_51f8dcd8')}
                </Button>
              }
            />
          ),
        })
      } else {
        const modulesCta = buildCta('modules', modulesResult, safeQueryParam)
        // Affected but no removable module on this Safe (implicated via a related Safe) — surface a
        // single Critical warning instead of per-module rows that would have no remove target.
        if (isVulnerable && vulnerableSet.size === 0) {
          const severity: SecurityGrade = 'Critical'
          items.push({
            key: 'modules-vulnerable-nested',
            severity,
            isPassing: false,
            node: (
              <Row
                leadIcon={<SeverityIcon tone={rowTone('issue', severity)} />}
                accentTone={rowTone('issue', severity)}
                title={translateMessage('ui.vulnerableModuleDetected_8e0f15db')}
                expandedContent={<EvidenceList intro={VULNERABLE_MODULE_INTRO} cta={ZODIAC_VULNERABILITY_CTA} />}
              />
            ),
          })
        }
        activeModules.forEach((mod) => {
          const vulnerable = vulnerableSet.has(mod.value)
          const trusted = !vulnerable && isKnownModuleByName(mod.name)
          const severity: SecurityGrade = vulnerable ? 'Critical' : trusted ? 'Low' : 'High'
          const status: ScanResult['status'] = trusted ? 'clear' : 'issue'
          // Identify which module each row is so multiple flagged modules aren't indistinguishable.
          const title = vulnerable
            ? translateMessage('ui.vulnerableModule_286b0278', { p0: mod.name || shortenAddress(mod.value) })
            : trusted
              ? translateMessage('ui.recognizedModule_28738ef3', { p0: mod.name || shortenAddress(mod.value) })
              : translateMessage('ui.unrecognizedModuleDetected_51df9740')
          const perModuleEvidence: EvidenceItem[] = [
            { label: translateMessage('ui.address_ad6c5986'), value: mod.value },
            ...(mod.name ? [{ label: translateMessage('ui.name_84f28b85'), value: mod.name }] : []),
          ]
          const { intro, cta } = getModuleRowContent({ vulnerable, trusted }, modulesCta)
          items.push({
            key: `module-${mod.value}`,
            severity,
            isPassing: trusted,
            node: (
              <Row
                leadIcon={<SeverityIcon tone={rowTone(status, severity)} />}
                accentTone={rowTone(status, severity)}
                title={title}
                expandedContent={<EvidenceList intro={intro} evidence={perModuleEvidence} cta={cta} />}
              />
            ),
          })
        })
      }
    }

    const scanningResult = results['transaction_scanning']
    if (scanningResult) {
      const ok = isPassingStatus(scanningResult.status)
      const title = ok
        ? translateMessage('ui.transactionScanningIsEnabled_86affebe')
        : translateMessage('ui.transactionScanningIsDisabled_1dc25b7b')
      items.push({
        key: 'scanning',
        severity: scanningResult.severity,
        isPassing: ok,
        node: (
          <Row
            leadIcon={iconFor(scanningResult)}
            accentTone={toneFor(scanningResult)}
            subtitle={subtitleFor(scanningResult)}
            title={title}
            expandedContent={buildExpanded(
              scanningResult,
              buildCta('transaction_scanning', scanningResult, safeQueryParam),
            )}
          />
        ),
      })
    }

    const pendingResult = results['pending_tx']
    if (pendingResult) {
      const ok = isPassingStatus(pendingResult.status)
      const queued = scanContext.queuedTxCount
      const title = ok
        ? queued > 0
          ? translateMessage('ui.queueIsUpToDate_1ebd59e7')
          : translateMessage('ui.noPendingTransactions_233bb81d')
        : translateMessage('ui.pendingTransactionsAreStale_fd8edd11')
      items.push({
        key: 'pending',
        severity: pendingResult.severity,
        isPassing: ok,
        node: (
          <Row
            leadIcon={iconFor(pendingResult)}
            accentTone={toneFor(pendingResult)}
            subtitle={subtitleFor(pendingResult)}
            title={title}
            expandedContent={buildExpanded(pendingResult, buildCta('pending_tx', pendingResult, safeQueryParam))}
          />
        ),
      })
    }

    return {
      failingRows: sortBySeverity(items.filter((i) => !i.isPassing)).map(({ key, node, severity }) => ({
        key,
        node,
        grade: SEVERITY_TO_SAFE_GRADE[severity],
      })),
      passingRows: items.filter((i) => i.isPassing).map(({ key, node }) => ({ key, node })),
    }
  }, [
    buildCta,
    isKnownModuleByName,
    zeroAddress,
    scanContext,
    results,
    safeQueryParam,
    modulesExpanded,
    onHnSignupClick,
  ])

  if (!security.$isReady || !buildCta) {
    return { isReady: false, failingRows: [], passingRows: [] }
  }

  return { isReady: true, failingRows, passingRows }
}
