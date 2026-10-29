# 8379 多签 Web

独立 React + Vite + TypeScript 工程，按 `safe-wallet-monorepo/apps/web` 的实际账户页、GetStartedCard、Topbar、页签、设置区块和弹窗结构适配；使用同一份蓝色品牌图标、本地 DM Sans 字体和主题尺寸。仅包含钱包与 Safe 多签功能，不接入 Swap、Earn、Apps 或营销功能。

## 运行

建议 Node.js 22（`.nvmrc`）。

```sh
npm ci --legacy-peer-deps
npm run dev
npm test
npm run build
```


## 与 Flutter 的接口边界

`src/app-config.ts` 沿用 `WalletChainService` 的 `/blockmesh/v1/chain/list` 和 `/token/list` 字段约定。设置页可按需同步 App 代币元数据；余额始终从链上获取。首版内置 BNB Testnet、Sepolia、Ethereum、Base、Arbitrum 网络，未自动扩展到配置中心的所有网络。

设置页可读取 `https://msw.dplife.org/api/config/safe` 的当前链 `api_url`，或手动指定多签服务。此读取需要服务端允许 Web CORS；没有擅自复制 App 的认证凭据。若服务需要认证或不支持跨域，应部署同源 BFF。

`SafeTransactionApi` 保留 Flutter 的接口规则：

| 操作                  | 路径                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| 无签名提案，带 sender | `POST /api/v2/safes/{safe}/multisig-transactions/`                                                        |
| 分页待签列表          | `GET /api/v2/safes/{safe}/multisig-transactions/?trusted=false&nonce__gte={链上nonce}&limit=200&offset=…` |
| 完整交易详情          | `GET /api/v2/multisig-transactions/{safeTxHash}/`                                                         |
| 追加签名              | `POST /api/v1/multisig-transactions/{safeTxHash}/confirmations/`                                          |





## Current history source and fetch policy

History follows Flutter WalletAccountService.getTransactionList at https://pretxs-hk.mytokenpocket.vip/v1/transaction_action/universal_list. Parameters: new_way=tp, page=0 (zero based), count=50, ret_icon=1, ns=ethereum, chain_id, address, type=0, lang=zh-Hans. Entering History fetches one page once. No interval, focus/reconnect refetch, automatic retry, or RPC scan fallback is enabled. Re-entering the tab fetches again; manual refresh and pagination remain available. A coming-soon response without a data array is reported as unavailable rather than an empty history. This policy supersedes earlier RPC history implementation notes.
