import { signSafeTypedData } from "./wallet-signing";
import { translateMessage } from "./i18n";
import { SafeProtocolService } from "./protocol";
import {
  createPublicClient,
  defineChain,
  createWalletClient,
  custom,
  http,
  webSocket,
  parseAbi,
  getAddress,
  isAddress,
  hashTypedData,
  recoverTypedDataAddress,
  recoverMessageAddress,
  keccak256,
  stringToHex,
  zeroAddress,
  type Address,
  type Hex,
  type EIP1193Provider,
  type Chain,
  decodeFunctionData,
} from "viem";
import { mainnet, sepolia, bscTestnet, bsc, base, arbitrum } from "viem/chains";
// Metadata matches the existing App chain configuration (chainId 8379).
const fusn = defineChain({
  id: 8379,
  name: "Fusn Chain",
  nativeCurrency: { name: "FUSN", symbol: "FUSN", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.fusn.info/", "https://rpc.fusn.network/"] },
  },
  blockExplorers: {
    default: { name: "Fusn Scan", url: "https://scan.fusn.network" },
  },
});
export const chains = [bscTestnet, bsc, fusn, sepolia, mainnet, base, arbitrum];
export type Settings = {
  chainId: number;
  rpc: string;
  api: string;
  fromBlock: string;
};
export type SafeInfo = {
  owners: readonly Address[];
  threshold: number;
  nonce: number;
  balance: bigint;
  version: string;
};
export type Tx = {
  safe: Address;
  chainId: number;
  to: Address;
  value: string;
  data: Hex;
  operation: number;
  safeTxGas: string;
  baseGas: string;
  gasPrice: string;
  gasToken: Address;
  refundReceiver: Address;
  nonce: number;
  safeTxHash: Hex;
  createdAt: string;
  confirmations: {
    owner: Address;
    signature: Hex;
  }[];
  isExecuted?: boolean;
  transactionHash?: Hex;
  submitted?: boolean;
  id?: number;
};
export const abi = parseAbi([
  "function getOwners() view returns (address[])",
  "function getThreshold() view returns (uint256)",
  "function nonce() view returns (uint256)",
  "function VERSION() view returns (string)",
  "function getTransactionHash(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 _nonce) view returns (bytes32)",
  "function execTransaction(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,bytes signatures) payable returns (bool success)",
  "event ExecutionSuccess(bytes32 indexed txHash,uint256 payment)",
  "event ExecutionFailure(bytes32 indexed txHash,uint256 payment)",
]);
export const erc20 = parseAbi([
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address,uint256) returns (bool)",
]);
export const short = (s: string) =>
  s ? `${s.slice(0, 6)}…${s.slice(-4)}` : "—";
