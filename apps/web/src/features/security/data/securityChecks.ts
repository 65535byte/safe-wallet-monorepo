import { translateMessage } from '@/i18n'
import { AppRoutes } from '@/config/routes'

export type CheckCategory = 'account' | 'user'

export type CheckDef = {
  id: string
  title: string
  shortDescription: string
  fixRoute: string
  ctaLabel: string
  category: CheckCategory
}

export const CHECK_DEFS: Record<string, CheckDef> = {
  account_setup: {
    id: 'account_setup',
    title: translateMessage('ui.accountSetup_dd3ef971'),
    shortDescription: translateMessage('ui.whetherTheSignerThresholdIsOptimal_f08448a5'),
    fixRoute: AppRoutes.settings.setup,
    ctaLabel: translateMessage('ui.reviewSetup_c4f40d46'),
    category: 'account',
  },
  contract_version: {
    id: 'contract_version',
    title: translateMessage('ui.contractVersion_861d78ca'),
    shortDescription: translateMessage('ui.whetherTheIsRunningTheLatest_1da96d05'),
    fixRoute: AppRoutes.settings.setup,
    ctaLabel: translateMessage('ui.update_5cb0e4fd'),
    category: 'account',
  },
  multichain_setup: {
    id: 'multichain_setup',
    title: translateMessage('ui.multichainSetup_eb119852'),
    shortDescription: translateMessage('ui.whetherSignersAreConsistentAcrossAll_4819d1d4'),
    fixRoute: AppRoutes.settings.setup,
    ctaLabel: translateMessage('ui.reviewSigners_aae08736'),
    category: 'account',
  },
  modules: {
    id: 'modules',
    title: translateMessage('ui.modulesExtensions_db68278b'),
    shortDescription: translateMessage('ui.installedModulesAndWhetherTheyIntroduce_dfd26c2d'),
    fixRoute: AppRoutes.settings.modules,
    ctaLabel: translateMessage('ui.reviewModules_3f4d09d9'),
    category: 'account',
  },
  guard: {
    id: 'guard',
    title: translateMessage('ui.transactionGuard_57b094f9'),
    shortDescription: translateMessage('ui.whetherATransactionGuardIsEnabled_a46c83cc'),
    fixRoute: AppRoutes.settings.security,
    ctaLabel: translateMessage('ui.learnMore_0c11daba'),
    category: 'account',
  },
  pending_tx: {
    id: 'pending_tx',
    title: translateMessage('ui.pendingTransactions_1f1c0333'),
    shortDescription: translateMessage('ui.unexecutedTransactionsThatMayNeedReview_483f1eec'),
    fixRoute: AppRoutes.transactions.queue,
    ctaLabel: translateMessage('ui.reviewQueue_55c0e9cf'),
    category: 'account',
  },
  // token_approvals: {
  //   id: 'token_approvals',
  //   title: 'Token approvals',
  //   shortDescription: 'Active token approvals that grant spending access to other contracts.',
  //   fixRoute: AppRoutes.balances.index,
  //   ctaLabel: 'Review approvals',
  //   category: 'account',
  // },
  transaction_scanning: {
    id: 'transaction_scanning',
    title: translateMessage('ui.transactionScanning_45fd575f'),
    shortDescription: translateMessage('ui.whetherTransactionsAreScannedForMalicious_be959047'),
    fixRoute: AppRoutes.settings.security,
    ctaLabel: translateMessage('ui.learnMore_0c11daba'),
    category: 'account',
  },
  factory_validation: {
    id: 'factory_validation',
    title: translateMessage('ui.deploymentOrigin_2f6275f6'),
    shortDescription: translateMessage('ui.whetherThisWasDeployedViaAn_98f893b0'),
    fixRoute: AppRoutes.settings.setup,
    ctaLabel: translateMessage('ui.viewDetails_b34027e8'),
    category: 'account',
  },
  fallback_handler: {
    id: 'fallback_handler',
    title: translateMessage('ui.fallbackHandler_f0282998'),
    shortDescription: translateMessage('ui.whetherTheFallbackHandlerIsA_df9b9244'),
    fixRoute: AppRoutes.settings.modules,
    ctaLabel: translateMessage('ui.reviewHandler_1929b3f7'),
    category: 'account',
  },
  recovery: {
    id: 'recovery',
    title: translateMessage('ui.recoverySetup_9e1d8eec'),
    shortDescription: translateMessage('ui.whetherARecoveryMechanismIsConfigured_8336ea8b'),
    fixRoute: AppRoutes.settings.security,
    ctaLabel: translateMessage('ui.setUpRecovery_480572ee'),
    category: 'account',
  },
  // address_book: {
  //   id: 'address_book',
  //   title: 'Address book',
  //   shortDescription: 'Whether contacts are curated to help prevent address poisoning attacks.',
  //   fixRoute: AppRoutes.spaces.addressBook,
  //   ctaLabel: 'Manage contacts',
  //   category: 'user',
  // },
  // trusted_safe: {
  //   id: 'trusted_safe',
  //   title: 'Trusted list',
  //   shortDescription: 'Whether this Safe is marked as trusted to prevent impersonation.',
  //   fixRoute: AppRoutes.settings.setup,
  //   ctaLabel: 'Review settings',
  //   category: 'user',
  // },
}
