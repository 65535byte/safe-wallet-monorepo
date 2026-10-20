import { translateMessage } from '@safe-global/views/i18n'
import type { LinkProps } from 'next/link'

export const dashboardBannerConfig = {
  title: translateMessage('ui.enforceEnterpriseGradeSecurity_47eda011'),
  description: translateMessage('ui.automaticallyBlockRiskyTransactionsUsingAdvanced_c8f398ab'),
  ctaLabel: translateMessage('ui.learnMore_0c11daba'),
  href: '#' as LinkProps['href'],
  tagLabel: translateMessage('ui.poweredByHypernative_dc5a1ed4'),
  badgeSrc: '/images/hypernative/guardian-badge.svg',
  badgeAlt: translateMessage('ui.guardianBadge_ddb92c27'),
} as const