export function client(s: Settings) {
  return createPublicClient({
    chain: chains.find((c) => c.id === s.chainId) as Chain,
    transport: /^wss?:\/\//i.test(s.rpc)
      ? webSocket(s.rpc)
      : http(s.rpc || undefined),
  });
}
export function address(s: string): Address {
  if (!isAddress(s)) throw Error(translateMessage("ui.ff7733f7e4"));
  return getAddress(s);
}
export async function loadSafe(s: Settings, a: Address): Promise<SafeInfo> {
  const c = client(s);
  const [owners, threshold, nonce, balance, version] = await Promise.all([
    c.readContract({ address: a, abi, functionName: "getOwners" }),
    c.readContract({ address: a, abi, functionName: "getThreshold" }),
    c.readContract({ address: a, abi, functionName: "nonce" }),
    c.getBalance({ address: a }),
    c.readContract({ address: a, abi, functionName: "VERSION" }),
  ]);
  if (!["1.3.0", "1.4.1"].includes(version))
    throw Error(translateMessage("ui.c7c85c44d2", { p0: version }));
  if (nonce > BigInt(Number.MAX_SAFE_INTEGER))
    throw Error(translateMessage("ui.03ea042ec9"));
  return {
    owners,
    threshold: Number(threshold),
    nonce: Number(nonce),
    balance,
    version,
  };
}
export function active(txs: Tx[], nonce: number) {
  const valid = txs.filter((t) => !t.isExecuted && t.nonce >= nonce);
  const current = valid
    .filter((t) => t.nonce === nonce)
    .sort(
      (a, b) =>
        Date.parse(b.createdAt) - Date.parse(a.createdAt) ||
        (b.id ?? 0) - (a.id ?? 0),
    )[0];
  return [
    ...(current ? [current] : []),
    ...valid
      .filter((t) => t.nonce > nonce)
      .sort(
        (a, b) =>
          a.nonce - b.nonce ||
          Date.parse(a.createdAt) - Date.parse(b.createdAt) ||
          (a.id ?? 0) - (b.id ?? 0),
      ),
  ];
}
export function args(t: Tx) {
  return [
    t.to,
    BigInt(t.value),
    t.data,
    t.operation,
    BigInt(t.safeTxGas),
    BigInt(t.baseGas),
    BigInt(t.gasPrice),
    t.gasToken,
    t.refundReceiver,
    BigInt(t.nonce),
  ] as const;
}
export function typed(t: Tx) {
  return {
    domain: { chainId: t.chainId, verifyingContract: t.safe },
    types: {
      SafeTx: [
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes" },
        { name: "operation", type: "uint8" },
        { name: "safeTxGas", type: "uint256" },
        { name: "baseGas", type: "uint256" },
        { name: "gasPrice", type: "uint256" },
        { name: "gasToken", type: "address" },
        { name: "refundReceiver", type: "address" },
        { name: "nonce", type: "uint256" },
      ],
    },
    primaryType: "SafeTx" as const,
    message: {
      to: t.to,
      value: BigInt(t.value),
      data: t.data,
      operation: t.operation,
      safeTxGas: BigInt(t.safeTxGas),
      baseGas: BigInt(t.baseGas),
      gasPrice: BigInt(t.gasPrice),
      gasToken: t.gasToken,
      refundReceiver: t.refundReceiver,
      nonce: BigInt(t.nonce),
    },
  };
}
export async function verify(s: Settings, t: Tx) {
  if (t.chainId !== s.chainId) throw Error(translateMessage("ui.2cb4b3d12a"));
  if (t.operation !== 0) throw Error(translateMessage("ui.003d3c3dc0"));
  const hash = hashTypedData(typed(t));
  const version = await client(s).readContract({
    address: t.safe,
    abi,
    functionName: "VERSION",
  });
  if (SafeProtocolService.hash(t, version).toLowerCase() !== hash.toLowerCase())
    throw Error(translateMessage("ui.111f726a37"));
  const onchain = await client(s).readContract({
    address: t.safe,
    abi,
    functionName: "getTransactionHash",
    args: args(t),
  });
  if (
    hash.toLowerCase() !== t.safeTxHash.toLowerCase() ||
    onchain.toLowerCase() !== hash.toLowerCase()
  )
    throw Error(translateMessage("ui.239c45f7c2"));
  return hash;
}
export function draft(
  s: Settings,
  safe: Address,
  to: Address,
  value: string,
  data: Hex,
  nonce: number,
): Tx {
  const t: Tx = {
    safe,
    chainId: s.chainId,
    to,
    value,
    data,
    nonce,
    operation: 0,
    safeTxGas: "0",
    baseGas: "0",
    gasPrice: "0",
    gasToken: zeroAddress,
    refundReceiver: zeroAddress,
    safeTxHash: "0x",
    createdAt: new Date().toISOString(),
    confirmations: [],
    submitted: false,
  };
  t.safeTxHash = hashTypedData(typed(t));
  return t;
}
export async function wallet(provider: EIP1193Provider, s: Settings) {
  const w = createWalletClient({ transport: custom(provider) });
  const [account] = await w.requestAddresses();
  if (!account) throw Error(translateMessage("ui.5b22934299"));
  const id = await w.getChainId();
  if (id !== s.chainId) await w.switchChain({ id: s.chainId });
  return { w, account };
}
export async function sign(provider: EIP1193Provider, s: Settings, t: Tx) {
  await verify(s, t);
  const info = await loadSafe(s, t.safe);
  if (t.nonce < info.nonce) throw Error(translateMessage("ui.619492a3f5"));
  const { account } = await wallet(provider, s);
  if (!info.owners.some((a) => a.toLowerCase() === account.toLowerCase()))
    throw Error(translateMessage("ui.990dc6c5a7"));
  return signSafeTypedData(provider, account, typed(t), t.safeTxHash);
}
export async function execute(provider: EIP1193Provider, s: Settings, t: Tx) {
  await verify(s, t);
  const info = await loadSafe(s, t.safe);
  if (t.nonce !== info.nonce) throw Error(translateMessage("ui.880c68ab76"));
  const signatures = await collectSignatures(t, info);
  const { w, account } = await wallet(provider, s);
  const c = client(s);
  const simulation = await c.simulateContract({
    address: t.safe,
    abi,
    functionName: "execTransaction",
    args: [...args(t).slice(0, 9), signatures] as [
      Address,
      bigint,
      Hex,
      number,
      bigint,
      bigint,
      bigint,
      Address,
      Address,
      Hex,
    ],
    account,
  });
  if (!simulation.result) throw Error(translateMessage("ui.ffb29c5968"));
  const hash = await w.writeContract({ ...simulation.request, chain: c.chain });
  const receipt = await c.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success")
    throw Error(translateMessage("ui.ee47c38929"));
  if (
    receipt.logs.some(
      (log) =>
        log.address.toLowerCase() === t.safe.toLowerCase() &&
        log.topics[0] ===
          keccak256(stringToHex("ExecutionFailure(bytes32,uint256)")),
    )
  )
    throw Error(translateMessage("ui.9a4155b4eb") + hash);
  return hash;
}
export async function collectSignatures(t: Tx, info: SafeInfo) {
  const confirmed = new Map<string, Hex>();
  for (const c of t.confirmations) {
    const owner = await recoverSigner(t, c.signature);
    if (
      owner.toLowerCase() !== c.owner.toLowerCase() ||
      !info.owners.some((a) => a.toLowerCase() === owner.toLowerCase())
    )
      throw Error(translateMessage("ui.2334593a24"));
    confirmed.set(owner.toLowerCase(), c.signature);
  }
  if (confirmed.size < info.threshold)
    throw Error(translateMessage("ui.f82ec9d1d6"));
  const signatures = ("0x" +
    [...confirmed]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(0, info.threshold)
      .map(([, v]) => v.slice(2))
      .join("")) as Hex;
  return signatures;
}
export class MultisigServiceError extends Error {
  constructor(
    public readonly status: number,
    public readonly responseBody: string,
  ) {
    super(translateMessage("ui.c646e61b01", { p0: status, p1: responseBody }));
    this.name = "MultisigServiceError";
  }
}
export class SafeTransactionApi {
  constructor(private base: string) {}
  async request(path: string, body?: unknown) {
    if (!this.base) throw Error(translateMessage("ui.a0961f2a49"));
    const r = await fetch(this.base.replace(/\/$/, "") + path, {
      method: body ? "POST" : "GET",
      headers: body
        ? { Accept: "application/json", "Content-Type": "application/json" }
        : { Accept: "application/json" },
      cache: "no-store",
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(20000),
    });
    if (!r.ok)
      throw new MultisigServiceError(r.status, (await r.text()).slice(0, 200));
    return r.status === 204 || r.headers.get("content-length") === "0"
      ? null
      : r.text().then((t) => (t ? JSON.parse(t) : null));
  }
  async list(safe: Address, chainId: number, nonce = 0) {
    const all: Tx[] = [];
    let offset = 0;
    for (let page = 0; page < 100; page++) {
      const r = await this.request(
        `/api/v2/safes/${safe}/multisig-transactions/?trusted=false&nonce__gte=${nonce}&limit=200&offset=${offset}`,
      );
      const rows = r.results ?? [];
      all.push(...rows.map((t: unknown) => normalizeTx(t, safe, chainId)));
      if (!r.next) return all;
      if (!rows.length) throw Error(translateMessage("ui.80994a2a97"));
      offset += rows.length;
    }
    throw Error(translateMessage("ui.c23afabdc5"));
  }
  async propose(t: Tx, sender: Address, signature?: Hex) {
    await this.request(`/api/v2/safes/${t.safe}/multisig-transactions/`, {
      safe: t.safe,
      to: t.to,
      value: t.value,
      ...(t.data !== "0x" ? { data: t.data } : {}),
      operation: t.operation,
      safeTxGas: t.safeTxGas,
      baseGas: t.baseGas,
      gasPrice: t.gasPrice,
      gasToken: t.gasToken,
      refundReceiver: t.refundReceiver,
      nonce: String(t.nonce),
      contractTransactionHash: t.safeTxHash,
      sender,
      ...(signature ? { signature } : {}),
    });
  }
  async confirm(t: Tx, signature: Hex) {
    const hash = t.safeTxHash.startsWith("0x")
      ? t.safeTxHash
      : `0x${t.safeTxHash}`;
    if (!/^0x[0-9a-fA-F]{64}$/.test(hash))
      throw Error(translateMessage("ui.1adc0afa3c"));
    const encodedSignature = signature.startsWith("0x")
      ? signature
      : `0x${signature}`;
    if (!/^0x([0-9a-fA-F]{2})+$/.test(encodedSignature))
      throw Error(translateMessage("ui.f675a50018"));
    await this.request(`/api/v1/multisig-transactions/${hash}/confirmations/`, {
      signature: encodedSignature,
    });
  }
}
export async function recoverSigner(t: Tx, signature: Hex) {
  if (!/^0x[0-9a-fA-F]{130}$/.test(signature))
    throw Error(translateMessage("ui.d5685c59b6"));
  const v = Number.parseInt(signature.slice(-2), 16);
  if (v === 31 || v === 32)
    return recoverMessageAddress({
      message: { raw: t.safeTxHash },
      signature: (signature.slice(0, -2) +
        (v - 4).toString(16).padStart(2, "0")) as Hex,
    });
  return recoverTypedDataAddress({ ...typed(t), signature });
}
export function normalizeTx(raw: unknown, safe: Address, chainId: number): Tx {
  if (!raw || typeof raw !== "object")
    throw Error(translateMessage("ui.a983c97e16"));
  const r = raw as Record<string, unknown>;
  if (r.safe && address(String(r.safe)).toLowerCase() !== safe.toLowerCase())
    throw Error(translateMessage("ui.e7721e4ff7"));
  const nonce = Number(r.nonce);
  if (!Number.isSafeInteger(nonce) || nonce < 0)
    throw Error(translateMessage("ui.42d13653d2"));
  const uint = (key: string) => {
    const value = String(r[key]);
    if (!/^\d+$/.test(value) || BigInt(value) >= 2n ** 256n)
      throw Error(translateMessage("ui.aee21a7991", { p0: key }));
    return value;
  };
  const data = (r.data ?? "0x") as Hex;
  if (!/^0x([0-9a-fA-F]{2})*$/.test(data))
    throw Error(translateMessage("ui.c1d769ee8a"));
  const hash = String(r.safeTxHash) as Hex;
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash))
    throw Error(translateMessage("ui.4a30ccd91b"));
  const operation = Number(r.operation);
  if (![0, 1].includes(operation))
    throw Error(translateMessage("ui.f4e7d42088"));
  const createdAt = String(
    r.submissionDate ?? r.createdAt ?? "1970-01-01T00:00:00.000Z",
  );
  if (Number.isNaN(Date.parse(createdAt)))
    throw Error(translateMessage("ui.31fe9b9319"));
  const confirmations = (Array.isArray(r.confirmations) ? r.confirmations : [])
    .filter((c) => typeof c.signature === "string" && c.signature)
    .map((c) => ({
      owner: address(String(c.owner)),
      signature: c.signature as Hex,
    }));
  return {
    safe,
    chainId,
    to: address(String(r.to)),
    value: uint("value"),
    data,
    operation,
    safeTxGas: uint("safeTxGas"),
    baseGas: uint("baseGas"),
    gasPrice: uint("gasPrice"),
    gasToken: address(String(r.gasToken)),
    refundReceiver: address(String(r.refundReceiver)),
    nonce,
    safeTxHash: hash,
    createdAt: new Date(createdAt).toISOString(),
    confirmations,
    isExecuted: r.isExecuted === true,
    submitted: true,
    id: typeof r.id === "number" ? r.id : undefined,
    transactionHash: r.transactionHash as Hex | undefined,
  };
}
export function decodeTransfer(
  t: Pick<Tx, "to" | "value" | "data" | "operation">,
): {
  recipient: Address;
  amount: bigint;
  token?: Address;
} | null {
  if (t.operation !== 0) return null;
  if (t.data === "0x") return { recipient: t.to, amount: BigInt(t.value) };
  if (
    BigInt(t.value) !== 0n ||
    t.data.length !== 138 ||
    !/^0xa9059cbb0{24}/i.test(t.data)
  )
    return null;
  try {
    const decoded = decodeFunctionData({ abi: erc20, data: t.data });
    if (decoded.functionName === "transfer")
      return {
        recipient: decoded.args[0],
        amount: decoded.args[1],
        token: t.to,
      };
  } catch {}
  return null;
}
