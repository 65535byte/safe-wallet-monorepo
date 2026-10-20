import { translateMessage } from '@/i18n'
import {
  ArrowRightLeft,
  WalletCards,
  BookUser,
  UsersRound,
  Settings,
  Wallet,
  Coins,
  LayoutGrid,
  Repeat2,
  Orbit,
  Database,
  TrendingUp,
  CircleHelp,
  ChevronLeft,
  PanelRight,
  EllipsisVertical,
  Shield,
  History,
  Landmark,
  ListChecks,
} from 'lucide-react'
import { AppRoutes } from '@/config/routes'
import type { SidebarItemConfig, SidebarGroupConfig } from '@safe-global/views/features/spaces/components/Sidebar/types'

export const spacesMainNavigation: SidebarItemConfig[] = [
  {
    icon: LayoutGrid,
    label: translateMessage('ui.dashboard_23212ed7'),
    href: AppRoutes.spaces.index,
  },
  // TODO: Activate when Spaces Transactions page is ready
  // {
  //   icon: ArrowRightLeft,
  //   label: 'Transactions',
  //   href: AppRoutes.spaces.transactions,
  // },
  {
    icon: WalletCards,
    label: translateMessage('ui.transactions_1f617a12'),
    href: AppRoutes.spaces.safeAccounts,
  },
  {
    icon: BookUser,
    label: translateMessage('ui.safeAccounts_d1a4cbfe'),
    href: AppRoutes.spaces.addressBook,
  },
  {
    icon: Landmark,
    label: translateMessage('ui.addressBook_640af984'),
    href: AppRoutes.spaces.policies,
    activeMemberOnly: true,
  },
  {
    icon: History,
    label: translateMessage('ui.policies_4fbf625d'),
    href: AppRoutes.spaces.activity,
    activeMemberOnly: true,
  },
]

export const spacesSetupGroup: SidebarGroupConfig = {
  label: translateMessage('ui.setup_f8f16b30'),
  items: [
    {
      icon: UsersRound,
      label: translateMessage('ui.team_00a31af8'),
      href: AppRoutes.spaces.members,
    },
    {
      icon: Shield,
      label: translateMessage('ui.securityHub_84cc8bb0'),
      href: AppRoutes.spaces.security,
      activeMemberOnly: true,
    },
    {
      icon: Settings,
      label: translateMessage('ui.settings_36b502ac'),
      href: AppRoutes.spaces.settings,
      activeMemberOnly: true,
    },
    {
      icon: ListChecks,
      label: translateMessage('ui.plans_9fadee1c'),
      href: AppRoutes.spaces.plans,
    },
  ],
}

export const safeMainNavigation: SidebarItemConfig[] = [
  {
    icon: Wallet,
    label: translateMessage('ui.overview_bf1fed7e'),
    href: AppRoutes.home,
  },
  {
    icon: Coins,
    label: translateMessage('ui.assets_42b9f464'),
    href: AppRoutes.balances.index,
  },
  {
    icon: ArrowRightLeft,
    label: translateMessage('ui.transactions_50e8fab5'),
    href: AppRoutes.transactions.history,
  },
  {
    icon: BookUser,
    label: translateMessage('ui.addressBook_84131c25'),
    href: AppRoutes.addressBook,
  },
  {
    icon: LayoutGrid,
    label: translateMessage('ui.apps_efe4f96d'),
    href: AppRoutes.apps.index,
  },
]

export const safeDefiGroup: SidebarGroupConfig = {
  label: 'DeFi',
  items: [
    {
      icon: Repeat2,
      label: translateMessage('ui.swap_cd9c7167'),
      href: AppRoutes.swap,
    },
    {
      icon: Orbit,
      label: translateMessage('ui.bridge_e7d367f4'),
      href: AppRoutes.bridge,
    },
    {
      icon: TrendingUp,
      label: translateMessage('ui.earn_2e740029'),
      href: AppRoutes.earn,
    },
    {
      icon: Database,
      label: translateMessage('ui.stake_0e1cdece'),
      href: AppRoutes.stake,
    },
  ],
}

export const icons = {
  CircleHelp,
  ChevronLeft,
  PanelRight,
  EllipsisVertical,
}
