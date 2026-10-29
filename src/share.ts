import { translateMessage } from "./i18n";
import { formatUnits, isAddress } from "viem";
import { decodeTransfer, type SafeInfo, type Tx } from "./core";
export type AppSharePayload = {
  chainid: string;
  chainType: "evm";
  safeAddress: string;
  to: string;
  threshold: number;
  owners: readonly string[];
  safeTxHash: string;
  amount: string;
  symbol: string;
  createAt: string;
  nonce: string;
};
export function appSharePayload(
  t: Tx,
  info: SafeInfo,
  symbol: string,
  token?: {
    symbol: string;
    decimals: number;
  },
): AppSharePayload {
  const transfer = decodeTransfer(t);
  if (!transfer) throw Error(translateMessage("ui.d47742336b"));
  if (transfer.token && !token) throw Error(translateMessage("ui.f36cd18ac2"));
  const date = new Date(t.createdAt);
  if (Number.isNaN(date.getTime()))
    throw Error(translateMessage("ui.93ad755004"));
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    chainid: String(t.chainId),
    chainType: "evm",
    safeAddress: t.safe,
    to: transfer.recipient,
    threshold: info.threshold,
    owners: info.owners,
    safeTxHash: t.safeTxHash,
    amount: formatUnits(transfer.amount, transfer.token ? token!.decimals : 18),
    symbol: transfer.token ? token!.symbol : symbol,
    createAt: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
    nonce: String(t.nonce),
  };
}
export async function appShare(
  t: Tx,
  info: SafeInfo,
  symbol: string,
  token?: {
    symbol: string;
    decimals: number;
  },
) {
  const payload = appSharePayload(t, info, symbol, token);
  const stream = new Blob([JSON.stringify(payload)])
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return JSON.stringify({
    type: "multisig-sign",
    data: btoa(binary).replaceAll("+", "-").replaceAll("/", "_"),
  });
}
export function appShareLink(envelope: string, origin: string) {
  const url = new URL("/transactions", origin);
  url.hash = new URLSearchParams({ share: envelope }).toString();
  return url.href;
}
function validatePayload(raw: unknown): AppSharePayload {
  if (!raw || typeof raw !== "object")
    throw Error(translateMessage("ui.f98e2eb682"));
  const p = raw as AppSharePayload;
  if (
    p.chainType !== "evm" ||
    !/^[1-9]\d*$/.test(p.chainid) ||
    !Number.isSafeInteger(Number(p.chainid))
  )
    throw Error(translateMessage("ui.448ca2b6bb"));
  if (
    !isAddress(p.safeAddress) ||
    !isAddress(p.to) ||
    !Array.isArray(p.owners) ||
    !p.owners.length ||
    !p.owners.every((a) => isAddress(a))
  )
    throw Error(translateMessage("ui.44af074f21"));
  if (
    !Number.isInteger(p.threshold) ||
    p.threshold < 1 ||
    p.threshold > p.owners.length
  )
    throw Error(translateMessage("ui.c0da258b1d"));
  if (
    typeof p.safeTxHash !== "string" ||
    !/^(0x)?[0-9a-fA-F]{64}$/.test(p.safeTxHash)
  )
    throw Error(translateMessage("ui.b3aace2966"));
  if (
    typeof p.nonce !== "string" ||
    !/^\d+$/.test(p.nonce) ||
    !Number.isSafeInteger(Number(p.nonce))
  )
    throw Error(translateMessage("ui.53e1348f02"));
  if (
    typeof p.amount !== "string" ||
    !/^\d+(\.\d+)?$/.test(p.amount) ||
    typeof p.symbol !== "string" ||
    typeof p.createAt !== "string"
  )
    throw Error(translateMessage("ui.800fea4cb1"));
  return {
    ...p,
    safeTxHash: p.safeTxHash.startsWith("0x")
      ? p.safeTxHash
      : `0x${p.safeTxHash}`,
  };
}
export async function parseShare(raw: string): Promise<AppSharePayload> {
  if (raw.length > 131072) throw Error(translateMessage("ui.2ab13b8296"));
  let text = raw.trim();
  if (/^https?:\/\//i.test(text)) {
    const url = new URL(text);
    const embedded =
      new URLSearchParams(url.hash.slice(1)).get("share") ||
      url.searchParams.get("share");
    if (!embedded) throw Error(translateMessage("ui.2223a599d1"));
    text = embedded;
  }
  const envelope = JSON.parse(text);
  // Also accept the decoded MultisigTxBasicsData JSON exported by an App tool.
  if (envelope?.chainType === "evm" && envelope.safeAddress)
    return validatePayload(envelope);
  if (envelope?.type !== "multisig-sign" || typeof envelope.data !== "string")
    throw Error(translateMessage("ui.4b57bf6408"));
  const base64 = envelope.data.replaceAll("-", "+").replaceAll("_", "/");
  const bytes = Uint8Array.from(
    atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")),
    (c) => c.charCodeAt(0),
  );
  const reader = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream("gzip"))
    .getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 65536) throw Error(translateMessage("ui.2455edb6b3"));
      chunks.push(value);
    }
  } finally {
    await reader.cancel();
  }
  const combined = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(combined);
  return validatePayload(JSON.parse(decoded));
}
