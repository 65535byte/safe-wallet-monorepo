import { translateMessage } from "../../i18n";
import {
  decodeAbiParameters,
  decodeFunctionData,
  parseAbi,
  keccak256,
  stringToHex,
  type Address,
  type Hex,
} from "viem";
import { abi, client, type Settings } from "../../core";
export type ChainRecord = {
  safe: Address;
  chainId: number;
  safeTxHash: Hex;
  transactionHash: Hex;
  blockNumber: bigint;
  blockHash: Hex;
  logIndex: number;
  success: boolean;
};
export type HistoryPage = {
  records: ChainRecord[];
  from: bigint;
  to: bigint;
  next: bigint | null;
};
export const executionTopics = {
  success: keccak256(stringToHex("ExecutionSuccess(bytes32,uint256)")),
  failure: keccak256(stringToHex("ExecutionFailure(bytes32,uint256)")),
};
export const executionEvents = parseAbi([
  "event ExecutionSuccess(bytes32 txHash, uint256 payment)",
  "event ExecutionFailure(bytes32 txHash, uint256 payment)",
]);
export function shouldScanHistory(count: number, nonce?: number) {
  const target =
    nonce !== undefined && Number.isSafeInteger(nonce) && nonce >= 0
      ? Math.min(20, nonce)
      : 20;
  return count < target;
}
type Log = {
  address: Address;
  topics: readonly Hex[];
  data: Hex;
  blockNumber: bigint | null;
  blockHash: Hex | null;
  transactionHash: Hex | null;
  logIndex: number | null;
  removed?: boolean;
};
export function decodeExecution(
  log: Log,
  safe: Address,
  chainId: number,
): ChainRecord | null {
  if (
    log.removed ||
    log.address.toLowerCase() !== safe.toLowerCase() ||
    log.blockNumber === null ||
    !log.transactionHash ||
    !log.blockHash ||
    log.logIndex === null
  )
    return null;
  const topic = log.topics[0];
  if (topic !== executionTopics.success && topic !== executionTopics.failure)
    return null;
  let hash: Hex;
  try {
    if (log.topics.length === 2) {
      hash = log.topics[1];
      decodeAbiParameters([{ type: "uint256" }], log.data);
    } else if (log.topics.length === 1) {
      hash = decodeAbiParameters(
        [{ type: "bytes32" }, { type: "uint256" }],
        log.data,
      )[0];
    } else return null;
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) return null;
  } catch {
    return null;
  }
  return {
    safe,
    chainId,
    safeTxHash: hash,
    transactionHash: log.transactionHash,
    blockNumber: log.blockNumber,
    blockHash: log.blockHash,
    logIndex: log.logIndex,
    success: topic === executionTopics.success,
  };
}
export function rangeLimited(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /block.{0,40}(range|limit|distance)|range.{0,40}(limit|wide|large|exceed)|too many (results|blocks)|query returned more|response size|log response size|-32005|exceed.{0,50}(block|limit)|maximum.{0,40}block|limited to/i.test(
    message,
  );
}
export async function readLogRange<T>(
  get: (from: bigint, to: bigint) => Promise<T[]>,
  from: bigint,
  to: bigint,
  signal?: AbortSignal,
): Promise<T[]> {
  signal?.throwIfAborted();
  try {
    return await get(from, to);
  } catch (e) {
    signal?.throwIfAborted();
    if (from === to || !rangeLimited(e)) throw e;
    const mid = (from + to) / 2n;
    const left = await readLogRange(get, from, mid, signal);
    const right = await readLogRange(get, mid + 1n, to, signal);
    return [...left, ...right];
  }
}
export async function queryHistoryPage(
  s: Settings,
  safe: Address,
  upper: bigint | undefined,
  signal?: AbortSignal,
): Promise<HistoryPage> {
  const c = client(s);
  const actualChainId = await c.getChainId();
  if (actualChainId !== s.chainId)
    throw Error(
      translateMessage("ui.8a91f73596", { p0: s.chainId, p1: actualChainId }),
    );
  const head = upper ?? (await c.getBlockNumber());
  const floor = BigInt(s.fromBlock || "0");
  if (floor < 0n || floor > head)
    throw Error(translateMessage("ui.d3322f137d"));
  const from = head - floor >= 49999n ? head - 49999n : floor;
  const logs = await readLogRange(
    (start, end) =>
      c.getLogs({
        address: safe,
        events: executionEvents,
        strict: false,
        fromBlock: start,
        toBlock: end,
      }),
    from,
    head,
    signal,
  );
  const records: ChainRecord[] = [];
  for (const log of logs) {
    const decoded = decodeExecution(log, safe, s.chainId);
    if (decoded) records.push(decoded);
  }
  records.sort((a, b) =>
    a.blockNumber === b.blockNumber
      ? b.logIndex - a.logIndex
      : a.blockNumber > b.blockNumber
        ? -1
        : 1,
  );
  return { records, from, to: head, next: from > floor ? from - 1n : null };
}
export function uniqueRecords(pages: HistoryPage[]) {
  const records = new Map<string, ChainRecord>();
  for (const page of pages)
    for (const row of page.records)
      records.set(
        `${row.chainId}:${row.safe.toLowerCase()}:${row.transactionHash}:${row.logIndex}`,
        row,
      );
  return [...records.values()].sort((a, b) =>
    a.blockNumber === b.blockNumber
      ? b.logIndex - a.logIndex
      : a.blockNumber > b.blockNumber
        ? -1
        : 1,
  );
}
export async function loadRecordDetail(s: Settings, row: ChainRecord) {
  if (row.chainId !== s.chainId) throw Error(translateMessage("ui.2cb4b3d12a"));
  const c = client(s);
  const [tx, block, receipt] = await Promise.all([
    c.getTransaction({ hash: row.transactionHash }),
    c.getBlock({ blockHash: row.blockHash }),
    c.getTransactionReceipt({ hash: row.transactionHash }),
  ]);
  if (
    receipt.blockHash !== row.blockHash ||
    block.hash !== row.blockHash ||
    tx.blockHash !== row.blockHash ||
    receipt.status !== "success" ||
    !receipt.logs.some(
      (log) =>
        log.address.toLowerCase() === row.safe.toLowerCase() &&
        log.logIndex === row.logIndex &&
        decodeExecution(log, row.safe, row.chainId)?.safeTxHash ===
          row.safeTxHash &&
        decodeExecution(log, row.safe, row.chainId)?.success === row.success,
    )
  )
    throw Error(translateMessage("ui.3cdca2d8ea"));
  let call:
    | {
        to: Address;
        value: string;
        data: Hex;
        operation: number;
      }
    | undefined;
  if (tx.to?.toLowerCase() === row.safe.toLowerCase()) {
    try {
      const decoded = decodeFunctionData({ abi, data: tx.input });
      if (decoded.functionName === "execTransaction") {
        call = {
          to: decoded.args[0],
          value: decoded.args[1].toString(),
          data: decoded.args[2],
          operation: decoded.args[3],
        };
      }
    } catch {}
  }
  return {
    executor: tx.from,
    timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
    call,
  };
}
