import { expect, it, vi } from "vitest";
import { draft } from "../../core";
import { defaults } from "../../storage";
import { proposalNonce, resolveProposalNonce } from "./proposal-nonce";
const a = "0x1111111111111111111111111111111111111111";
const pending = [
  draft(defaults, a, a, "1", "0x", 3),
  draft(defaults, a, a, "1", "0x", 5),
];
it("requires an explicit choice for competing proposals", () => {
  expect(() => proposalNonce(3, 3, pending, "direct")).toThrow("已有待签");
  expect(proposalNonce(3, 3, pending, "replace")).toBe(3);
});
it("queues after every pending nonce, and starts at chain nonce for an empty queue", () => {
  expect(proposalNonce(3, 3, pending, "queue")).toBe(6);
  expect(proposalNonce(3, 3, [], "queue")).toBe(3);
  expect(
    proposalNonce(
      3,
      3,
      pending.map((t) => ({ ...t, isExecuted: true })),
      "queue",
    ),
  ).toBe(3);
});
it("rejects consumed and invalid nonces", () => {
  expect(() => proposalNonce(3, 2, pending, "replace")).toThrow();
  expect(() => proposalNonce(3, NaN, pending, "queue")).toThrow();
});

it("continues without a conflict dialog when the nonce is free", async () => {
  const choose = vi.fn();
  expect(await resolveProposalNonce(3, 4, pending, false, choose)).toEqual({
    nonce: 4,
    policy: "direct",
  });
  expect(choose).not.toHaveBeenCalled();
});
it("asks only on conflict and cancels without selecting a nonce", async () => {
  const choose = vi.fn().mockResolvedValue(null);
  expect(await resolveProposalNonce(3, 3, pending, true, choose)).toBeNull();
  expect(choose).toHaveBeenCalledWith({
    nonce: 3,
    queueNonce: 6,
    canReplace: true,
  });
});
it("matches App replace and queue choices and requires an owner for replacement", async () => {
  expect(
    await resolveProposalNonce(
      3,
      3,
      pending,
      true,
      vi.fn().mockResolvedValue("replace"),
    ),
  ).toEqual({ nonce: 3, policy: "replace" });
  expect(
    await resolveProposalNonce(
      3,
      3,
      pending,
      false,
      vi.fn().mockResolvedValue("queue"),
    ),
  ).toEqual({ nonce: 6, policy: "queue" });
  await expect(
    resolveProposalNonce(
      3,
      3,
      pending,
      false,
      vi.fn().mockResolvedValue("replace"),
    ),
  ).rejects.toThrow("管理者钱包");
});
