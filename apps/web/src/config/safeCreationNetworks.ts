import type { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'

export const BNB_TEST_RPC = {
  http: 'https://bsc-testnet-rpc.publicnode.com',
  webSocket: 'wss://bsc-testnet-rpc.publicnode.com',
}

export const SAFE_CREATION_NETWORKS: Chain[] = [
  {
    chainId: '97',
    chainName: 'bnb-test',
    shortName: 'bnbt',
    description: 'BNB Smart Chain Testnet',
    l2: true,
    isTestnet: true,
    zk: false,
    nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18, logoUri: '' },
    transactionService: '',
    blockExplorerUriTemplate: {
      address: 'https://testnet.bscscan.com/address/{{address}}',
      txHash: 'https://testnet.bscscan.com/tx/{{txHash}}',
      api: '',
    },
    beaconChainExplorerUriTemplate: {},
    disabledWallets: [],
    balancesProvider: { chainName: null, enabled: false },
    features: [],
    gasPrice: [],
    rpcUri: { authentication: 'NO_AUTHENTICATION', value: BNB_TEST_RPC.http },
    publicRpcUri: { authentication: 'NO_AUTHENTICATION', value: BNB_TEST_RPC.http },
    safeAppsRpcUri: { authentication: 'NO_AUTHENTICATION', value: BNB_TEST_RPC.http },
    theme: { backgroundColor: 'var(--background)', textColor: 'var(--foreground)' },
    recommendedMasterCopyVersion: '1.4.1',
    relayer: null,
  },
]
