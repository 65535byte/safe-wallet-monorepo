import { translateMessage } from "../../i18n";
import type { Address, Hex } from "viem";
import {
  SafeTransactionApi,
  MultisigServiceError,
  normalizeTx,
  type Tx,
} from "../../core";
// Flutter buildTransfer: POST first; an already-existing proposal can be retried.
// Read back and verify before persisting a submitted record in the browser.
export async function submitProposal(
  api: SafeTransactionApi,
  tx: Tx,
  sender: Address,
  verify: (remote: Tx) => Promise<unknown>,
  signature?: Hex,
): Promise<Tx> {
  try {
    await api.propose(tx, sender, signature);
  } catch (error) {
    if (
      !(error instanceof MultisigServiceError) ||
      error.status !== 422 ||
      !/already/i.test(error.responseBody)
    )
      throw error;
  }
  const remote = normalizeTx(
    await api.request(`/api/v2/multisig-transactions/${tx.safeTxHash}/`),
    tx.safe,
    tx.chainId,
  );
  if (remote.safeTxHash.toLowerCase() !== tx.safeTxHash.toLowerCase())
    throw Error(translateMessage("ui.16e1f47016"));
  await verify(remote);
  return { ...remote, submitted: true };
}
