import { describe, expect, it, vi, afterEach } from "vitest";
import { privateKeyToAccount } from "viem/accounts";
import {
  hashTypedData,
  encodeEventTopics,
  encodeAbiParameters,
  type Hex,
  type Address,
} from "viem";
import {
  active,
  draft,
  normalizeTx,
  typed,
  recoverSigner,
  SafeTransactionApi,
  abi,
} from "./core";
import { defaults, mergeTxs } from "./storage";
import { SafeProtocolService } from "./protocol";
import { appShare, parseShare } from "./share";
const a: Address = "0x1111111111111111111111111111111111111111";
const b: Address = "0x2222222222222222222222222222222222222222";
const tx = (nonce: number, date: string) => ({
  ...draft(defaults, a, b, "1000000000000000", "0x", nonce),
  createdAt: date,
});
afterEach(() => vi.unstubAllGlobals());
describe("nonce queue parity with Flutter", () => {
  it("hides consumed nonce, keeps newest current, retains all future proposals", () => {
    const old = tx(4, "2026-01-01");
    const current = tx(5, "2026-01-01");
    const latest = {
      ...tx(5, "2026-01-02"),
      safeTxHash: ("0x" + "a".repeat(64)) as Hex,
    };
    const future = tx(6, "2026-01-01");
    const other = {
      ...tx(6, "2026-01-03"),
      safeTxHash: ("0x" + "b".repeat(64)) as Hex,
    };
    expect(active([other, current, old, future, latest], 5)).toEqual([
      latest,
      future,
      other,
    ]);
  });
  it("excludes executed proposals", () =>
    expect(active([{ ...tx(0, "2026-01-01"), isExecuted: true }], 0)).toEqual(
      [],
    ));
});
describe("Safe signing and hash domain", () => {
  it("matches Protocol Kit for native and calldata transactions across supported versions", () => {
    for (const version of ["1.3.0", "1.4.1"])
      for (const data of ["0x", "0x12345678"] as Hex[]) {
        const t = { ...tx(7, "2026-01-01"), data };
        expect(hashTypedData(typed(t))).toBe(
          SafeProtocolService.hash(t, version),
        );
      }
  });
  it("binds hash to chain and Safe, and preserves uint256 amounts", () => {
    const t = tx(9, "2026-01-01");
    expect(hashTypedData(typed({ ...t, chainId: 1 }))).not.toBe(t.safeTxHash);
    expect(hashTypedData(typed({ ...t, safe: b }))).not.toBe(t.safeTxHash);
    const large = { ...t, value: (2n ** 200n).toString() };
    expect(SafeProtocolService.hash(large, "1.4.1")).toBe(
      hashTypedData(typed(large)),
    );
  });
  it("recovers EIP712 and App-compatible eth_sign signatures", async () => {
    const owner = privateKeyToAccount(("0x" + "01".repeat(32)) as Hex);
    const t = tx(0, "2026-01-01");
    expect(await recoverSigner(t, await owner.signTypedData(typed(t)))).toBe(
      owner.address,
    );
    const sig = await owner.signMessage({ message: { raw: t.safeTxHash } });
    const v = parseInt(sig.slice(-2), 16) + 4;
    expect(
      await recoverSigner(t, (sig.slice(0, -2) + v.toString(16)) as Hex),
    ).toBe(owner.address);
  });
  it("rejects unsupported signature encodings", async () =>
    expect(recoverSigner(tx(0, ""), "0x1234")).rejects.toThrow("65 字节"));
});
describe("offchain interoperability", () => {
  it("deduplicates signatures case-insensitively", () => {
    const t = tx(0, "");
    const first = {
      ...t,
      confirmations: [{ owner: a, signature: "0x11" as Hex }],
    };
    const second = {
      ...t,
      confirmations: [{ owner: a, signature: "0x22" as Hex }],
    };
    expect(mergeTxs([first], [second])[0].confirmations).toHaveLength(1);
  });
  it("uses v2 unsigned proposal and v1 confirmations", async () => {
    const fetch = vi
      .fn()
      .mockImplementation(async () => new Response("", { status: 201 }));
    vi.stubGlobal("fetch", fetch);
    const api = new SafeTransactionApi("https://example.org/");
    const t = tx(0, "");
    await api.propose(t, a);
    expect(fetch.mock.calls[0][0]).toContain("/api/v2/safes/");
    const body = JSON.parse(fetch.mock.calls[0][1].body);
    expect(body.sender).toBe(a);
    expect(body.contractTransactionHash).toBe(t.safeTxHash);
    expect(body.signature).toBeUndefined();
    await api.confirm(t, "0x1234");
    expect(fetch.mock.calls[1][0]).toContain("/api/v1/multisig-transactions/");
  });
  it("encodes Flutter confirmation POST and bypasses conditional browser caches", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetch);
    const api = new SafeTransactionApi("https://msw-bsc-test.dplife.org/");
    const t = tx(0, "2026-01-01");
    await api.confirm(
      { ...t, safeTxHash: t.safeTxHash.slice(2) as Hex },
      "abcd" as Hex,
    );
    expect(fetch.mock.calls[0][0]).toBe(
      `https://msw-bsc-test.dplife.org/api/v1/multisig-transactions/${t.safeTxHash}/confirmations/`,
    );
    expect(fetch.mock.calls[0][1]).toMatchObject({
      method: "POST",
      cache: "no-store",
      body: JSON.stringify({ signature: "0xabcd" }),
    });
    await api.request(`/api/v2/multisig-transactions/${t.safeTxHash}/`);
    expect(fetch.mock.calls[1][1]).toMatchObject({
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    expect(fetch.mock.calls[1][1].headers["Content-Type"]).toBeUndefined();
    await expect(
      api.confirm({ ...t, safeTxHash: "0x123" }, "0xabcd"),
    ).rejects.toThrow("交易哈希无效");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it("roundtrips Flutter gzip + base64url envelope", async () => {
    const t = tx(0, "2026-01-01");
    const raw = await appShare(
      t,
      { owners: [a, b], threshold: 2, nonce: 0, balance: 0n, version: "1.4.1" },
      "BNB",
    );
    const decoded = await parseShare(raw);
    expect(decoded.safeAddress).toBe(a);
    expect(decoded.safeTxHash).toBe(t.safeTxHash);
    expect(decoded.chainid).toBe("97");
  });
  it("uses the actual indexed execution event ABI", () => {
    const topics = encodeEventTopics({
      abi,
      eventName: "ExecutionSuccess",
      args: { txHash: tx(0, "").safeTxHash },
    });
    expect(topics).toHaveLength(2);
    expect(encodeAbiParameters([{ type: "uint256" }], [0n])).toHaveLength(66);
  });
});

describe("execution signature gate", () => {
  it("does not count repeated signatures towards the threshold", async () => {
    const { collectSignatures } = await import("./core");
    const owner = privateKeyToAccount(("0x" + "02".repeat(32)) as Hex);
    const t = tx(0, "");
    const c = {
      owner: owner.address,
      signature: await owner.signTypedData(typed(t)),
    };
    await expect(
      collectSignatures(
        { ...t, confirmations: [c, c] },
        {
          owners: [owner.address, a],
          threshold: 2,
          nonce: 0,
          balance: 0n,
          version: "1.4.1",
        },
      ),
    ).rejects.toThrow("未达到阈值");
  });
  it("rejects a cryptographically valid signature from a non-owner", async () => {
    const { collectSignatures } = await import("./core");
    const owner = privateKeyToAccount(("0x" + "03".repeat(32)) as Hex);
    const t = tx(0, "");
    const c = {
      owner: owner.address,
      signature: await owner.signTypedData(typed(t)),
    };
    await expect(
      collectSignatures(
        { ...t, confirmations: [c] },
        { owners: [a], threshold: 1, nonce: 0, balance: 0n, version: "1.4.1" },
      ),
    ).rejects.toThrow("无效管理者签名");
  });
});

describe("Flutter API response normalization", () => {
  it("normalizes string nonce and nullable native calldata", () => {
    const t = tx(7, "2026-01-01");
    const result = normalizeTx({ ...t, nonce: "7", data: null }, a, 97);
    expect(result.nonce).toBe(7);
    expect(result.data).toBe("0x");
    expect(active([result], 7)).toHaveLength(1);
  });
  it("rejects mismatched Safe addresses and unsafe nonces", () => {
    const t = tx(0, "2026-01-01");
    expect(() => normalizeTx({ ...t, safe: b }, a, 97)).toThrow("地址不匹配");
    expect(() =>
      normalizeTx({ ...t, nonce: "9007199254740993" }, a, 97),
    ).toThrow("nonce");
  });
});
