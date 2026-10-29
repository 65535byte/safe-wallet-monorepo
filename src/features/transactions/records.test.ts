import { afterEach, describe, expect, it, vi } from "vitest";
import {
  encodeAbiParameters,
  encodeFunctionData,
  type Address,
  type Hex,
} from "viem";
import {
  abi,
  active,
  draft,
  erc20,
  decodeTransfer,
  type SafeInfo,
} from "../../core";
import { defaults, mergeTxs } from "../../storage";
import { fetchSafeService } from "./safe-config";
import { syncPending, validateRemote, reconcilePending } from "./sync";
import {
  decodeExecution,
  executionTopics,
  readLogRange,
  uniqueRecords,
  type HistoryPage,
} from "./chain-records";
const safe: Address = "0x1111111111111111111111111111111111111111";
const owner: Address = "0x2222222222222222222222222222222222222222";
const hash = ("0x" + "a".repeat(64)) as Hex;
const info: SafeInfo = {
  owners: [owner],
  threshold: 1,
  nonce: 5,
  balance: 0n,
  version: "1.4.1",
};
const tx = (nonce = 5) => draft(defaults, safe, owner, "1", "0x", nonce);
afterEach(() => vi.unstubAllGlobals());
describe("Flutter automatic proposal discovery", () => {
  it("reads api_url from the evm chain registry", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ evm_97: { api_url: "https://example.org/" } }),
          ),
      ),
    );
    expect(await fetchSafeService(97)).toBe("https://example.org");
  });
  it("reports a missing service instead of claiming the remote queue is empty", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("{}")),
    );
    await expect(fetchSafeService(97)).rejects.toThrow("未配置多签服务");
  });
  it("keeps good proposals when one remote row is invalid, and follows pagination", async () => {
    const first = { ...tx(), submissionDate: "2026-10-01T01:00:00Z" };
    const second = tx(6);
    const fetch = vi.fn(
      async (url: string) =>
        new Response(
          JSON.stringify(
            url.includes("offset=0")
              ? {
                  results: [first, { ...first, nonce: 7, safeTxHash: hash }],
                  next: "https://untrusted.invalid/page",
                }
              : { results: [second], next: null },
          ),
        ),
    );
    vi.stubGlobal("fetch", fetch);
    const result = await syncPending("https://example.org", safe, 97, info, []);
    expect(String(fetch.mock.calls[0][0])).toContain(
      "trusted=false&nonce__gte=5&limit=200",
    );
    expect(String(fetch.mock.calls[0][0])).not.toContain("executed=false");
    expect(result.transactions).toHaveLength(2);
    expect(result.warnings).toHaveLength(1);
    expect(fetch.mock.calls[1][0]).toContain(
      "https://example.org/api/v2/safes/",
    );
    expect(fetch.mock.calls[1][0]).toContain("offset=2");
    expect(active(result.transactions, 5)).toHaveLength(2);
  });
  it("keeps absent local proposals without per-hash requests, like App", async () => {
    const local = { ...tx(), submitted: true };
    const fetch = vi.fn(async () => Response.json({ results: [], next: null }));
    vi.stubGlobal("fetch", fetch);
    const result = await syncPending("https://example.org", safe, 97, info, [
      local,
    ]);
    expect(reconcilePending([local], result)).toEqual([local]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("does not downgrade a locally executed proposal from stale remote state", () => {
    const local = { ...tx(), isExecuted: true };
    expect(
      mergeTxs([local], [{ ...local, isExecuted: false }])[0].isExecuted,
    ).toBe(true);
  });
  it("keeps records for the same hash on distinct chains separate", () => {
    const a = tx();
    expect(mergeTxs([a], [{ ...a, chainId: 1 }])).toHaveLength(2);
  });
  it("rejects tampered calldata and non-owner confirmations before caching", () => {
    const t = tx();
    expect(() => validateRemote({ ...t, value: "2" }, safe, 97, info)).toThrow(
      "哈希",
    );
    expect(() =>
      validateRemote(
        { ...t, confirmations: [{ owner: safe, signature: "0x12" }] },
        safe,
        97,
        info,
      ),
    ).toThrow("不属于");
  });
  it("keeps the newest current proposal by creation time and local id, and all queued proposals", () => {
    const a = { ...tx(), createdAt: "2026-10-01", id: 1 };
    const b = { ...a, id: 2, safeTxHash: hash };
    expect(active([a, b, tx(6), tx(7)], 5).slice(0, 1)).toEqual([b]);
    expect(active([a, b, tx(6), tx(7)], 5)).toHaveLength(3);
  });
});
describe("chain execution records", () => {
  const log = {
    address: safe,
    topics: [executionTopics.success, hash],
    data: encodeAbiParameters([{ type: "uint256" }], [0n]),
    blockNumber: 100n,
    blockHash: hash,
    transactionHash: hash,
    logIndex: 2,
  };
  it("reads both Safe 1.4 indexed and 1.3 non-indexed execution hashes", () => {
    expect(decodeExecution(log, safe, 97)?.safeTxHash).toBe(hash);
    const legacy = {
      ...log,
      topics: [executionTopics.failure],
      data: encodeAbiParameters(
        [{ type: "bytes32" }, { type: "uint256" }],
        [hash, 0n],
      ),
    };
    expect(decodeExecution(legacy, safe, 97)).toMatchObject({
      safeTxHash: hash,
      success: false,
    });
  });
  it("ignores unrelated, removed and unmined events", () => {
    expect(decodeExecution({ ...log, address: owner }, safe, 97)).toBeNull();
    expect(decodeExecution({ ...log, removed: true }, safe, 97)).toBeNull();
    expect(decodeExecution({ ...log, blockNumber: null }, safe, 97)).toBeNull();
    expect(decodeExecution({ ...log, topics: [hash] }, safe, 97)).toBeNull();
  });
  it("splits RPC ranges without skipping boundary blocks", async () => {
    const get = vi.fn(async (from: bigint, to: bigint): Promise<bigint[]> => {
      if (to - from > 1n) throw Error("block range limit exceeded");
      return from === to ? [from] : [from, to];
    });
    expect(await readLogRange(get, 0n, 7n)).toEqual([
      0n,
      1n,
      2n,
      3n,
      4n,
      5n,
      6n,
      7n,
    ]);
  });
  it("does not disguise RPC network errors as empty history or split forever", async () => {
    const get = vi.fn(async () => {
      throw Error("network offline");
    });
    await expect(readLogRange(get, 0n, 100n)).rejects.toThrow("offline");
    expect(get).toHaveBeenCalledTimes(1);
  });
  it("stops further requests after cancellation", async () => {
    const controller = new AbortController();
    controller.abort();
    const get = vi.fn(async () => []);
    await expect(
      readLogRange(get, 0n, 10n, controller.signal),
    ).rejects.toThrow();
    expect(get).not.toHaveBeenCalled();
  });
  it("deduplicates execution events across pages", () => {
    const record = decodeExecution(log, safe, 97)!;
    const page: HistoryPage = {
      records: [record],
      from: 0n,
      to: 100n,
      next: null,
    };
    expect(uniqueRecords([page, page])).toHaveLength(1);
  });
});
describe("Flutter transfer decoding", () => {
  it("distinguishes native / ERC20 recipient from the token contract", () => {
    expect(decodeTransfer(tx())?.recipient).toBe(owner);
    const token = {
      ...tx(),
      to: safe,
      value: "0",
      data: encodeFunctionData({
        abi: erc20,
        functionName: "transfer",
        args: [owner, 123456n],
      }),
    };
    expect(decodeTransfer(token)).toEqual({
      recipient: owner,
      amount: 123456n,
      token: safe,
    });
    expect(decodeTransfer({ ...token, operation: 1 })).toBeNull();
    expect(decodeTransfer({ ...token, value: "1" })).toBeNull();
  });
});

describe("current Flutter queue reconciliation", () => {
  it("keeps only the newest remote proposal per nonce, including queued nonces", async () => {
    const old = { ...tx(6), submissionDate: "2026-10-01T00:00:00Z" };
    const newest = {
      ...draft(defaults, safe, owner, "2", "0x", 6),
      submissionDate: "2026-10-02T00:00:00Z",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ results: [old, newest], next: null })),
    );
    const result = await syncPending("https://example.org", safe, 97, info, [
      old,
    ]);
    expect(result.transactions.map((t) => t.safeTxHash)).toEqual([
      newest.safeTxHash,
    ]);
    expect(reconcilePending([old], result).map((t) => t.safeTxHash)).toEqual([
      newest.safeTxHash,
    ]);
  });
  it("retains the local nonce when the newest remote replacement is invalid", async () => {
    const local = { ...tx(6), createdAt: "2026-10-01T00:00:00Z" };
    const bad = {
      ...local,
      value: "2",
      submissionDate: "2026-10-02T00:00:00Z",
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ results: [local, bad], next: null })),
    );
    const result = await syncPending("https://example.org", safe, 97, info, [
      local,
    ]);
    expect(result.transactions).toEqual([]);
    expect(result.warnings).toHaveLength(1);
    expect(reconcilePending([local], result)).toEqual([local]);
  });
  it("cleans consumed and replaced pending rows only for this Safe and chain, retaining executed history", async () => {
    const old = tx(6),
      consumed = tx(4),
      executed = { ...tx(3), isExecuted: true };
    const otherChain = { ...consumed, chainId: 1 };
    const otherSafe = { ...consumed, safe: owner };
    const replacement = draft(defaults, safe, owner, "2", "0x", 6);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ results: [replacement], next: null })),
    );
    const rows = [old, consumed, executed, otherChain, otherSafe];
    const result = await syncPending(
      "https://example.org",
      safe,
      97,
      info,
      rows,
    );
    const reconciled = reconcilePending(rows, result);
    expect(reconciled).toContainEqual(executed);
    expect(reconciled).toContainEqual(otherChain);
    expect(reconciled).toContainEqual(otherSafe);
    expect(
      reconciled.some(
        (t) =>
          t.safe === safe && t.chainId === 97 && t.nonce === 4 && !t.isExecuted,
      ),
    ).toBe(false);
    expect(
      reconciled.some(
        (t) => t.safeTxHash === old.safeTxHash && t.chainId === 97,
      ),
    ).toBe(false);
    expect(
      reconciled.some((t) => t.safeTxHash === replacement.safeTxHash),
    ).toBe(true);
  });
  it("does not lose arbitrary contract calls just because transfer decoding is unavailable", () => {
    const call = draft(defaults, safe, owner, "0", "0x12345678", 6);
    expect(validateRemote(call, safe, 97, info).data).toBe("0x12345678");
  });
  it("does not apply a half-fetched queue after a later page fails", async () => {
    const rows = [tx(4), tx(6)];
    const before = JSON.stringify(rows);
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          Response.json({ results: [tx(5)], next: "more" }),
        )
        .mockResolvedValueOnce(
          new Response("RPC unavailable", { status: 503 }),
        ),
    );
    await expect(
      syncPending("https://example.org", safe, 97, info, rows),
    ).rejects.toThrow("503");
    expect(JSON.stringify(rows)).toBe(before);
  });
});
