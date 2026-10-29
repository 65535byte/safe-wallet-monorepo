import { afterEach, expect, it, vi } from "vitest";
import { draft, SafeTransactionApi } from "../../core";
import { defaults } from "../../storage";
import { submitProposal } from "./submit";
const owner = "0x1111111111111111111111111111111111111111";
const tx = draft(
  defaults,
  owner,
  "0x2222222222222222222222222222222222222222",
  "1000000000000000000",
  "0x",
  0,
);
afterEach(() => vi.unstubAllGlobals());
it("posts a Flutter-compatible signed payload and reads back before success", async () => {
  const signature = `0x${"11".repeat(65)}` as const;
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response(null, { status: 201 }))
    .mockResolvedValueOnce(
      Response.json({ ...tx, confirmations: [{ owner, signature }] }),
    );
  vi.stubGlobal("fetch", fetch);
  const verify = vi.fn().mockResolvedValue(undefined);
  const result = await submitProposal(
    new SafeTransactionApi("https://example.org"),
    tx,
    owner,
    verify,
    signature,
  );
  const payload = JSON.parse(fetch.mock.calls[0][1].body);
  expect(payload).toMatchObject({
    sender: owner,
    signature,
    nonce: "0",
    value: tx.value,
    contractTransactionHash: tx.safeTxHash,
  });
  expect(payload.data).toBeUndefined();
  expect(fetch.mock.calls[1][0]).toContain(
    `/api/v2/multisig-transactions/${tx.safeTxHash}/`,
  );
  expect(verify).toHaveBeenCalledOnce();
  expect(result.submitted).toBe(true);
  expect(result.confirmations).toHaveLength(1);
});
it.each(["zh-CN", "en"])(
  "recovers an already-existing proposal by verified readback in %s",
  async (language) => {
    vi.stubGlobal("window", { localStorage: { getItem: () => language } });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response("already exists", { status: 422 }))
        .mockResolvedValueOnce(Response.json(tx)),
    );
    const verify = vi.fn().mockResolvedValue(undefined);
    expect(
      (
        await submitProposal(
          new SafeTransactionApi("https://example.org"),
          tx,
          owner,
          verify,
        )
      ).submitted,
    ).toBe(true);
    expect(verify).toHaveBeenCalledOnce();
  },
);
it("does not treat failed submissions as saved proposals", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue(new Response("invalid hash", { status: 422 }));
  vi.stubGlobal("fetch", fetch);
  await expect(
    submitProposal(
      new SafeTransactionApi("https://example.org"),
      tx,
      owner,
      vi.fn(),
    ),
  ).rejects.toThrow("invalid hash");
  expect(fetch).toHaveBeenCalledOnce();
});
it("rejects service readback with a different proposal hash", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(
        Response.json({ ...tx, safeTxHash: `0x${"ab".repeat(32)}` }),
      ),
  );
  await expect(
    submitProposal(
      new SafeTransactionApi("https://example.org"),
      tx,
      owner,
      vi.fn(),
    ),
  ).rejects.toThrow("哈希不匹配");
});
it("propagates readback verification failure", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(Response.json(tx)),
  );
  await expect(
    submitProposal(
      new SafeTransactionApi("https://example.org"),
      tx,
      owner,
      vi.fn().mockRejectedValue(Error("交易内容不匹配")),
    ),
  ).rejects.toThrow("交易内容不匹配");
});
