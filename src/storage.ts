import type { Settings, Tx } from "./core";
export function read<T>(key: string, fallback: T): T {
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
    if (
      (key === "settings" || key.startsWith("network:")) &&
      value &&
      typeof value === "object" &&
      typeof value.api === "string" &&
      value.api.includes("wallet-multi-sig.dplife.org")
    )
      return { ...value, api: "" };
    return value;
  } catch {
    return fallback;
  }
}
export function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}
export const defaults: Settings = {
  chainId: 97,
  rpc:
    import.meta.env.VITE_RPC_URL ||
    "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
  api: import.meta.env.VITE_SAFE_TX_SERVICE_URL || "",
  fromBlock: "0",
};
export function mergeTxs(a: Tx[], b: Tx[]) {
  const m = new Map(
    a.map((t) => [
      `${t.chainId}:${t.safe.toLowerCase()}:${t.safeTxHash.toLowerCase()}`,
      t,
    ]),
  );
  for (const t of b) {
    const key = `${t.chainId}:${t.safe.toLowerCase()}:${t.safeTxHash.toLowerCase()}`;
    const old = m.get(key);
    const sigs = new Map(
      [...(old?.confirmations ?? []), ...t.confirmations].map((c) => [
        c.owner.toLowerCase(),
        c,
      ]),
    );
    m.set(key, {
      ...old,
      ...t,
      createdAt: old?.createdAt ?? t.createdAt,
      isExecuted: old?.isExecuted || t.isExecuted,
      confirmations: [...sigs.values()],
    });
  }
  return [...m.values()];
}
