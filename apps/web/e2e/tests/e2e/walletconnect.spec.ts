/**
 * A dApp connects to a Safe over WalletConnect and sends it requests, through the hosted relay.
 *
 * The test plays the dApp with a real WalletConnect client in the Playwright process, so it reads the responses
 * that a real dApp gets. Runs only on the isolated stack, which gives a funded 1/1 Safe of OWNER_4 and a chain to
 * execute on.
 */
import { Contract, JsonRpcProvider, Wallet, hashMessage, parseEther, toQuantity } from 'ethers'
import { test as base, expect } from '../../src/fixtures/test.fixture'
import { isIsolated } from '../../src/fixtures/isolated-data'
import { seedConnectedWallet } from '../../src/fixtures/seed-wallet'
import { CHAIN_IDS } from '../../src/data/constants'
import { DAPP_NAME, WalletConnectDapp } from '../../src/api/walletconnect-dapp'
import { WalletConnectPage } from '../../src/pages/walletconnect.page'
import { TxFlowPage } from '../../src/pages/tx-flow.page'

type WalletConnectFixtures = {
  /** The Safe's address without the chain prefix */
  safeAddress: string
  /** A dApp in a session that the Safe's owner approved */
  dapp: WalletConnectDapp
}

const test = base.extend<WalletConnectFixtures>({
  safeAddress: async ({ safes }, provide) => {
    await provide(safes.SEP_WALLETCONNECT_SAFE.split(':')[1])
  },

  dapp: async ({ safePage, walletPage, credentials, safes }, provide, testInfo) => {
    const dapp = await WalletConnectDapp.start(CHAIN_IDS.sepolia)
    try {
      await seedConnectedWallet(safePage, credentials.OWNER_4_PRIVATE_KEY)
      await safePage.goto(`/home?safe=${safes.SEP_WALLETCONNECT_SAFE}`)
      await walletPage.accountCenter.waitFor({ state: 'visible' })

      const walletConnect = new WalletConnectPage(safePage)
      await walletConnect.pair(await dapp.connect())
      await walletConnect.proposal(DAPP_NAME).waitFor({ state: 'visible' })
      await walletConnect.approveButton.click()
      await dapp.waitForSession()

      await provide(dapp)
    } finally {
      if (testInfo.status !== testInfo.expectedStatus) {
        await testInfo.attach('walletconnect-dapp-log', { body: dapp.log.join('\n'), contentType: 'text/plain' })
      }
      await dapp.close()
    }
  },
})

/** The JSON-RPC receipt that the wallet returns to the dApp */
type TransactionReceipt = { status: string; transactionHash: string }

/** What the wallet answers when the dApp asks for the receipt of `hash`; null while the transaction is not on chain. */
async function receiptOf(dapp: WalletConnectDapp, hash: string): Promise<TransactionReceipt | null> {
  const response = await dapp.request('eth_getTransactionReceipt', [hash])
  if ('error' in response) throw new Error(`eth_getTransactionReceipt failed: ${response.error.message}`)
  return response.result as TransactionReceipt | null
}

// EIP-1271: the Safe answers this value when the signature is valid for the hash.
const ERC1271_MAGIC_VALUE = '0x1626ba7e'
const ERC1271_ABI = ['function isValidSignature(bytes32 hash, bytes signature) view returns (bytes4)']

/** The Transaction Service's Safe transactions that are not executed. */
async function pendingSafeTxCount(safeAddress: string): Promise<number> {
  const url = `${process.env.SAFE_TXS_BASE_URL}/v1/safes/${safeAddress}/multisig-transactions/?executed=false`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Transaction Service answered ${response.status} for ${url}`)
  const { count } = (await response.json()) as { count: number }
  return count
}

/** The Transaction Service's record of the Safe transaction that `txHash` executed. */
async function executedSafeTx(safeAddress: string, txHash: string): Promise<{ origin: string } | undefined> {
  const url = `${process.env.SAFE_TXS_BASE_URL}/v1/safes/${safeAddress}/multisig-transactions/?transaction_hash=${txHash}`
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Transaction Service answered ${response.status} for ${url}`)
  const { results } = (await response.json()) as { results: { origin: string }[] }
  return results[0]
}

