import { translateMessage } from '@/i18n'
import type { ReactElement } from 'react'
import { AppRoutes } from '@/config/routes'

export type NavItem = {
  label: string
  icon?: ReactElement
  href: string
  tag?: ReactElement
  disabled?: boolean
  externalUrl?: string
}

export const transactionNavItems = [
  { label: translateMessage('ui.queue_2db795b3'), href: AppRoutes.transactions.queue },
  { label: translateMessage('ui.history_59a644a1'), href: AppRoutes.transactions.history },
  { label: translateMessage('ui.messages_1c591068'), href: AppRoutes.transactions.messages },
]

export const balancesNavItems = [
  { label: translateMessage('ui.tokens_e66110d1'), href: AppRoutes.balances.index },
  { label: translateMessage('ui.positions_9f380dbc'), href: AppRoutes.balances.positions },
  { label: 'NFT', href: AppRoutes.balances.nfts },
]

export const settingsNavItems = [
  { label: translateMessage('ui.setup_f8f16b30'), href: AppRoutes.settings.setup },
  { label: translateMessage('ui.appearance_cab005b3'), href: AppRoutes.settings.appearance },
  { label: translateMessage('ui.security_a4dd2249'), href: AppRoutes.settings.security },
  { label: translateMessage('ui.notifications_e0d1fbb4'), href: AppRoutes.settings.notifications },
  { label: translateMessage('ui.modules_970ad31c'), href: AppRoutes.settings.modules },
  { label: translateMessage('ui.safeApps_234a7c1c'), href: AppRoutes.settings.safeApps.index },
  { label: translateMessage('ui.data_e932c3b4'), href: AppRoutes.settings.data },
  { label: translateMessage('ui.environmentVariables_333cec70'), href: AppRoutes.settings.environmentVariables },
]

export const generalSettingsNavItems = [
  { label: 'Cookie', href: AppRoutes.settings.cookies },
  { label: translateMessage('ui.appearance_cab005b3'), href: AppRoutes.settings.appearance },
  { label: translateMessage('ui.notifications_e0d1fbb4'), href: AppRoutes.settings.notifications },
  { label: translateMessage('ui.security_a4dd2249'), href: AppRoutes.settings.security },
  { label: translateMessage('ui.data_e932c3b4'), href: AppRoutes.settings.data },
  { label: translateMessage('ui.environmentVariables_333cec70'), href: AppRoutes.settings.environmentVariables },
]

export const safeAppsNavItems = [
  { label: translateMessage('ui.allApps_7ff52c5c'), href: AppRoutes.apps.index },
  { label: translateMessage('ui.myCustomApps_ab32e815'), href: AppRoutes.apps.custom },
]
