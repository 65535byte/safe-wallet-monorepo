import { translateMessage } from "../../i18n";
import type { Tx } from "../../core";
export function proposalNonce(
  chainNonce: number,
  requested: number,
  pending: Tx[],
  policy: string,
): number {
  if (!Number.isSafeInteger(requested) || requested < chainNonce)
    throw Error(translateMessage("ui.049149b9b2"));
  const active = pending.filter((t) => !t.isExecuted && t.nonce >= chainNonce);
  if (policy === "queue") {
    const next = Math.max(chainNonce - 1, ...active.map((t) => t.nonce)) + 1;
    if (!Number.isSafeInteger(next))
      throw Error(translateMessage("ui.cf13e07c7a"));
    return next;
  }
  if (policy !== "replace" && active.some((t) => t.nonce === requested))
    throw Error(translateMessage("ui.2f04aeb68d"));
  return requested;
}
export type NoncePolicy = "direct" | "replace" | "queue";
export async function resolveProposalNonce(
  chainNonce: number,
  requested: number,
  pending: Tx[],
  canReplace: boolean,
  choose: (conflict: {
    nonce: number;
    queueNonce: number;
    canReplace: boolean;
  }) => Promise<"replace" | "queue" | null>,
): Promise<{
  nonce: number;
  policy: NoncePolicy;
} | null> {
  // Validate the requested nonce even if the user later chooses to queue.
  proposalNonce(chainNonce, requested, [], "direct");
  if (!pending.some((t) => !t.isExecuted && t.nonce === requested))
    return { nonce: requested, policy: "direct" };
  const queueNonce = proposalNonce(chainNonce, requested, pending, "queue");
  const policy = await choose({ nonce: requested, queueNonce, canReplace });
  if (policy === null) return null;
  if (policy === "replace" && !canReplace)
    throw Error(translateMessage("ui.b562d8a39f"));
  return { nonce: policy === "queue" ? queueNonce : requested, policy };
}
