import { expect, it } from "vitest";
import { encodeFunctionData } from "viem";
import { appShare, appSharePayload, appShareLink, parseShare } from "./share";
import { draft, erc20, type Tx } from "./core";
import { defaults } from "./storage";
import flutterEnvelope from "./fixtures/flutter-multisig-share.json";
const a = "0x1111111111111111111111111111111111111111";
const b = "0x2222222222222222222222222222222222222222";
const info = {
  owners: [a, b] as const,
  threshold: 2,
  nonce: 5,
  balance: 0n,
  version: "1.4.1",
};
const tx = {
  ...draft(defaults, a, b, "1250000000000000000", "0x", 5),
  createdAt: new Date(2026, 9, 23, 20, 0, 0).toISOString(),
};
it("matches MultisigTxBasicsData.toJson fields without signatures or Web-only transaction fields", () => {
  const payload = appSharePayload(tx, info, "tBNB");
  expect(payload).toEqual({
    chainid: "97",
    chainType: "evm",
    safeAddress: a,
    to: b,
    threshold: 2,
    owners: [a, b],
    safeTxHash: tx.safeTxHash,
    amount: "1.25",
    symbol: "tBNB",
    createAt: "2026-10-23 20:00:00",
    nonce: "5",
  });
  expect(payload).not.toHaveProperty("signatures");
  expect(payload).not.toHaveProperty("confirmations");
  expect(payload).not.toHaveProperty("value");
});
it("decodes a fixture produced with the actual Dart gzip/base64Url codecs", async () => {
  const payload = await parseShare(JSON.stringify(flutterEnvelope));
  expect(payload).toMatchObject({
    chainid: "97",
    safeAddress: a,
    to: b,
    amount: "1.25",
    createAt: "2026-10-23 20:00:00",
    nonce: "5",
  });
});
it("uses the same App envelope in the share code, JSON file, and link", async () => {
  const code = await appShare(tx, info, "tBNB");
  const json = JSON.stringify(JSON.parse(code), null, 2);
  const link = appShareLink(code, "https://wallet.example");
  expect(new URL(link).pathname).toBe("/transactions");
  expect(new URLSearchParams(new URL(link).hash.slice(1)).get("share")).toBe(
    code,
  );
  expect(await parseShare(code)).toEqual(await parseShare(json));
  expect(await parseShare(link)).toEqual(await parseShare(code));
  expect(
    await parseShare(JSON.stringify(appSharePayload(tx, info, "tBNB"))),
  ).toEqual(await parseShare(code));
});
it("exports the ERC20 recipient and decimal amount rather than the token contract or raw units", () => {
  const tokenTx: Tx = {
    ...tx,
    to: a,
    value: "0",
    data: encodeFunctionData({
      abi: erc20,
      functionName: "transfer",
      args: [b, 1250000n],
    }),
  };
  expect(
    appSharePayload(tokenTx, info, "tBNB", { symbol: "USDT", decimals: 6 }),
  ).toMatchObject({ to: b, amount: "1.25", symbol: "USDT" });
  expect(() => appSharePayload(tokenTx, info, "tBNB")).toThrow("代币精度");
});
it("normalizes Flutter hashes without 0x and rejects invalid share network or hash", async () => {
  const payload = appSharePayload(tx, info, "tBNB");
  expect(
    (
      await parseShare(
        JSON.stringify({ ...payload, safeTxHash: payload.safeTxHash.slice(2) }),
      )
    ).safeTxHash,
  ).toBe(tx.safeTxHash);
  await expect(
    parseShare(JSON.stringify({ ...payload, chainType: "bitcoin" })),
  ).rejects.toThrow();
  await expect(
    parseShare(JSON.stringify({ ...payload, safeTxHash: "0x123" })),
  ).rejects.toThrow("哈希");
  await expect(
    parseShare("https://wallet.example/transactions?tx=0x123"),
  ).rejects.toThrow("没有");
});
