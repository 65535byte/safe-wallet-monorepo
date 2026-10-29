
# 8379 钱包 DApp 接入指南

---

## 一、概述

8379 钱包是一款支持 EVM 生态的去中心化 Web3 钱包，完全兼容 MetaMask Provider 标准（EIP-1193）。

如果您的 DApp 已支持：

* MetaMask
* 标准 `window.ethereum`
* EVM JSON-RPC 接口

则：

* ✅ 无需任何代码修改
* ✅ 可直接在 8379 App 内置 DApp 浏览器中运行
* ✅ 自动支持签名、交易与网络切换

---

## 二、兼容标准

8379 钱包实现并兼容以下规范：

* EIP-1193 Provider 标准
* EIP-155 链 ID 规范
* EIP-712 结构化签名
* EIP-3085 添加链规范
* EIP-3326 切换链规范

注入对象：

```javascript
window.ethereum
```

---

## 三、支持网络

8379 钱包支持所有 EVM 兼容网络，包括但不限于：

* Ethereum
* BNB Smart Chain

---

## 四、接入方式

### 4.1 注入式 Provider（推荐）

8379 钱包在 App 内置浏览器中自动注入：

```javascript
window.ethereum
```

DApp 无需安装 SDK，无需额外配置。

---

## 五、标准接入流程

### 第一步：请求连接钱包

```javascript
const accounts = await window.ethereum.request({
  method: 'eth_requestAccounts'
});

const address = accounts[0];
```

用户将在 8379 钱包中看到授权弹窗，确认后返回地址。

---

### 第二步：获取当前网络

```javascript
const chainId = await window.ethereum.request({
  method: 'eth_chainId'
});
```

---

## 六、交易与签名

### 6.1 发起交易

```javascript
await window.ethereum.request({
  method: 'eth_sendTransaction',
  params: [{
    from: address,
    to: '0x接收地址',
    value: '0x金额(16进制)'
  }]
});
```

钱包将弹出交易确认页面，展示 Gas 费用与交易详情。

---

### 6.2 消息签名（登录场景）

```javascript
await window.ethereum.request({
  method: 'personal_sign',
  params: [
    '请签名以完成登录',
    address
  ]
});
```

---

### 6.3 EIP-712 结构化签名

```javascript
await window.ethereum.request({
  method: 'eth_signTypedData_v4',
  params: [address, JSON.stringify(data)]
});
```

---

## 七、移动端说明

8379 App 内置 DApp 浏览器。

已支持 MetaMask 的 DApp：

> 可直接在 8379 App 内打开运行
> 无需接入 WalletConnect
> 无需 SDK

---

## 十、安全机制

8379 钱包遵循以下安全策略：

* 所有交易必须用户确认
* 所有签名必须用户确认
* 显示完整交易数据与 Gas 费用
* 支持 EIP-712 安全签名

---

## 十一、快速对接总结

如果您的 DApp 已支持 MetaMask：

Metamask 官方有一个示例DAPP <https://github.com/MetaMask/test-dapp>

* 已自动支持 8379 钱包
* 无需修改代码
* 无需额外开发
