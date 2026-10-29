import { translateMessage } from "../../i18n";
import { hashTypedData, type Address } from "viem";
import { normalizeTx, typed, type SafeInfo, type Tx } from "../../core";
import { mergeTxs } from "../../storage";
export function validateRemote(
  raw: unknown,
  safe: Address,
  chainId: number,
  info: SafeInfo,
) {
  const tx = normalizeTx(raw, safe, chainId);
  if (hashTypedData(typed(tx)).toLowerCase() !== tx.safeTxHash.toLowerCase())
    throw Error(translateMessage("ui.ca846026ae"));
  // App keeps arbitrary contract calls in the queue, even when transfer decoding
  // is unavailable. Their target/value are displayed as a contract call instead.
  if (
    tx.confirmations.some(
      (c) =>
        !info.owners.some(
          (owner) => owner.toLowerCase() === c.owner.toLowerCase(),
        ),
    )
  )
    throw Error(translateMessage("ui.c76c305e1c"));
  return tx;
}
export type PendingResult = {
  transactions: Tx[];
  warnings: string[];
  safe: Address;
  chainId: number;
  onchainNonce: number;
};
export async function syncPending(
  base: string,
  safe: Address,
  chainId: number,
  info: SafeInfo,
  local: Tx[],
  signal?: AbortSignal,
): Promise<PendingResult> {
  const rawRows: unknown[] = [];
  let offset = 0;
  for (let page = 0; ; page++) {
    if (page >= 100) throw Error(translateMessage("ui.38f6a4c420"));
    const response = await fetch(
      base.replace(/\/$/, "") +
        `/api/v2/safes/${safe}/multisig-transactions/?trusted=false&nonce__gte=${info.nonce}&limit=200&offset=${offset}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(20000)])
          : AbortSignal.timeout(20000),
      },
    );
    if (!response.ok)
      throw Error(translateMessage("ui.7e63778e39", { p0: response.status }));
    const data = await response.json();
    if (!Array.isArray(data.results))
      throw Error(translateMessage("ui.81bfbb67d8"));
    rawRows.push(...data.results);
    if (!data.next) break;
    if (!data.results.length) throw Error(translateMessage("ui.50878830c3"));
    offset += data.results.length;
  }
  // Match App: select the newest submission for EVERY nonce before validation.
  // A malformed replacement must not cause the older local proposal to be erased.
  const newest = new Map<number, Record<string, unknown>>();
  const warnings: string[] = [];
  for (const raw of rawRows) {
    if (!raw || typeof raw !== "object") {
      warnings.push(translateMessage("ui.a983c97e16"));
      continue;
    }
    const row = raw as Record<string, unknown>;
    const nonce = Number(row.nonce);
    if (!Number.isSafeInteger(nonce) || nonce < 0) {
      warnings.push(translateMessage("ui.42d13653d2"));
      continue;
    }
    if (nonce < info.nonce) continue;
    const previous = newest.get(nonce);
    const time = Date.parse(String(row.submissionDate ?? row.createdAt ?? ""));
    const kept = previous
      ? Date.parse(String(previous.submissionDate ?? previous.createdAt ?? ""))
      : 0;
    if (!previous || time > kept) newest.set(nonce, row);
  }
  const transactions: Tx[] = [];
  for (const row of newest.values()) {
    try {
      const tx = validateRemote(row, safe, chainId, info);
      const executed = local.some(
        (t) =>
          t.chainId === chainId &&
          t.safe.toLowerCase() === safe.toLowerCase() &&
          t.safeTxHash.toLowerCase() === tx.safeTxHash.toLowerCase() &&
          t.isExecuted,
      );
      if (!executed) transactions.push(tx);
    } catch (error) {
      warnings.push(
        error instanceof Error
          ? error.message
          : translateMessage("ui.91486ba345"),
      );
    }
  }
  return { transactions, warnings, safe, chainId, onchainNonce: info.nonce };
}
export function reconcilePending(local: Tx[], result: PendingResult): Tx[] {
  const replacements = new Map(
    result.transactions.map((t) => [t.nonce, t.safeTxHash.toLowerCase()]),
  );
  const kept = local.filter((t) => {
    if (
      t.chainId !== result.chainId ||
      t.safe.toLowerCase() !== result.safe.toLowerCase() ||
      t.isExecuted
    )
      return true;
    if (t.nonce < result.onchainNonce) return false;
    const replacement = replacements.get(t.nonce);
    return !replacement || replacement === t.safeTxHash.toLowerCase();
  });
  return mergeTxs(kept, result.transactions);
}
