import { render, screen } from '@/tests/test-utils'
import { AppRoutes } from '@/config/routes'
import type { SecurityContract } from '@/features/security'
import type { ScanResult } from '@/features/security/types'
import { EvidenceList, makeBuildCta } from '../primitives'

const ADDRESS = '0x1234567890AbcdEF1234567890aBcdef12345678'

describe('EvidenceList', () => {
  it('shortens an address value and renders a copy button', () => {
    // WA-2371: every address-typed evidence value renders the same way —
    // shortened (0xabcd…1234) with a copy button next to it.
    render(<EvidenceList evidence={[{ label: '工厂合约', value: ADDRESS }]} />)

    // shortenAddress => first 6 chars + '...' + last 4
    expect(screen.getByText('0x1234...5678')).toBeInTheDocument()
    expect(screen.queryByText(ADDRESS)).not.toBeInTheDocument()
    expect(screen.getByTestId('copy-btn-icon')).toBeInTheDocument()
  })

  it('renders a non-address value as plain text without a copy button', () => {
    render(<EvidenceList evidence={[{ label: '状态', value: 'Official Safe factory' }]} />)

    expect(screen.getByText('官方 8379 工厂合约')).toBeInTheDocument()
    expect(screen.queryByTestId('copy-btn-icon')).not.toBeInTheDocument()
  })

  it('renders each address field consistently across multiple evidence items', () => {
    const other = '0xa6B71E26C5e0845f74c812102Ca7114b6a896AB2'
    render(
      <EvidenceList
        evidence={[
          { label: '工厂合约', value: ADDRESS },
          { label: '实现合约', value: other },
        ]}
      />,
    )

    expect(screen.getByText('0x1234...5678')).toBeInTheDocument()
    expect(screen.getByText('0xa6B7...6AB2')).toBeInTheDocument()
    expect(screen.getAllByTestId('copy-btn-icon')).toHaveLength(2)
  })
})

describe('makeBuildCta', () => {
  const checkDefs: SecurityContract['checkDefs'] = {
    contract_version: {
      id: 'contract_version',
      title: '合约版本',
      shortDescription: '',
      fixRoute: AppRoutes.settings.setup,
      ctaLabel: '更新',
      category: 'account',
    },
  }
  const buildCta = makeBuildCta(checkDefs, null)
  const clear: ScanResult = {
    status: 'clear',
    severity: 'Low',
    score: 100,
    evidence: [],
    remediation: '',
    lastChecked: '2026-10-13T00:00:00Z',
  }

  it('returns no CTA for a passing check', () => {
    expect(buildCta('contract_version', clear, 'eth:0x1234')).toBeNull()
  })

  it('returns the fix CTA for a passing check with an upgrade available', () => {
    expect(buildCta('contract_version', { ...clear, upgradeAvailable: true }, 'eth:0x1234')).toEqual({
      label: '更新',
      href: `${AppRoutes.settings.setup}?safe=${encodeURIComponent('eth:0x1234')}`,
    })
  })
})
