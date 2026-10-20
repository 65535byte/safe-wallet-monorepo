import { translateMessage } from '@safe-global/views/i18n'
export const hnActivatedSettingsBannerConfig = {
  title: 'Hypernative Guardian',
  description: translateMessage('ui.automaticallyMonitorAndBlockRiskyTransactions_fad53048'),
  statusLabel: translateMessage('ui.active_889c3246'),
  buttonLabel: translateMessage('ui.viewOnHypernative_27baf299'),
  // Dummy URL for now
  dashboardUrl: 'https://app.hypernative.xyz/guardian',
} as const
