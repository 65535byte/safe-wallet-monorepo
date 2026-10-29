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

打开 http://127.0.0.1:5173 。构建产物为 `dist/`，部署时将所有前端路径回退到 `index.html`；`public/_redirects` 提供静态托管示例。可从 `.env.example` 设置首次运行默认 RPC / 多签服务。

## 已实现

- 浏览器 / App 注入的 EIP-1193 Provider 连接、切链；仅用连接账户签名，不管理私钥或助记词。
- `/accounts` 包含未连接入口、已连接空列表、账户搜索 / 排序及数据备份导入；兼容原工程导出的 `addedSafes` / `addressBook` 切片。
- `/new-safe/create` 提供签名者 / 阈值设置、配置合约代码校验、部署费用估算和钱包确认部署；尚未完成真实测试网部署验收。
- 按地址导入已有 Safe；未连接账户也可查看。支持已验证的 Safe 1.3.0 / 1.4.1 交易域。
- 从 RPC 读取 owners、threshold、nonce、版本、原生币余额、ERC20 符号 / 精度 / 余额。
- 原生币、ERC20 转账提案；指定当前或未来 nonce；不以浮点数处理金额。
- 与当前 App 同步规则一致：每个 nonce 的远端提案只保留最新提交的一条，清理同 nonce 本机旧待处理记录，过滤低于链上 nonce 和已执行记录。
- 详情、签名进度、管理者签名、执行交易。Protocol Kit 生成 / 核对交易哈希和签名，Viem 负责链上读取、模拟、广播和回执确认。
- 执行前恢复并校验 EOA 签名、去重、排序、校验阈值和 nonce；模拟失败或 Safe 内部执行失败不显示成功。
- Flutter `multisig-sign` gzip + base64url 分享二维码、同格式 JSON 文件及携带同一分享包的 Web 链接。
The History tab now uses the App transaction-history API described below; it no longer starts automatic RPC log scans.
- 本机保存钱包、代币和提案；网络配置按 chainId 保留。

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

分享码、JSON 和链接统一使用 App 的 `{type:"multisig-sign",data:"..."}` 格式，data 为交易摘要 JSON → gzip → base64url，不包含签名或 Web 完整交易对象。新链接在 `/transactions#share=...` 携带同一分享包，是 Web 打开入口，未新增 App URL scheme。完整交易和签名仍从同一多签服务取回并重新校验；旧版 Web 完整交易 JSON 和定位链接保留兼容读取。

## 验证与限制

单元测试覆盖 nonce 筛选、跨链域隔离、Protocol Kit / Viem 哈希一致性、大整数、EIP-712 / eth_sign 恢复、签名去重、非 owner 拦截、v1/v2 接口、App 分享格式。SafeTxHash 一致性当前验证的是两套 TypeScript 实现；分享编解码已使用实际 Dart GZipCodec/base64Url 与 Web CompressionStream 双向验证，Dart 分享样例保存在 `src/fixtures/flutter-multisig-share.json`。

本地 UI 验证可运行 `npm run mock:services`，在设置中填 RPC `http://127.0.0.1:4174/rpc`、多签服务 `http://127.0.0.1:4174`，导入 `0x1111111111111111111111111111111111111111`。此服务全部为测试数据，不能广播交易；`preview-desktop.jpg` 是这组模拟数据的页面截图。

真实测试网闭环仍需提供 Safe 地址、两个管理者的钱包以及允许浏览器访问的同步服务，手动完成 Web 提案 → App 签名 → Web 执行，并核对两端状态。没有声称已完成这项验收。

当前不包含 owner 增删 / 阈值修改提案、WalletConnect、合约 owner / EIP-1271 签名、资产价格 API、完整入账 / 内部调用索引或全链历史自动扫描。现阶段覆盖用户限定的钱包、转账、多签签名、管理者展示、多签记录及执行历史流程。Safe 创建使用配置中心下发的 factory / singleton / handler，自定义部署仍需测试网验证。

## UI 对照与本地验证

- 截图 1 对应：`src/features/accounts/AccountsPage.tsx` 的已连接账户列表状态。
- 截图 2 对应：同一组件的未连接 `GetStartedCard` 状态。
- `src/ui/Topbar.tsx` 使用参考项目的工具栏布局，账户页面不显示钱包侧栏；选择账户后才显示钱包导航。
- `src/features/accounts/OwnersPage.tsx` 对应 `settings/setup` 的 Nonce、合约版本、成员和确认阈值区块。
- `src/style.css` 统一字体、颜色、间距、按钮、卡片、页签、表格、移动端抽屉和弹窗。参考资产及许可证见 `THIRD_PARTY_NOTICES.md`。
- 开发预览夹具 `/tests/visual/index.html?state=connected` 只用测试数据检查截图 1 的状态，不会被打包到 `dist/`。
- 36 项测试覆盖原有多签规则、账户页面状态、Safe Web 备份文件、提案同步及链上事件查询；真实的钱包连接、签名、部署、执行需要额外测试网验收。

