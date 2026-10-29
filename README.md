# 8379 多签 Web


## 运行

建议 Node.js 22（`.nvmrc`）。

```sh
npm ci --legacy-peer-deps
npm run dev
npm test
npm run build
```


## 与 Flutter 的接口边界

`SafeTransactionApi` 保留 Flutter 的接口规则：

| 操作                  | 路径                                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| 无签名提案，带 sender | `POST /api/v2/safes/{safe}/multisig-transactions/`                                                        |
| 分页待签列表          | `GET /api/v2/safes/{safe}/multisig-transactions/?trusted=false&nonce__gte={链上nonce}&limit=200&offset=…` |
| 完整交易详情          | `GET /api/v2/multisig-transactions/{safeTxHash}/`                                                         |
| 追加签名              | `POST /api/v1/multisig-transactions/{safeTxHash}/confirmations/`                                          |





## Current history source and fetch policy

History follows Flutter WalletAccountService.getTransactionList at https://pretxs-hk.mytokenpocket.vip/v1/transaction_action/universal_list. Parameters: new_way=tp, page=0 (zero based), count=50, ret_icon=1, ns=ethereum, chain_id, address, type=0, lang=zh-Hans. Entering History fetches one page once. No interval, focus/reconnect refetch, automatic retry, or RPC scan fallback is enabled. Re-entering the tab fetches again; manual refresh and pagination remain available. A coming-soon response without a data array is reported as unavailable rather than an empty history. This policy supersedes earlier RPC history implementation notes.
