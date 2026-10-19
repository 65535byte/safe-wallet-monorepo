import { FUNDED_BALANCE } from './chain.mjs'
import { createSafe } from './safe.mjs'

/** A 1/1 Safe of OWNER_4 with ETH, which a dApp asks over WalletConnect to send. */
export async function prepareWalletConnectScenario(env, owners) {
  const context = await createSafe(env, owners, { ownerAddresses: [owners.owner4.address], threshold: 1 })
  try {
    await context.provider.send('anvil_setBalance', [context.safeAddress, FUNDED_BALANCE])
    return { safes: { static: { SEP_WALLETCONNECT_SAFE: `sep:${context.safeAddress}` } } }
  } finally {
    context.provider.destroy()
  }
}