## 多签记录查询修复

进入钱包后会自动读取 Flutter `SafeConfigApi` 的链级 `api_url`（显式设置优先），并缓存最后一次有效配置。待签列表沿用 `MultisigTxManager.syncPendingTransactions`：按 `trusted=false`、`nonce__gte`、`limit=200` 分页读取；每个 nonce 选择最新提交提案并校验交易域和 owner。全部分页成功后一次合并缓存，清理已越过的 nonce，以及有效替代提案对应的旧待处理行；无替代数据或校验失败的 nonce 保留本机记录。任意合约调用也保留在队列。

The History tab now uses the App transaction-history API described below; it no longer starts automatic RPC log scans.

2026-10-22 已接入新配置中心 `https://msw.dplife.org/api/config/safe`，链 97、56、8379 分别使用 `msw-bsc-test.dplife.org`、`msw-bsc.dplife.org`、`msw-fusn.dplife.org`。配置中心目前缺少 CORS 响应头，因此远程读取失败时使用随工程发布的 `safe-config.snapshot.json`（来自用户提供的 safe.json）；更新备用配置需要重新构建。创建账户和交易同步共用此配置。旧域名的浏览器缓存配置会自动清除；手动配置其他服务仍优先。多签服务允许浏览器跨域访问，已执行记录继续从链上读取。

创建页网络采用单选，候选链仅来自 Safe 配置中心返回的 `evm_<chainId>`，不会补入其他本地链。配置加载失败时阻止下一步并允许重试。链 8379 的名称、RPC、原生币及浏览器信息来自 App 链配置；它是否可创建仍由 Safe 配置中心决定。开发服务器通过 Vite 同源代理 `/api/config/safe` 访问配置中心。生产站点如仍遇配置中心 CORS 限制，使用 `deploy/safe-config.nginx.conf` 配置同源代理，并设置 `VITE_SAFE_CONFIG_URL=/api/config/safe` 后构建。

## 国际化

Web 支持简体中文和英文，右上角语言菜单切换，未保存手动选择时跟随系统语言，中文显示中文，其余或无法识别时默认英文。沿用参考 Safe 项目的 `8379.language` 存储键，切换后刷新当前页面；交易与部署处理中禁止切换。页面、校验、消息提示和日期统一使用 `src/i18n`，两套语言资源及维护方式见 [国际化说明](src/i18n/README.md)。地址、金额、用户命名、交易哈希和 App 分享协议不随语言改变。

## App 内置浏览器签名

发起时选择“使用连接的管理者钱包签名并提交”，以及详情中的“管理者签名”，共用注入 Provider 的 EIP-712 签名流程：`eth_signTypedData_v4([owner, JSON.stringify(typedData)])`。这与 `drixone_client` 的 `signTypedMessage → EvmAddressWallet.signTypedData` 接口一致，也适用于 MetaMask。

合约读取和 Safe 哈希校验继续使用配置的 RPC 与 Protocol Kit；签名不再先通过钱包 Provider 初始化完整 SDK、查询部署合约。参数包含 EIP712Domain，uint256 以十进制字符串传递，签名前后核对账户和网络，恢复签名地址后才向多签服务提交。拒签或不支持 EIP-712 时停止，不自动改用其他签名方法。仅对 drixOneWallet 注入 Provider 的已知 BigInt 类型错误，兼容调用 `personal_sign(SafeTxHash)`，恢复并核对管理者地址后，将 v 转换为 Safe 的 31/32 标记；不对 MetaMask 或用户拒签启用此兼容处理。App 私钥仍由 App 钱包管理，不传到 Web。

单元测试以测试账户模拟 Provider，覆盖格式、大额精度、恢复地址、拒签、网络/账户切换及提案 API 携带签名；实际 App 签名弹窗仍需设备验证。

## 钱包连接恢复

页面挂载后通过 `eth_accounts` 静默读取已授权账户，前 10 秒检测 App 延迟注入的 Provider，并监听初始化、窗口恢复和钱包事件。`accountsChanged` 更新账户，`chainChanged` 重新读取账户，不再直接清空连接。恢复时不调用授权、切链或签名方法；钱包未授权或锁定时仍需手动连接。主动断开通过 `multisig.wallet.disconnected` 保存偏好，显式连接后才重新允许自动恢复。未把本地缓存地址当作授权凭据。



## Current history source and fetch policy

History follows Flutter WalletAccountService.getTransactionList at https://pretxs-hk.mytokenpocket.vip/v1/transaction_action/universal_list. Parameters: new_way=tp, page=0 (zero based), count=50, ret_icon=1, ns=ethereum, chain_id, address, type=0, lang=zh-Hans. Entering History fetches one page once. No interval, focus/reconnect refetch, automatic retry, or RPC scan fallback is enabled. Re-entering the tab fetches again; manual refresh and pagination remain available. A coming-soon response without a data array is reported as unavailable rather than an empty history. This policy supersedes earlier RPC history implementation notes.
