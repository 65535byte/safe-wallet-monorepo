import type { ReactElement } from 'react'
import { faker } from '@faker-js/faker'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CircleX,
  Code,
  Database,
  GitMerge,
  Layers,
  Repeat,
  SendToBack,
  Settings,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { SettingsInfoType, TransactionInfoType } from '@safe-global/store/gateway/types'
import type {
  AddressInfo,
  CreationTransactionInfo,
  CustomTransactionInfo,
  MultiSendTransactionInfo,
  SettingsChangeTransaction,
  Transaction,
  TransferTransactionInfo,
} from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { TWAP_ORDER_TITLE } from '@/features/swap/constants'
import { getTransactionType } from '../useTransactionType'

const multiSendTxInfo: MultiSendTransactionInfo = {
  type: TransactionInfoType.CUSTOM,
  to: { value: faker.finance.ethereumAddress() },
  dataSize: '100',
  value: '0',
  isCancellation: false,
  methodName: 'multiSend',
  actionCount: 2,
}

const customTxInfo = (overrides: Partial<CustomTransactionInfo> = {}): CustomTransactionInfo => ({
  type: TransactionInfoType.CUSTOM,
  to: { value: faker.finance.ethereumAddress() },
  dataSize: '100',
  value: '0',
  isCancellation: false,
  ...overrides,
})

const creationTxInfo = (factory?: AddressInfo): CreationTransactionInfo => ({
  type: TransactionInfoType.CREATION,
  creator: { value: faker.finance.ethereumAddress() },
  transactionHash: faker.string.hexadecimal({ length: 64 }),
  factory,
})

const transferTxInfo = (direction: TransferTransactionInfo['direction']): TransferTransactionInfo => ({
  type: TransactionInfoType.TRANSFER,
  sender: { value: faker.finance.ethereumAddress() },
  recipient: { value: faker.finance.ethereumAddress() },
  direction,
  transferInfo: { type: 'NATIVE_COIN', value: '1000' },
})

const settingsChangeTxInfo = (
  method: string,
  settingsInfo: SettingsChangeTransaction['settingsInfo'],
): SettingsChangeTransaction => ({
  type: TransactionInfoType.SETTINGS_CHANGE,
  dataDecoded: { method },
  settingsInfo,
})

/** Types the SDK doesn't model yet (VaultDeposit, SwapAndBridge, …) only need their type tag here. */
const txInfoOfType = (type: string): Transaction['txInfo'] => ({ type }) as unknown as Transaction['txInfo']

const makeTx = (overrides: Partial<Transaction>): Transaction => ({
  txInfo: multiSendTxInfo,
  id: faker.string.uuid(),
  timestamp: 0,
  txStatus: 'SUCCESS',
  ...overrides,
})

/** The hook wraps every lucide icon in a local TxIcon component, so identity lives on `props.icon`. */
const iconProps = (icon: string | ReactElement) =>
  (icon as ReactElement<{ icon: LucideIcon; className?: string }>).props

