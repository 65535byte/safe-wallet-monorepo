import { translateMessage } from '@/i18n'
import { ZERO_ADDRESS } from '@safe-global/utils/utils/constants'
import { ContractVersions, KnownContracts, type SupportedNetworks } from '@gnosis.pm/zodiac'
import { sameAddress } from '@safe-global/utils/utils/addresses'
import type { SecurityScanner } from './types'
import { HIGH_VALUE_THRESHOLD_USD, getSeverityFromScore } from './constants'

/** Canonical (case-insensitive) guard names tagged as trusted. */
const HYPERNATIVE_GUARD_NAME = 'hypernative'
const SCOPE_GUARD_NAME = 'scope guard'
const META_GUARD_NAME = 'meta guard'

const TRUSTED_GUARD_NAMES = [HYPERNATIVE_GUARD_NAME, SCOPE_GUARD_NAME, META_GUARD_NAME]

/** Zodiac guard contracts to check addresses against. */
const ZODIAC_GUARD_CONTRACTS = [KnownContracts.SCOPE_GUARD, KnownContracts.META_GUARD]

/** Check if a guard address matches a known Zodiac guard deployment. */
const isKnownZodiacGuard = (chainId: string, guardAddress: string): boolean => {
  try {
    const chainContracts = ContractVersions[Number(chainId) as SupportedNetworks]
    if (!chainContracts) return false

    return ZODIAC_GUARD_CONTRACTS.some((contract) => {
      const versions = chainContracts[contract]
      return versions && Object.values(versions).some((addr) => sameAddress(addr, guardAddress))
    })
  } catch {
    return false
  }
}

// Pure name-only heuristic to decide whether to tag a result with the hypernative partner.
// The authoritative on-chain check (`features/hypernative/services/hypernativeGuardCheck.ts`)
// needs a JSON-RPC provider, which the scanner intentionally avoids. We start the name with
// the canonical prefix to keep false positives down.
const nameSuggestsHypernativeGuard = (name?: string | null): boolean => {
  if (!name) return false
  return name.trim().toLowerCase().startsWith(HYPERNATIVE_GUARD_NAME)
}

/**
 * Two-layer trust detection:
 * Layer 1: Name-based matching from CGW API enrichment
 * Layer 2: Address-based matching against Zodiac guard deployments
 */
const isTrustedGuard = (name: string | null | undefined, chainId: string, address: string): boolean => {
  // Layer 1: API-provided name
  if (name) {
    const lower = name.toLowerCase()
    if (TRUSTED_GUARD_NAMES.some((trusted) => lower.includes(trusted))) return true
  }

  // Layer 2: Known Zodiac guard deployment addresses
  return isKnownZodiacGuard(chainId, address)
}

export const guardScanner: SecurityScanner = {
  id: 'guard',
  scan: async (ctx) => {
    const { guard, chainId, chainSupportsHypernative } = ctx
    const now = new Date().toISOString()

    const hasGuard = guard !== null && guard.value !== ZERO_ADDRESS

    // Tier 1: Untrusted guard detected
    if (hasGuard && !isTrustedGuard(guard.name, chainId, guard.value)) {
      const score = 30
      const guardLabel = guard.name || guard.value
      return {
        status: 'issue',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          { label: translateMessage('ui.guard_4c67c700'), value: guardLabel },
          {
            label: translateMessage('ui.status_8042eaf1'),
            value: translateMessage('ui.unverifiedGuardContract_e310e8ab'),
          },
        ],
        remediation: translateMessage('ui.aTransactionGuardIsSetBut_50c26d91'),
        lastChecked: now,
        ctaLabelOverride: translateMessage('ui.reviewModules_3f4d09d9'),
      }
    }

    // Tier 2: Known trusted guard
    if (hasGuard && isTrustedGuard(guard.name, chainId, guard.value)) {
      const score = 100
      const isHypernative = nameSuggestsHypernativeGuard(guard.name)
      return {
        status: 'clear',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          { label: translateMessage('ui.guard_4c67c700'), value: guard.name ?? 'Trusted Guard' },
          { label: translateMessage('ui.status_8042eaf1'), value: translateMessage('ui.activeProtection_9cfb9c49') },
        ],
        remediation: '',
        lastChecked: now,
        ...(isHypernative ? { partner: 'hypernative' as const } : {}),
      }
    }

    // Tier 3: No guard, high-value Safe on a chain that supports enterprise-grade protection
    if (!hasGuard && chainSupportsHypernative && ctx.balanceUsd > HIGH_VALUE_THRESHOLD_USD) {
      const score = 60
      return {
        status: 'partial',
        severity: getSeverityFromScore(score),
        score,
        evidence: [
          {
            label: translateMessage('ui.status_8042eaf1'),
            value: translateMessage('ui.noTransactionGuardConfigured_f6ccc39e'),
          },
        ],
        remediation: translateMessage('ui.forHighValueAccountsATransaction_42ef08e7'),
        lastChecked: now,
        ctaLabelOverride: translateMessage('ui.setUpProtection_872d86ba'),
        partner: 'hypernative',
      }
    }

    // Tier 4: No guard — normal (low-value Safe or unsupported chain)
    const score = 100
    return {
      status: 'not_applicable',
      severity: getSeverityFromScore(score, { excluded: true }),
      score,
      evidence: [
        { label: translateMessage('ui.status_8042eaf1'), value: translateMessage('ui.noGuardRequired_c00ae2d7') },
      ],
      remediation: '',
      lastChecked: now,
    }
  },
}
