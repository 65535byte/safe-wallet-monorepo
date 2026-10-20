import { translateMessage } from '@/i18n'
import semverLt from 'semver/functions/lt'
import semverValid from 'semver/functions/valid'
import {
  isUnsupportedMastercopyMigratable,
  isValidMasterCopy,
} from '@safe-global/utils/services/contracts/safeContracts'
import { getSafeSingletonDeployments, getSafeL2SingletonDeployments } from '@safe-global/safe-deployments'
import { hasMatchingDeployment } from '@safe-global/utils/services/contracts/deployments'
import type { EvidenceItem, ScanResult, SecurityScanner } from './types'
import { KNOWN_SAFE_VERSIONS, getSeverityFromScore } from './constants'

const REMEDIATION = {
  migrate: translateMessage('ui.thisVersionMayMissSecurityFixes_acf83dbd'),
  migrateWithCli: translateMessage('ui.thisVersionMayMissSecurityFixes_c34f4099'),
  update: translateMessage('ui.aNewerVersionIsAvailableUpdate_8ab3c122'),
  unrecognizedImplementation: translateMessage('ui.theImplementationContractAddressDoesNot_7b0dd9d1'),
  unverifiedOrigin: translateMessage('ui.thisWasOriginallyDeployedWithAn_5694c587'),
}

const isKnownImplementation = (address: string, chainId: string): boolean =>
  hasMatchingDeployment(getSafeSingletonDeployments, address, chainId, KNOWN_SAFE_VERSIONS) ||
  hasMatchingDeployment(getSafeL2SingletonDeployments, address, chainId, KNOWN_SAFE_VERSIONS)

/** `'unknown'` when either version is missing or not semver; build metadata (`+L2`) is ignored. */
const compareVersionToLatest = (version: string | null, latestVersion: string): 'older' | 'not-older' | 'unknown' => {
  if (!version || !semverValid(version) || !semverValid(latestVersion)) return 'unknown'
  return semverLt(version, latestVersion) ? 'older' : 'not-older'
}

const result = (
  status: ScanResult['status'],
  score: number,
  evidence: EvidenceItem[],
  rest: Partial<ScanResult> = {},
): ScanResult => ({
  status,
  severity: getSeverityFromScore(score),
  score,
  evidence,
  remediation: '',
  lastChecked: new Date().toISOString(),
  ...rest,
})

export const contractVersionScanner: SecurityScanner = {
  id: 'contract_version',
  scan: async (ctx) => {
    const { implementationVersionState, implementationAddress, version, latestVersion, chainId, creationInfo } = ctx
    const currentVersion = { label: translateMessage('ui.currentVersion_85f0ea8b'), value: version ?? 'Unknown' }

    // Unsupported master copy: same check as MastercopyWarning, by address since no bytecode is available here.
    if (!isValidMasterCopy(implementationVersionState)) {
      const canMigrate = isUnsupportedMastercopyMigratable(
        { implementationVersionState, version, chainId, implementation: { value: implementationAddress } },
        { recommendedVersion: latestVersion },
      )
      return result(
        'issue',
        10,
        [
          currentVersion,
          { label: translateMessage('ui.status_8042eaf1'), value: 'Unsupported' },
          { label: translateMessage('ui.implementation_01472046'), value: implementationAddress },
        ],
        {
          remediation: canMigrate ? REMEDIATION.migrate : REMEDIATION.migrateWithCli,
          ctaLabelOverride: translateMessage('ui.migrate_77220f4b'),
        },
      )
    }

    // A newer version exists for this official master copy; defers to the gateway when versions can't be compared.
    const isOutdated =
      implementationVersionState === 'OUTDATED' &&
      ctx.masterCopyDeployer === 'Gnosis' &&
      compareVersionToLatest(version, latestVersion) !== 'not-older'
    const versions = isOutdated
      ? [currentVersion, { label: translateMessage('ui.latestVersion_1bc275f3'), value: latestVersion }]
      : [currentVersion]
    const upgrade = isOutdated ? { upgradeAvailable: true } : {}

    // isNonCriticalUpdate = the Safe is on 1.3.0+, so an update is an upgrade between supported versions, not a risk.
    if (isOutdated && !ctx.isNonCriticalUpdate) {
      return result('issue', 30, versions, { remediation: REMEDIATION.update })
    }

    if (!isKnownImplementation(implementationAddress, chainId)) {
      return result(
        'issue',
        30,
        [
          currentVersion,
          { label: translateMessage('ui.implementation_01472046'), value: implementationAddress },
          {
            label: translateMessage('ui.status_8042eaf1'),
            value: translateMessage('ui.unrecognizedImplementation_bb9d0d2a'),
          },
        ],
        { remediation: REMEDIATION.unrecognizedImplementation },
      )
    }

    if (creationInfo?.masterCopy && !isKnownImplementation(creationInfo.masterCopy, chainId)) {
      return result(
        'partial',
        60,
        [
          ...versions,
          { label: translateMessage('ui.originalImplementation_500873fe'), value: creationInfo.masterCopy },
          {
            label: translateMessage('ui.status_8042eaf1'),
            value: translateMessage('ui.deployedWithUnrecognizedImplementation_ce5c8408'),
          },
        ],
        { remediation: REMEDIATION.unverifiedOrigin, ...upgrade },
      )
    }

    if (isOutdated) return result('clear', 100, versions, upgrade)

    return result('clear', 100, [
      currentVersion,
      { label: translateMessage('ui.status_8042eaf1'), value: translateMessage('ui.upToDate_2a0ab433') },
    ])
  },
}
