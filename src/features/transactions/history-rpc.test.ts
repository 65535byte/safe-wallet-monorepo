import { afterEach, describe, expect, it, vi } from "vitest";
import { encodeAbiParameters, type Address, type Hex } from "viem";
import {
  decodeExecution,
  executionTopics,
  loadRecordDetail,
  queryHistoryPage,
  shouldScanHistory,
} from "./chain-records";
const safe = "0x1111111111111111111111111111111111111111" as Address;
const hash = `0x${"ab".repeat(32)}` as Hex,
  blockHash = `0x${"cd".repeat(32)}` as Hex,
  txHash = `0x${"ef".repeat(32)}` as Hex;
const settings = {
  chainId: 97,
  rpc: "https://history.example",
  api: "",
  fromBlock: "0",
};
const rawLog = {
  address: safe,
  topics: [executionTopics.success, hash],
  data: encodeAbiParameters([{ type: "uint256" }], [0n]),
  blockNumber: "0x64",
  blockHash,
  transactionHash: txHash,
  logIndex: "0x0",
  transactionIndex: "0x0",
  removed: false,
};
const record = decodeExecution(
  { ...rawLog, blockNumber: 100n, logIndex: 0 },
  safe,
  97,
)!;
function mockRpc(overrides: Record<string, unknown> = {}) {
  const answers: Record<string, unknown> = {
    eth_chainId: "0x61",
    eth_getLogs: [rawLog],
    eth_getTransactionByHash: {
      hash: txHash,
      blockHash,
      blockNumber: "0x64",
      transactionIndex: "0x0",
      from: safe,
      to: safe,
      input: "0x",
      gas: "0x5208",
      gasPrice: "0x1",
      nonce: "0x0",
      value: "0x0",
      type: "0x0",
      v: "0x1b",
      r: hash,
      s: hash,
    },
    eth_getBlockByHash: {
      hash: blockHash,
      number: "0x64",
      timestamp: "0x100",
      transactions: [],
      gasLimit: "0x100000",
      gasUsed: "0x5208",
      size: "0x0",
      difficulty: "0x0",
      totalDifficulty: "0x0",
    },
    eth_getTransactionReceipt: {
      transactionHash: txHash,
      blockHash,
      blockNumber: "0x64",
      transactionIndex: "0x0",
      from: safe,
      to: safe,
      cumulativeGasUsed: "0x5208",
      gasUsed: "0x5208",
      effectiveGasPrice: "0x1",
      logs: [rawLog],
      status: "0x1",
      type: "0x0",
    },
    ...overrides,
  };
  const calls: { method: string; params: unknown[] }[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url: unknown, init: RequestInit) => {
      const request = JSON.parse(String(init.body));
      calls.push(request);
      if (!(request.method in answers))
        throw Error(`Unexpected RPC ${request.method}`);
      return Response.json({
        jsonrpc: "2.0",
        id: request.id,
        result: answers[request.method],
      });
    }),
  );
  return calls;
}
afterEach(() => vi.unstubAllGlobals());
describe("history address RPC integration", () => {
  it("filters logs by the selected Safe and both execution event signatures", async () => {
    const calls = mockRpc();
    const page = await queryHistoryPage(settings, safe, 100n);
    expect(page.records).toEqual([record]);
    expect(calls.find((c) => c.method === "eth_getLogs")?.params).toEqual([
      {
        address: safe,
        topics: [[executionTopics.success, executionTopics.failure]],
        fromBlock: "0x0",
        toBlock: "0x64",
      },
    ]);
    expect(page.next).toBeNull();
  });
  it("bounds automatic scanning by the known Safe nonce and first twenty records", () => {
    expect(shouldScanHistory(0, 0)).toBe(false);
    expect(shouldScanHistory(2, 3)).toBe(true);
    expect(shouldScanHistory(3, 3)).toBe(false);
    expect(shouldScanHistory(20, 100)).toBe(false);
    expect(shouldScanHistory(2, undefined)).toBe(true);
  });
  it("loads a verified receipt and execution timestamp directly from RPC", async () => {
    mockRpc();
    expect(await loadRecordDetail(settings, record)).toMatchObject({
      executor: safe,
      timestamp: new Date(256000).toISOString(),
    });
  });
  it("rejects records for another network before making RPC requests", async () => {
    const calls = mockRpc();
    await expect(
      loadRecordDetail({ ...settings, chainId: 56 }, record),
    ).rejects.toThrow("网络");
    expect(calls).toHaveLength(0);
  });
  it("rejects a stale block or mismatched execution result", async () => {
    mockRpc();
    await expect(
      loadRecordDetail(settings, { ...record, blockHash: hash }),
    ).rejects.toThrow("变更");
    await expect(
      loadRecordDetail(settings, { ...record, success: false }),
    ).rejects.toThrow("变更");
  });
  it("ignores malformed execution logs without hiding other valid records", () => {
    expect(
      decodeExecution(
        { ...rawLog, blockNumber: 100n, logIndex: 0, data: "0x" },
        safe,
        97,
      ),
    ).toBeNull();
    expect(
      decodeExecution(
        {
          ...rawLog,
          blockNumber: 100n,
          logIndex: 0,
          topics: [executionTopics.success],
        },
        safe,
        97,
      ),
    ).toBeNull();
  });
});
