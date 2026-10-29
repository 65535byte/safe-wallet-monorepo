import { afterEach, describe, expect, it, vi } from "vitest";
import {
  QueryClient,
  QueryObserver,
  focusManager,
  onlineManager,
} from "@tanstack/react-query";
import {
  appHistoryQueryPolicy,
  fetchAppHistory,
  parseAppHistory,
} from "./app-history";
const safe = "0x1111111111111111111111111111111111111111";
const row = {
  hash: "0xabc",
  from: safe.toUpperCase(),
  to: "0x2222222222222222222222222222222222222222",
  token_value: "123456789123456789123456789",
  decimal: 18,
  timestamp: 100,
  status: 1,
  log_index: 0,
};
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  focusManager.setFocused(undefined);
  onlineManager.setOnline(true);
});
describe("App history API", () => {
  it("uses the same endpoint and zero-based parameters as Flutter", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(Response.json({ result: 0, data: [row] }));
    vi.stubGlobal("fetch", fetch);
    const result = await fetchAppHistory(97, safe, 0);
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.origin).toBe("https://pretxs-hk.mytokenpocket.vip");
    expect(url.pathname).toBe("/v1/transaction_action/universal_list");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      new_way: "tp",
      page: "0",
      count: "50",
      ret_icon: "1",
      ns: "ethereum",
      chain_id: "97",
      address: safe,
      type: "0",
      lang: "zh-Hans",
    });
    expect(result.records).toHaveLength(1);
    expect(result.hasNext).toBe(false);
  });
  it("preserves App precision, time, status, native-token and log-index rules", () => {
    expect(parseAppHistory(row)).toMatchObject({
      id: "0xabc_0",
      amount: "123456789.123456789123456789",
      timestamp: 100000,
      status: "success",
      token: "native",
    });
    expect(
      parseAppHistory({
        ...row,
        status: 0,
        addr_token: "0x0000000000000000000000000000000000000000",
      }).status,
    ).toBe("pending");
    expect(
      parseAppHistory({ ...row, status: -1, addr_token: safe }),
    ).toMatchObject({ status: "failed", token: safe });
  });
  it("deduplicates records, filters by Safe, and sorts newest first", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({
            result: 0,
            data: [
              row,
              row,
              { ...row, hash: "new", timestamp: 200 },
              { ...row, hash: "other", from: "other", to: "other" },
            ],
          }),
        ),
    );
    expect(
      (await fetchAppHistory(97, safe)).records.map((row) => row.hash),
    ).toEqual(["new", "0xabc"]);
  });
  it("does not turn coming-soon responses or HTTP errors into empty history", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({ result: 0, message: "coming soon" }),
        )
        .mockResolvedValueOnce(new Response(null, { status: 403 })),
    );
    await expect(fetchAppHistory(97, safe)).rejects.toThrow("coming soon");
    await expect(fetchAppHistory(97, safe)).rejects.toThrow("403");
  });
  it("fetches once on entering the tab, never polls or refetches on focus/reconnect, and fetches once on re-entry", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(async () => Response.json({ result: 0, data: [] }));
    vi.stubGlobal("fetch", fetch);
    const client = new QueryClient();
    client.mount();
    const options = {
      ...appHistoryQueryPolicy,
      queryKey: ["app-history", 97, safe, 0],
      queryFn: () => fetchAppHistory(97, safe, 0),
    };
    const observer = new QueryObserver(client, options),
      unsubscribe = observer.subscribe(() => {});
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(1);
    focusManager.setFocused(false);
    focusManager.setFocused(true);
    onlineManager.setOnline(false);
    onlineManager.setOnline(true);
    observer.setOptions({ ...options });
    await vi.advanceTimersByTimeAsync(60000);
    expect(fetch).toHaveBeenCalledTimes(1);
    unsubscribe();
    const next = new QueryObserver(client, options),
      stop = next.subscribe(() => {});
    await vi.advanceTimersByTimeAsync(0);
    expect(fetch).toHaveBeenCalledTimes(2);
    stop();
    client.unmount();
    client.clear();
  });
});