// The tests share one Safe; a test that executes changes its nonce for the next one.
test.describe.configure({ mode: 'serial' })

test.describe('WalletConnect', { tag: ['@e2e', '@walletconnect'] }, () => {
  test.skip(!isIsolated, 'Needs the funded Safe and the chain of the isolated stack')

  test('should give the dApp the Safe account when the owner approves its session proposal', async ({
    safePage,
    safeAddress,
    dapp,
  }) => {
    expect(dapp.accounts).toContain(`eip155:${CHAIN_IDS.sepolia}:${safeAddress}`)

    const walletConnect = new WalletConnectPage(safePage)
    await walletConnect.open()
    await expect(walletConnect.session(DAPP_NAME)).toBeVisible()
  })

  test('should give the dApp a receipt of its transaction when the owner signs and executes it', async ({
    safePage,
    safeAddress,
    dapp,
  }) => {
    const recipient = Wallet.createRandom().address
    const value = parseEther('0.01')

    const response = dapp.request('eth_sendTransaction', [
      { from: safeAddress, to: recipient, value: toQuantity(value), data: '0x' },
    ])
    await new TxFlowPage(safePage).signAndExecute()

    // The signature answers the request with the safeTxHash; the dApp asks the wallet for the receipt of that hash.
    const answer = await response
    expect(answer).toEqual({ result: expect.stringMatching(/^0x[0-9a-f]{64}$/) })
    const { result: hash } = answer as { result: string }
    await expect.poll(async () => (await receiptOf(dapp, hash))?.status, { timeout: 60_000 }).toBe('0x1')
    const receipt = await receiptOf(dapp, hash)

    expect(await new JsonRpcProvider(process.env.SAFE_RPC_URL).getBalance(recipient)).toBe(value)
    await expect
      .poll(async () => (await executedSafeTx(safeAddress, receipt?.transactionHash ?? ''))?.origin, {
        timeout: 60_000,
      })
      .toContain(DAPP_NAME)
  })

  test('should give the dApp a signature that the Safe contract accepts when the owner signs its message', async ({
    safePage,
    safeAddress,
    dapp,
  }) => {
    const message = `Safe E2E WalletConnect message ${Date.now()}`

    const response = dapp.request('personal_sign', [message, safeAddress])
    await new TxFlowPage(safePage).signMessage()

    const answer = await response
    expect(answer).toEqual({ result: expect.stringMatching(/^0x[0-9a-f]+$/) })
    const { result: signature } = answer as { result: string }
    const safe = new Contract(safeAddress, ERC1271_ABI, new JsonRpcProvider(process.env.SAFE_RPC_URL))
    expect(await safe.isValidSignature(hashMessage(message), signature)).toBe(ERC1271_MAGIC_VALUE)
  })

  test('should return a user rejection to the dApp when the owner closes its transaction', async ({
    safePage,
    safeAddress,
    dapp,
  }) => {
    const response = dapp.request('eth_sendTransaction', [
      { from: safeAddress, to: Wallet.createRandom().address, value: '0x1', data: '0x' },
    ])
    await new TxFlowPage(safePage).discard()

    expect(await response).toEqual({ error: { code: 4001, message: expect.any(String) } })
    expect(await pendingSafeTxCount(safeAddress)).toBe(0)
  })

  test('should end the dApp session when the owner disconnects it', async ({ safePage, dapp }) => {
    const walletConnect = new WalletConnectPage(safePage)
    await walletConnect.disconnect(DAPP_NAME)

    await dapp.waitForSessionDelete()
    await expect(walletConnect.session(DAPP_NAME)).toHaveCount(0)
  })
})
