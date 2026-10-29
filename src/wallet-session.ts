import {
  getAddress,
  isAddress,
  type Address,
  type EIP1193Provider,
} from "viem";
export type SessionProvider = EIP1193Provider & {
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (
    event: string,
    listener: (...args: unknown[]) => void,
  ) => void;
};
export const WALLET_DISCONNECTED_KEY = "multisig.wallet.disconnected";
type Host = {
  ethereum?: SessionProvider;
  localStorage: Pick<Storage, "getItem" | "setItem">;
  document: Pick<
    Document,
    "addEventListener" | "removeEventListener" | "visibilityState"
  >;
  addEventListener: Window["addEventListener"];
  removeEventListener: Window["removeEventListener"];
  setInterval: Window["setInterval"];
  clearInterval: Window["clearInterval"];
};
export function sessionAccount(accounts: unknown): Address | undefined {
  const first = Array.isArray(accounts) ? accounts[0] : undefined;
  return typeof first === "string" && isAddress(first, { strict: false })
    ? getAddress(first)
    : undefined;
}
export function watchWalletSession(
  host: Host,
  report: (account: Address | undefined) => void,
) {
  let stopped = false,
    provider: SessionProvider | undefined,
    revision = 0;
  let pending: { provider: SessionProvider; token: number } | undefined;
  let detached = () => {};
  let disconnected = false;
  try {
    disconnected =
      host.localStorage.getItem(WALLET_DISCONNECTED_KEY) === "true";
  } catch {}
  const remember = (value: boolean) => {
    disconnected = value;
    try {
      host.localStorage.setItem(WALLET_DISCONNECTED_KEY, String(value));
    } catch {}
  };
  const changed = (accounts: unknown) => {
    revision++;
    if (!stopped && !disconnected) report(sessionAccount(accounts));
  };
  const chainChanged = () => {
    revision++;
    pending = undefined;
    refresh();
  };
  const lost = () => {
    revision++;
    if (!stopped) report(undefined);
  };
  function refresh() {
    if (stopped) return;
    const injected = host.ethereum;
    if (injected !== provider) {
      detached();
      revision++;
      pending = undefined;
      provider = injected;
      if (provider) {
        const attached = provider;
        attached.on?.("accountsChanged", changed);
        attached.on?.("chainChanged", chainChanged);
        attached.on?.("connect", chainChanged);
        attached.on?.("disconnect", lost);
        detached = () => {
          attached.removeListener?.("accountsChanged", changed);
          attached.removeListener?.("chainChanged", chainChanged);
          attached.removeListener?.("connect", chainChanged);
          attached.removeListener?.("disconnect", lost);
        };
      } else {
        detached = () => {};
        if (!disconnected) report(undefined);
      }
    }
    if (!provider || disconnected || pending?.provider === provider) return;
    const current = provider,
      token = ++revision;
    pending = { provider: current, token };
    Promise.resolve()
      .then(() => current.request({ method: "eth_accounts" }))
      .then((accounts) => {
        if (
          !stopped &&
          !disconnected &&
          token === revision &&
          provider === current
        )
          report(sessionAccount(accounts));
      })
      .catch(() => {})
      .finally(() => {
        if (pending?.token === token) pending = undefined;
      });
  }
  const wake = () => refresh();
  const visible = () => {
    if (host.document.visibilityState === "visible") refresh();
  };
  host.addEventListener("ethereum#initialized", wake);
  host.addEventListener("eip6963:announceProvider", wake);
  host.addEventListener("focus", wake);
  host.document.addEventListener("visibilitychange", visible);
  refresh();
  let attempts = 0;
  const timer = host.setInterval(() => {
    refresh();
    if (++attempts >= 20) host.clearInterval(timer);
  }, 500);
  return {
    connect(account: Address) {
      revision++;
      pending = undefined;
      remember(false);
      report(account);
      refresh();
    },
    disconnect() {
      revision++;
      pending = undefined;
      remember(true);
      report(undefined);
    },
    stop() {
      stopped = true;
      revision++;
      detached();
      host.clearInterval(timer);
      host.removeEventListener("ethereum#initialized", wake);
      host.removeEventListener("eip6963:announceProvider", wake);
      host.removeEventListener("focus", wake);
      host.document.removeEventListener("visibilitychange", visible);
    },
  };
}
