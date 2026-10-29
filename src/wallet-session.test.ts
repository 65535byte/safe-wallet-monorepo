import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  watchWalletSession,
  sessionAccount,
  WALLET_DISCONNECTED_KEY,
  type SessionProvider,
} from "./wallet-session";
const a = "0x1111111111111111111111111111111111111111",
  b = "0x2222222222222222222222222222222222222222";
function injected(initial: string[] = [a]) {
  const handlers = new Map<string, Set<(...args: unknown[]) => void>>();
  const request = vi.fn(async () => initial);
  const on = vi.fn((event: string, listener: (...args: unknown[]) => void) => {
    if (!handlers.has(event)) handlers.set(event, new Set());
    handlers.get(event)!.add(listener);
  });
  const removeListener = vi.fn(
    (event: string, listener: (...args: unknown[]) => void) => {
      handlers.get(event)?.delete(listener);
    },
  );
  return {
    provider: { request, on, removeListener } as unknown as SessionProvider,
    request,
    emit: (event: string, ...args: unknown[]) =>
      handlers.get(event)?.forEach((listener) => listener(...args)),
    handlers,
  };
}
function environment(provider?: SessionProvider, saved?: string) {
  const events = new EventTarget(),
    docEvents = new EventTarget();
  const values = new Map<string, string>();
  if (saved) values.set(WALLET_DISCONNECTED_KEY, saved);
  const host = {
    ethereum: provider,
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
    },
    document: {
      visibilityState: "visible",
      addEventListener: docEvents.addEventListener.bind(docEvents),
      removeEventListener: docEvents.removeEventListener.bind(docEvents),
    },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
  };
  return {
    host: host as unknown as Parameters<typeof watchWalletSession>[0],
    events,
    values,
  };
}
async function flush() {
  for (let i = 0; i < 8; i++) await Promise.resolve();
}
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
describe("wallet session restoration", () => {
  it("restores an authorized account without requesting permissions or switching chains", async () => {
    const wallet = injected(),
      env = environment(wallet.provider),
      report = vi.fn();
    const session = watchWalletSession(env.host, report);
    await flush();
    expect(report).toHaveBeenLastCalledWith(a);
    expect(wallet.request).toHaveBeenCalledWith({ method: "eth_accounts" });
    session.stop();
  });
  it("finds a provider injected after the initial render", async () => {
    const env = environment(),
      report = vi.fn(),
      session = watchWalletSession(env.host, report);
    const wallet = injected();
    env.host.ethereum = wallet.provider;
    await vi.advanceTimersByTimeAsync(500);
    expect(report).toHaveBeenLastCalledWith(a);
    session.stop();
  });
  it("responds to the initialized event and retries initially empty App accounts", async () => {
    const wallet = injected([]),
      env = environment(),
      report = vi.fn(),
      session = watchWalletSession(env.host, report);
    env.host.ethereum = wallet.provider;
    env.events.dispatchEvent(new Event("ethereum#initialized"));
    await flush();
    expect(report).toHaveBeenLastCalledWith(undefined);
    wallet.request.mockResolvedValue([a]);
    await vi.advanceTimersByTimeAsync(500);
    expect(report).toHaveBeenLastCalledWith(a);
    session.stop();
  });
  it("updates accounts rather than clearing them on account and chain changes", async () => {
    const wallet = injected(),
      env = environment(wallet.provider),
      report = vi.fn(),
      session = watchWalletSession(env.host, report);
    await flush();
    wallet.emit("accountsChanged", [b]);
    expect(report).toHaveBeenLastCalledWith(b);
    wallet.request.mockResolvedValue([b]);
    wallet.emit("chainChanged", "0x38");
    await flush();
    expect(report).toHaveBeenLastCalledWith(b);
    wallet.emit("accountsChanged", []);
    expect(report).toHaveBeenLastCalledWith(undefined);
    session.stop();
  });
  it("respects an explicit disconnect across refresh and allows explicit reconnection", async () => {
    const wallet = injected(),
      env = environment(wallet.provider),
      report = vi.fn();
    const first = watchWalletSession(env.host, report);
    await flush();
    first.disconnect();
    first.stop();
    expect(env.values.get(WALLET_DISCONNECTED_KEY)).toBe("true");
    wallet.request.mockClear();
    const second = watchWalletSession(env.host, report);
    await vi.advanceTimersByTimeAsync(1000);
    expect(wallet.request).not.toHaveBeenCalled();
    wallet.emit("accountsChanged", [a]);
    expect(report).toHaveBeenLastCalledWith(undefined);
    second.connect(a);
    await flush();
    expect(report).toHaveBeenLastCalledWith(a);
    expect(env.values.get(WALLET_DISCONNECTED_KEY)).toBe("false");
    second.stop();
  });
  it("does not overwrite an account event with a stale async response", async () => {
    const wallet = injected();
    let finish: (value: string[]) => void = () => {};
    wallet.request.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const env = environment(wallet.provider),
      report = vi.fn(),
      session = watchWalletSession(env.host, report);
    await flush();
    wallet.emit("accountsChanged", [b]);
    finish([a]);
    await flush();
    expect(report).toHaveBeenLastCalledWith(b);
    wallet.request.mockResolvedValue([b]);
    env.events.dispatchEvent(new Event("focus"));
    await flush();
    expect(wallet.request).toHaveBeenCalledTimes(2);
    session.stop();
  });
  it("cleans up listeners and ignores pending responses after unmount", async () => {
    const wallet = injected(),
      env = environment(wallet.provider),
      report = vi.fn(),
      session = watchWalletSession(env.host, report);
    session.stop();
    await flush();
    expect(report).not.toHaveBeenCalled();
    expect([...wallet.handlers.values()].every((set) => set.size === 0)).toBe(
      true,
    );
    expect(vi.getTimerCount()).toBe(0);
  });
  it("handles locked wallets and storage failures without requesting authorization", async () => {
    const wallet = injected();
    wallet.request.mockRejectedValue(new Error("locked"));
    const env = environment(wallet.provider);
    env.host.localStorage.getItem = () => {
      throw new Error("blocked");
    };
    env.host.localStorage.setItem = () => {
      throw new Error("blocked");
    };
    const report = vi.fn(),
      session = watchWalletSession(env.host, report);
    await flush();
    expect(report).not.toHaveBeenCalled();
    session.disconnect();
    expect(report).toHaveBeenLastCalledWith(undefined);
    session.stop();
  });
  it("rejects malformed account payloads", () => {
    expect(sessionAccount(null)).toBeUndefined();
    expect(sessionAccount(["bad"])).toBeUndefined();
    expect(sessionAccount([a])).toBe(a);
  });
});
