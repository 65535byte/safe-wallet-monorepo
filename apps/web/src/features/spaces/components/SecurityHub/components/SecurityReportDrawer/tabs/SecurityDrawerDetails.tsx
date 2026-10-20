import { translateMessage } from '@/i18n'
import { Fragment, type ReactElement, type ReactNode } from 'react'
import { Copy } from 'lucide-react'
import { shortenAddress } from '@safe-global/utils/utils/formatters'
import { formatCurrencyPrecise } from '@safe-global/utils/utils/formatNumber'
import Identicon from '@/components/common/Identicon'
import CopyTooltip from '@/components/common/CopyTooltip'
import { Separator } from '@safe-global/views/components/ui/separator'
import { Typography } from '@safe-global/views/components/ui/typography'
import { useChain } from '@/hooks/useChains'
import { useLoadFeature } from '@/features/__core__'
import { SecurityFeature } from '@/features/security'
import type { ScanContext } from '@/features/security/types'
import { cn } from '@safe-global/views/utils/cn'

type SecurityDrawerDetailsProps = {
  scanContext: ScanContext | null
  /** Epoch ms of the last scan, surfaced as a relative "Last scanned" time. */
  lastScannedAt: number | null
}

const SectionLabel = ({ children, className }: { children: ReactNode; className?: string }): ReactElement => (
  <Typography variant="paragraph-mini" color="muted" className={cn('mb-1 block', className)}>
    {children}
  </Typography>
)

const DetailRow = ({ label, value }: { label: string; value: ReactNode }): ReactElement => (
  <div className="flex items-center px-4 justify-between py-2.5">
    <Typography variant="paragraph-mini" color="muted">
      {label}
    </Typography>
    <Typography variant="paragraph-mini">{value}</Typography>
  </div>
)

/** "Details" tab — the Safe's signers and high-level account facts. */
const SecurityDrawerDetails = ({ scanContext, lastScannedAt }: SecurityDrawerDetailsProps): ReactElement | null => {
  const security = useLoadFeature(SecurityFeature)
  const chain = useChain(scanContext?.chainId ?? '')

  if (!scanContext) return null

  const { owners, threshold, version, balanceUsd } = scanContext

  const aboutRows: { label: string; value: ReactNode }[] = [
    { label: translateMessage('ui.contractVersion_861d78ca'), value: version ? `v${version}` : '—' },
    { label: translateMessage('ui.networks_e4d25fbc'), value: chain?.chainName ?? '—' },
    { label: translateMessage('ui.balance_413e035a'), value: formatCurrencyPrecise(balanceUsd, 'USD') },
    {
      label: translateMessage('ui.lastScanned_6c58f3d7'),
      value: security.$isReady ? security.formatTimestamp(lastScannedAt ?? undefined) : '—',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-card p-4 rounded-xl">
        <SectionLabel>{translateMessage('ui.signers_d40ae0cd', { p0: threshold, p1: owners.length })}</SectionLabel>
        <div className="flex flex-col">
          {owners.map((owner) => (
            <div key={owner.value} className="flex items-center gap-3 py-2.5">
              <Identicon address={owner.value} size={24} />
              <Typography variant="paragraph-mini" className="min-w-0 flex-1 truncate" title={owner.value}>
                {owner.name || shortenAddress(owner.value)}
              </Typography>
              <CopyTooltip text={owner.value}>
                <span
                  aria-label={translateMessage('ui.copyAddress_e5bff417')}
                  className="flex cursor-pointer items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Copy className="h-3 w-3" />
                </span>
              </CopyTooltip>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-card py-4 rounded-xl">
        <SectionLabel className="px-4">{translateMessage('ui.about_c22e87cd')}</SectionLabel>
        <Separator className="bg-muted" />
        <div className="flex flex-col">
          {aboutRows.map((row, idx) => (
            <Fragment key={row.label}>
              {idx > 0 && <Separator className="bg-muted" />}
              <DetailRow label={row.label} value={row.value} />
            </Fragment>
          ))}
        </div>
      </section>
    </div>
  )
}

export default SecurityDrawerDetails
