import { getLanguage } from '@/i18n'
import { translateMessage } from '@/i18n'
import Onboard, { type OnboardAPI } from '@web3-onboard/core'
import type { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import { getAllWallets } from '@/hooks/wallets/wallets'
import { getRpcServiceUrl } from '@/hooks/wallets/web3'
import { numberToHex } from '@/utils/hex'
import { BRAND_NAME } from '@/config/constants'
import { onboardZhCN } from './onboard/zhCN'
import type { EnvState } from '@safe-global/store/settingsSlice'

let onboard: OnboardAPI | null = null

export const createOnboard = (
  chainConfigs: Chain[],
  currentChain: Chain,
  rpcConfig: EnvState['rpc'] | undefined,
): OnboardAPI => {
  if (onboard) return onboard

  const wallets = getAllWallets(currentChain)

  const chains = chainConfigs.map((cfg) => ({
    // We cannot use ethers' toBeHex here as we do not want to pad it to an even number of characters.
    id: numberToHex(parseInt(cfg.chainId)),
    label: cfg.chainName,
    rpcUrl: rpcConfig?.[cfg.chainId] || getRpcServiceUrl(cfg.rpcUri as any),
    token: cfg.nativeCurrency.symbol,
    color: cfg.theme.backgroundColor,
    publicRpcUrl: cfg.publicRpcUri.value,
    blockExplorerUrl: new URL(cfg.blockExplorerUriTemplate.address).origin,
  }))

  onboard = Onboard({
    wallets,
    i18n: getLanguage() === 'en' ? undefined : { en: onboardZhCN, zh: onboardZhCN, 'zh-CN': onboardZhCN },

    chains,

    accountCenter: {
      mobile: { enabled: false },
      desktop: { enabled: false },
    },

    notify: {
      enabled: false,
    },

    appMetadata: {
      name: BRAND_NAME,
      icon: location.origin + '/images/brand-logo.png',
      description: translateMessage('ui.smartContractWalletForEthereumEx_edba0ac0', { p0: BRAND_NAME }),
    },

    connect: {
      removeWhereIsMyWalletWarning: true,
      autoConnectLastWallet: false,
    },
  })

  return onboard
}
