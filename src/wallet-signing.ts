import {
  hashTypedData,
  recoverTypedDataAddress,
  recoverMessageAddress,
  toHex,
  type Address,
  type EIP1193Provider,
  type Hex,
} from "viem";
import type { typed } from "./core";
import { translateMessage } from "./i18n";

type SafeTypedData = ReturnType<typeof typed>;
async function assertWalletContext(
  provider: EIP1193Provider,
  account: Address,
  chainId: number,
) {
  const accounts = await provider.request({ method: "eth_accounts" });
  if (accounts[0]?.toLowerCase() !== account.toLowerCase())
    throw Error(translateMessage("wallet.accountChanged"));
  const chain = await provider.request({ method: "eth_chainId" });
  if (Number(chain) !== chainId)
    throw Error(translateMessage("wallet.chainChanged"));
}
export function safeSigningPayload(data: SafeTypedData) {
  return JSON.stringify(
    {
      ...data,
      domain: { ...data.domain, chainId: toHex(data.domain.chainId) },
      types: {
        EIP712Domain: [
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        ...data.types,
      },
    },
    (_key, value: unknown) =>
      typeof value === "bigint" ? value.toString() : value,
  );
}
export function isAppBigIntSigningError(
  provider: EIP1193Provider,
  error: unknown,
) {
  if (typeof window === "undefined") return false;
  const injected = window as unknown as {
    drixOneWallet?: { ethereum?: EIP1193Provider };
  };
  if (injected.drixOneWallet?.ethereum !== provider) return false;
  const message =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String(error.message)
        : String(error);
  const code =
    error && typeof error === "object" && "code" in error
      ? Number(error.code)
      : undefined;
  if (code === 4001) return false;
  return /conversion from ['"]?bigint['"]? to ['"]?number['"]? is not allowed|cannot convert a bigint value to a number|can.t convert bigint to number/i.test(
    message,
  );
}
export async function signSafeTypedData(
  provider: EIP1193Provider,
  account: Address,
  data: SafeTypedData,
  expectedHash: Hex,
) {
  if (hashTypedData(data).toLowerCase() !== expectedHash.toLowerCase())
    throw Error(translateMessage("ui.239c45f7c2"));
  await assertWalletContext(provider, account, data.domain.chainId);
  let raw: unknown;
  let personal = false;
  try {
    try {
      raw = await provider.request({
        method: "eth_signTypedData_v4",
        params: [account, safeSigningPayload(data)],
      });
    } catch (error) {
      if (!isAppBigIntSigningError(provider, error)) throw error;
      personal = true;
      raw = await provider.request({
        method: "personal_sign",
        params: [expectedHash, account],
      });
    }
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? Number(error.code)
        : undefined;
    if (code === 4001)
      throw Error(translateMessage("wallet.signatureRejected"));
    if (code === -32601 || code === 4200)
      throw Error(translateMessage("wallet.typedDataUnsupported"));
    throw error;
  }
  if (typeof raw !== "string" || !/^0x[0-9a-fA-F]{130}$/.test(raw))
    throw Error(translateMessage("ui.f675a50018"));
  const recovery = Number.parseInt(raw.slice(-2), 16);
  if (![0, 1, 27, 28].includes(recovery))
    throw Error(translateMessage("ui.f675a50018"));
  const signature = (raw.slice(0, -2) +
    (recovery < 2 ? recovery + 27 : recovery).toString(16)) as Hex;
  const recovered = personal
    ? await recoverMessageAddress({ message: { raw: expectedHash }, signature })
    : await recoverTypedDataAddress({ ...data, signature });
  if (recovered.toLowerCase() !== account.toLowerCase())
    throw Error(translateMessage("wallet.signatureMismatch"));
  await assertWalletContext(provider, account, data.domain.chainId);
  const safeSignature = personal
    ? ((signature.slice(0, -2) +
        (Number.parseInt(signature.slice(-2), 16) + 4).toString(16)) as Hex)
    : signature;
  return { owner: account, signature: safeSignature };
}
