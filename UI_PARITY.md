# Safe Web UI 对照

本工程沿用独立 Vite 运行时和链上查询服务，页面结构按参考工程实际组件适配。

| 页面 / 区域 | 参考来源 | 本工程 |
| --- | --- | --- |
| 未连接入口 | `MyAccountsV2/components/GetStartedCard`、`AccountsNavigation` | `src/features/accounts/AccountsPage.tsx` |
| 已连接账户列表 | `MyAccounts`、`AccountListFilters`、`AccountsHeader` | `src/features/accounts/AccountsPage.tsx` |
| 顶栏 | `Header/Topbar`、`SafeLogo`、`SpaceSafeBar` | `src/ui/Topbar.tsx` |
| 数据导入 | `myAccounts/components/DataWidget`、`DataManagement` | `AccountsPage.tsx`、`import-data.ts` |
| 钱包侧栏 | `spaces/components/Sidebar/variants/SafeSidebarVariant` | `src/App.tsx` 的钱包布局 |
| 资产 / 交易页签 | `AssetsHeader`、`TxHeader`、`PageHeader`、`NavTabs` | `src/App.tsx` 的共享页签 |
| 签名者 / 阈值 | `pages/settings/setup`、`owner/OwnerList`、`RequiredConfirmations` | `src/features/accounts/OwnersPage.tsx` |
| 添加 / 创建账户 | `components/new-safe/load`、`components/new-safe/create` | 全页步骤布局及 `CreateSafePage.tsx` |
| 字体 / 品牌 | `public/fonts/DMSans*.woff2`、`public/images/brand-logo.png` | 同源文件直接复用 |
| 颜色 / 尺寸 | `styles/shadcn.css`、`Typography`、`Button`、`overlay` | `src/style.css` |

视觉验证：

- 1482 × 777：未连接入口，440px 卡片，24px 标题，40px 品牌图标，48px 连接按钮。
- 1459 × 734：已连接空账户列表，992px 主区，48px 标题，搜索、排序、添加及创建按钮。
- 资产、队列、详情 / 签名弹窗、成员、环境变量、历史查询、添加账户、创建账户表单已在浏览器逐页检查。
- 390px：钱包侧栏抽屉展开 / 导航收起，资产及历史页无横向溢出，转账弹窗可操作。
- 模拟 RPC / API 用于内部页面数据状态，已从预览浏览器移除测试账户并恢复默认网络。

验证结果：21 项单元测试通过，TypeScript 与生产构建通过。真实钱包签名、Safe 创建部署和执行交易未在此轮广播。

范围差异：保留用户限定的钱包 / 多签功能；参考工程的 NFT、Swap、Earn、工作空间、营销和支持组件未迁入。原生币 / ERC20 余额和执行记录继续从 RPC 读取，不为复制 UI 引入价格或索引 API。

记录查询更新：历史页改为自动从链上读取、分页、回执详情，并在 nonce 推进后重新查询。待签列表自动读取 Flutter 配置并同步提案；36 项测试和生产构建通过。`preview-records.jpg` 为本地模拟 RPC 的功能验证截图。
