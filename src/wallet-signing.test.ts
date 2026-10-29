import { afterEach, describe, expect, it, vi } from "vitest";
import { hashTypedData, type EIP1193Provider, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { draft, typed } from "./core";
import { defaults } from "./storage";
import { safeSigningPayload, signSafeTypedData } from "./wallet-signing";
import { SafeTransactionApi } from "./core";
import { submitProposal } from "./features/transactions/submit";
const owner = privateKeyToAccount(`0x${"01".repeat(32)}`);
const other = privateKeyToAccount(`0x${"02".repeat(32)}`);
const tx = draft(
  defaults,
  "0x1111111111111111111111111111111111111111",
  "0x2222222222222222222222222222222222222222",
  (2n ** 200n).toString(),
  "0x",
  5,
);
const data = typed(tx);
function provider(
  sign: (payload: string) => Promise<unknown> = (payload) =>
    owner.signTypedData(JSON.parse(payload)),
  chain: string = "0x61",
) {
  const request = vi.fn(
    async ({ method, params }: { method: string; params?: unknown[] }) => {
      if (method === "eth_accounts") return [owner.address];
      if (method === "eth_chainId") return chain;
      if (method === "eth_signTypedData_v4") return sign(params![1] as string);
      throw Error(`Unexpected RPC method: ${method}`);
    },
  );
  return { wallet: { request } as unknown as EIP1193Provider, request };
}
afterEach(() => vi.unstubAllGlobals());
describe("injected wallet Safe signing", () => {
  it("serializes the exact v4 shape accepted by the App bridge without losing uint256 precision", () => {
    const payload = JSON.parse(safeSigningPayload(data));
    expect(payload.domain).toEqual({
      chainId: "0x61",
      verifyingContract: tx.safe,
    });
    expect(payload.types.EIP712Domain).toEqual([
      { name: "chainId", type: "uint256" },
      { name: "verifyingContract", type: "address" },
    ]);
    expect(payload.message.value).toBe((2n ** 200n).toString());
    expect(payload.message.nonce).toBe("5");
    expect(hashTypedData(payload)).toBe(tx.safeTxHash);
  });
  it.each(["0x61", "97"])(
    "uses one injected v4 signing request with chain %s, without SDK initialization RPCs",
    async (chain) => {
      const { wallet, request } = provider(undefined, chain);
      const result = await signSafeTypedData(
        wallet,
        owner.address,
        data,
        tx.safeTxHash,
      );
      expect(result.owner).toBe(owner.address);
      expect(request.mock.calls.map(([call]) => call.method)).toEqual([
        "eth_accounts",
        "eth_chainId",
        "eth_signTypedData_v4",
        "eth_accounts",
        "eth_chainId",
      ]);
      const call = request.mock.calls[2][0];
      expect(call.params?.[0]).toBe(owner.address);
      expect(typeof call.params?.[1]).toBe("string");
    },
  );
  it("normalizes App recovery ids 0/1 to Safe-compatible 27/28", async () => {
    const { wallet } = provider(async () => {
      const raw = await owner.signTypedData(data);
      return (
        raw.slice(0, -2) +
        (Number.parseInt(raw.slice(-2), 16) - 27).toString(16).padStart(2, "0")
      );
    });
    expect(
      (await signSafeTypedData(wallet, owner.address, data, tx.safeTxHash))
        .signature,
    ).toBe(await owner.signTypedData(data));
  });
  it("does not open signing for a mismatched hash or network", async () => {
    const { wallet, request } = provider();
    await expect(
      signSafeTypedData(wallet, owner.address, data, `0x${"ab".repeat(32)}`),
    ).rejects.toThrow("哈希");
    expect(request).not.toHaveBeenCalled();
    const wrong = provider(undefined, "0x38");
    await expect(
      signSafeTypedData(wrong.wallet, owner.address, data, tx.safeTxHash),
    ).rejects.toThrow("网络");
    expect(
      wrong.request.mock.calls.some(
        ([call]) => call.method === "eth_signTypedData_v4",
      ),
    ).toBe(false);
  });
  it("rejects a different signing account and malformed signatures", async () => {
    const wrong = provider(() => other.signTypedData(data));
    await expect(
      signSafeTypedData(wrong.wallet, owner.address, data, tx.safeTxHash),
    ).rejects.toThrow("不匹配");
    const malformed = provider(async () => "0x1234");
    await expect(
      signSafeTypedData(malformed.wallet, owner.address, data, tx.safeTxHash),
    ).rejects.toThrow("格式");
  });
  it("cancels without retrying or falling back to personal_sign", async () => {
    const { wallet, request } = provider(async () => {
      throw { code: 4001, message: "User rejected" };
    });
    await expect(
      signSafeTypedData(wallet, owner.address, data, tx.safeTxHash),
    ).rejects.toThrow("取消");
    expect(
      request.mock.calls.filter(
        ([call]) => call.method === "eth_signTypedData_v4",
      ),
    ).toHaveLength(1);
    expect(
      request.mock.calls.some(([call]) => call.method === "personal_sign"),
    ).toBe(false);
  });
  it("blocks a switched account after the wallet confirmation", async () => {
    let signed = false;
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === "eth_accounts")
        return [signed ? other.address : owner.address];
      if (method === "eth_chainId") return "0x61";
      signed = true;
      return owner.signTypedData(data);
    });
    await expect(
      signSafeTypedData(
        { request } as unknown as EIP1193Provider,
        owner.address,
        data,
        tx.safeTxHash,
      ),
    ).rejects.toThrow("切换");
  });
  it("passes the verified App signature to the same proposal API and reads it back", async () => {
    const { wallet } = provider();
    const confirmation = await signSafeTypedData(
      wallet,
      owner.address,
      data,
      tx.safeTxHash,
    );
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(
        Response.json({ ...tx, confirmations: [confirmation] }),
      );
    vi.stubGlobal("fetch", fetch);
    const result = await submitProposal(
      new SafeTransactionApi("https://example.org"),
      tx,
      owner.address,
      async () => {},
      confirmation.signature as Hex,
    );
    const payload = JSON.parse(fetch.mock.calls[0][1].body);
    expect(payload.signature).toBe(confirmation.signature);
    expect(payload.sender).toBe(owner.address);
    expect(payload.contractTransactionHash).toBe(tx.safeTxHash);
    expect(result.confirmations).toEqual([confirmation]);
  });
});