describe('getTransactionType', () => {
  describe('icon per transaction type', () => {
    const mappings: { label: string; txInfo: Transaction['txInfo']; icon: LucideIcon; text: string }[] = [
      { label: 'Safe creation', txInfo: creationTxInfo(), icon: Settings, text: '8379 账户已创建' },
      {
        label: 'TWAP 订单',
        txInfo: txInfoOfType(TransactionInfoType.TWAP_ORDER),
        icon: Repeat,
        text: TWAP_ORDER_TITLE,
      },
      {
        label: 'staking deposit',
        txInfo: txInfoOfType(TransactionInfoType.NATIVE_STAKING_DEPOSIT),
        icon: Database,
        text: '质押',
      },
      {
        label: 'staking validators exit',
        txInfo: txInfoOfType(TransactionInfoType.NATIVE_STAKING_VALIDATORS_EXIT),
        icon: Database,
        text: '提取请求',
      },
      {
        label: 'staking withdraw',
        txInfo: txInfoOfType(TransactionInfoType.NATIVE_STAKING_WITHDRAW),
        icon: Database,
        text: '领取',
      },
      { label: 'vault deposit', txInfo: txInfoOfType('VaultDeposit'), icon: TrendingUp, text: '存入' },
      { label: 'vault redeem', txInfo: txInfoOfType('VaultRedeem'), icon: TrendingUp, text: '提取' },
      { label: 'bridge', txInfo: txInfoOfType('SwapAndBridge'), icon: SendToBack, text: '跨链桥' },
      { label: 'swap', txInfo: txInfoOfType('Swap'), icon: Repeat, text: '兑换' },
      { label: 'unknown type', txInfo: txInfoOfType('SomethingNew'), icon: Code, text: '合约交互' },
    ]

    it.each(mappings)('renders the right icon for a $label', ({ txInfo, icon, text }) => {
      const result = getTransactionType(makeTx({ txInfo }), {})

      expect(result.text).toBe(text)
      expect(iconProps(result.icon).icon).toBe(icon)
    })
  })

  describe('Transfers', () => {
    it('renders a red outgoing arrow for an executed send', () => {
      const result = getTransactionType(makeTx({ txInfo: transferTxInfo('OUTGOING') }), {})

      expect(result.text).toBe('已发送')
      expect(iconProps(result.icon).icon).toBe(ArrowUpRight)
      expect(iconProps(result.icon).className).toContain('text-destructive')
    })

    it('renders a green incoming arrow for a receipt', () => {
      const result = getTransactionType(makeTx({ txInfo: transferTxInfo('INCOMING') }), {})

      expect(result.text).toBe('已接收')
      expect(iconProps(result.icon).icon).toBe(ArrowDownLeft)
      expect(iconProps(result.icon).className).toContain('text-accent-success')
    })

    it('labels a queued outgoing transfer as Send', () => {
      const tx = makeTx({ txInfo: transferTxInfo('OUTGOING'), txStatus: 'AWAITING_CONFIRMATIONS' })

      const result = getTransactionType(tx, {})

      expect(result.text).toBe('发送')
      expect(iconProps(result.icon).icon).toBe(ArrowUpRight)
    })
  })

  describe('Settings change', () => {
    it('labels the row with the decoded method', () => {
      const txInfo = settingsChangeTxInfo('addOwnerWithThreshold', {
        type: SettingsInfoType.ADD_OWNER,
        owner: { value: faker.finance.ethereumAddress() },
        threshold: 2,
      })

      const result = getTransactionType(makeTx({ txInfo }), {})

      expect(result.text).toBe('addOwnerWithThreshold')
      expect(iconProps(result.icon).icon).toBe(Settings)
    })

    it('relabels setGuard as deleteGuard when the guard is removed', () => {
      const txInfo = settingsChangeTxInfo('setGuard', { type: SettingsInfoType.DELETE_GUARD })

      const result = getTransactionType(makeTx({ txInfo }), {})

      expect(result.text).toBe('deleteGuard')
      expect(iconProps(result.icon).icon).toBe(Settings)
    })
  })

  describe('Swap orders', () => {
    const swapOrderTxInfo = (orderClass?: string) =>
      ({
        type: TransactionInfoType.SWAP_ORDER,
        fullAppData: orderClass ? { metadata: { orderClass: { orderClass } } } : undefined,
      }) as unknown as Transaction['txInfo']

    it('renders Repeat for a market order', () => {
      const result = getTransactionType(makeTx({ txInfo: swapOrderTxInfo() }), {})

      expect(result.text).toBe('兑换订单')
      expect(iconProps(result.icon).icon).toBe(Repeat)
    })

    it('renders Repeat for a limit order', () => {
      const result = getTransactionType(makeTx({ txInfo: swapOrderTxInfo('limit') }), {})

      expect(result.text).toBe('限价订单')
      expect(iconProps(result.icon).icon).toBe(Repeat)
    })
  })

  describe('Safe App transaction', () => {
    it('shows the Safe App name and logo when safeAppInfo is present', () => {
      const logoUri = 'https://apps.safe.global/tx-builder/logo.svg'
      const tx = makeTx({
        safeAppInfo: { id: 1, name: '交易构建器', url: 'https://apps.safe.global/tx-builder', logoUri },
      })

      const result = getTransactionType(tx, {})

      expect(result.text).toBe('交易构建器')
      expect(result.icon).toBe(logoUri)
    })

    it('falls back to the Code icon when safeAppInfo has no logo', () => {
      const tx = makeTx({
        safeAppInfo: { id: 1, name: '交易构建器', url: 'https://apps.safe.global/tx-builder' },
      })

      const result = getTransactionType(tx, {})

      expect(result.text).toBe('交易构建器')
      expect(iconProps(result.icon).icon).toBe(Code)
    })
  })

  describe('Safe account creation', () => {
    it('prefers the factory logo over the Settings fallback', () => {
      const logoUri = faker.internet.url()
      const tx = makeTx({ txInfo: creationTxInfo({ value: faker.finance.ethereumAddress(), logoUri }) })

      const result = getTransactionType(tx, {})

      expect(result.icon).toBe(logoUri)
    })
  })

  describe('Custom transactions', () => {
    it('renders Layers for a multiSend batch', () => {
      const result = getTransactionType(makeTx({ safeAppInfo: null }), {})

      expect(result.text).toBe('批次')
      expect(iconProps(result.icon).icon).toBe(Layers)
    })

    it('renders a red CircleX for an on-chain rejection', () => {
      const txInfo = customTxInfo({ methodName: 'rejection', isCancellation: true })

      const result = getTransactionType(makeTx({ txInfo }), {})

      expect(result.text).toBe('链上拒绝')
      expect(iconProps(result.icon).icon).toBe(CircleX)
      expect(iconProps(result.icon).className).toContain('text-destructive')
    })

    it('renders GitMerge for a nested Safe confirmation', () => {
      const txInfo = customTxInfo({ methodName: 'execTransaction' })

      const result = getTransactionType(makeTx({ txInfo }), {})

      expect(result.text).toBe('嵌套 8379')
      expect(iconProps(result.icon).icon).toBe(GitMerge)
    })

    it('renders Code for a contract interaction with no logo', () => {
      const txInfo = customTxInfo({ methodName: 'someMethod' })

      const result = getTransactionType(makeTx({ txInfo }), {})

      expect(result.text).toBe('合约交互')
      expect(iconProps(result.icon).icon).toBe(Code)
    })

    it('prefers the contract logo over the Code fallback', () => {
      const logoUri = faker.internet.url()
      const txInfo = customTxInfo({
        methodName: 'someMethod',
        to: { value: faker.finance.ethereumAddress(), name: 'AllowanceModule', logoUri },
      })

      const result = getTransactionType(makeTx({ txInfo }), {})

      expect(result.text).toBe('AllowanceModule')
      expect(result.icon).toBe(logoUri)
    })

    it('renders Code for a module execution with no logo', () => {
      const tx = makeTx({
        txInfo: customTxInfo({ methodName: 'someMethod' }),
        executionInfo: { type: 'MODULE', address: { value: faker.finance.ethereumAddress() } },
      })

      const result = getTransactionType(tx, {})

      expect(iconProps(result.icon).icon).toBe(Code)
    })
  })
})
