import { translateMessage } from '@/i18n'
import { getProxyFactoryDeployments } from '@safe-global/safe-deployments'
import { hasMatchingDeployment } from '@safe-global/utils/services/contracts/deployments'
import type { SecurityScanner } from './types'
import { KNOWN_SAFE_VERSIONS, getSeverityFromScore } from './constants'

const isKnownFactory = (address: string, chainId: string): boolean =>
  hasMatchingDeployment(getProxyFactoryDeployments, address, chainId, KNOWN_SAFE_VERSIONS)

export const factoryValidationScanner: SecurityScanner = {
  id: 'factory_validation',
  scan: async (ctx) => {
    const { creationInfo, chainId } = ctx
    const now = new Date().toISOString()

    if (!creationInfo) {
      // Creation transaction data isn't loaded — distinct from "loaded and missing a
      // factory". Return `inconclusive` so we don't penalize the score or label the Safe
      // as deployed from an unrecognized source: we genuinely don't know yet, and the
      // user shouldn't see the result flip between scans once creationTx resolves.
      const score = 50
      return {
        status: 'inconclusive',
        severity: getSeverityFromScore(score, { excluded: true }),
        score,
        evidence: [
          {
            label: translateMessage('ui.status_8042eaf1'),
            value: translateMessage('ui.creationDataNotYetAvailable_5727efc5'),
          },
        ],
        remediation: translateMessage('ui.deploymentOriginWillBeVerifiedOnce_aecc550e'),
        lastChecked: now,
      }
    }

    if (!creationInfo.factoryAddress) {
      const score = 60
      return {
        status: 'partial',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          {
            label: translateMessage('ui.status_8042eaf1'),
            value: translateMessage('ui.noFactoryAddressRecorded_1d5b7c0a'),
          },
        ],
        remediation: translateMessage('ui.theDeploymentFactoryCouldNotBe_2a99a4cb'),
        lastChecked: now,
      }
    }

    if (isKnownFactory(creationInfo.factoryAddress, chainId)) {
      const score = 100
      return {
        status: 'clear',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          { label: translateMessage('ui.factory_53054f6c'), value: creationInfo.factoryAddress },
          { label: translateMessage('ui.status_8042eaf1'), value: translateMessage('ui.officialFactory_251c6ae2') },
        ],
        remediation: '',
        lastChecked: now,
      }
    }

    const score = 60
    return {
      status: 'partial',
      severity: getSeverityFromScore(score),
      score,
      evidence: [
        { label: translateMessage('ui.factory_53054f6c'), value: creationInfo.factoryAddress },
        { label: translateMessage('ui.status_8042eaf1'), value: translateMessage('ui.unrecognizedFactory_10c7b10f') },
      ],
      remediation: translateMessage('ui.thisWasNotDeployedViaA_413ab2b2'),
      lastChecked: now,
    }
  },
}