it("does not treat a secondary exposed account as the active wallet", async () => {
  const { wallet, request } = provider();
  request.mockResolvedValueOnce([other.address, owner.address]);
  await expect(
    signSafeTypedData(wallet, owner.address, data, tx.safeTxHash),
  ).rejects.toThrow("账户");
  expect(request).toHaveBeenCalledTimes(1);
});
it("reports unsupported typed signing without silently using another method", async () => {
  const { wallet, request } = provider(async () => {
    throw { code: 4200 };
  });
  await expect(
    signSafeTypedData(wallet, owner.address, data, tx.safeTxHash),
  ).rejects.toThrow("EIP-712");
  expect(
    request.mock.calls.filter(([call]) => call.method.startsWith("eth_sign")),
  ).toHaveLength(1);
});
it("blocks a network change during wallet confirmation", async () => {
  let signed = false;
  const request = vi.fn(async ({ method }: { method: string }) => {
    if (method === "eth_accounts") return [owner.address];
    if (method === "eth_chainId") return signed ? "0x38" : "0x61";
    signed = true;
    return owner.signTypedData(data);
  });
  await expect(
    signSafeTypedData(
      { request } as unknown as EIP1193Provider,
      owner.address,
      data,
      tx.safeTxHash,
    ),
  ).rejects.toThrow("网络");
});

it("recovers from the App bridge BigInt encoder failure using a verified Safe personal signature", async () => {
  const request = vi.fn(
    async ({ method, params }: { method: string; params?: unknown[] }) => {
      if (method === "eth_accounts") return [owner.address];
      if (method === "eth_chainId") return "0x61";
      if (method === "eth_signTypedData_v4")
        throw new TypeError(
          "Conversion from 'BigInt' to 'number' is not allowed.",
        );
      if (method === "personal_sign") {
        expect(params).toEqual([tx.safeTxHash, owner.address]);
        return owner.signMessage({ message: { raw: tx.safeTxHash } });
      }
      throw Error("Unexpected method");
    },
  );
  const wallet = { request } as unknown as EIP1193Provider;
  vi.stubGlobal("window", { drixOneWallet: { ethereum: wallet } });
  const confirmation = await signSafeTypedData(
    wallet,
    owner.address,
    data,
    tx.safeTxHash,
  );
  const { recoverSigner } = await import("./core");
  expect(await recoverSigner(tx, confirmation.signature)).toBe(owner.address);
  expect([31, 32]).toContain(
    Number.parseInt(confirmation.signature.slice(-2), 16),
  );
  expect(
    request.mock.calls.filter(([call]) => call.method === "personal_sign"),
  ).toHaveLength(1);
});
it("does not fall back for a browser wallet BigInt error", async () => {
  const { wallet, request } = provider(async () => {
    throw new TypeError("Cannot convert a BigInt value to a number");
  });
  await expect(
    signSafeTypedData(wallet, owner.address, data, tx.safeTxHash),
  ).rejects.toThrow("BigInt");
  expect(
    request.mock.calls.some(([call]) => call.method === "personal_sign"),
  ).toBe(false);
});
it("never retries an App user's rejection through another signing method", async () => {
  const { wallet, request } = provider(async () => {
    throw {
      code: 4001,
      message: "Conversion from 'BigInt' to 'number' is not allowed.",
    };
  });
  vi.stubGlobal("window", { drixOneWallet: { ethereum: wallet } });
  await expect(
    signSafeTypedData(wallet, owner.address, data, tx.safeTxHash),
  ).rejects.toThrow("取消");
  expect(
    request.mock.calls.some(([call]) => call.method === "personal_sign"),
  ).toBe(false);
});
it("rejects a different owner returned by the App personal-sign fallback", async () => {
  const request = vi.fn(async ({ method }: { method: string }) => {
    if (method === "eth_accounts") return [owner.address];
    if (method === "eth_chainId") return "0x61";
    if (method === "eth_signTypedData_v4")
      throw new TypeError("Cannot convert a BigInt value to a number");
    return other.signMessage({ message: { raw: tx.safeTxHash } });
  });
  const wallet = { request } as unknown as EIP1193Provider;
  vi.stubGlobal("window", { drixOneWallet: { ethereum: wallet } });
  await expect(
    signSafeTypedData(wallet, owner.address, data, tx.safeTxHash),
  ).rejects.toThrow("不匹配");
});
