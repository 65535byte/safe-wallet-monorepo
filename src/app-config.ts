import { translateMessage } from "./i18n";
import { isAddress, type Address } from "viem";
// Same contract as Flutter WalletChainService; balances are deliberately not fetched here.
const base = "https://authapi.dplife.org/api/blockmesh/v1/chain";
export async function loadAppAssets(chainId: number) {
  const get = async (path: string) => {
    const r = await fetch(base + path, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw Error(translateMessage("ui.28828315ae", { p0: r.status }));
    return (await r.json()).data as Record<string, unknown>[];
  };
  const [chains, tokens] = await Promise.all([
    get("/list?category=all&type=all"),
    get(`/token/list?chain_type=evm&chain_id=${chainId}`),
  ]);
  const chain = chains.find(
    (c) =>
      Number(c.chainId ?? c.chain_id) === chainId &&
      String(c.chainType ?? c.chain_type).toLowerCase() === "evm",
  );
  const rpcs = chain?.rpcs as
    | {
        uri: string;
      }[]
    | undefined;
  return {
    rpc: rpcs?.find((r) => r.uri.startsWith("https://"))?.uri,
    tokens: tokens
      .filter(
        (t) =>
          t.disableShow !== true &&
          t.disable_show !== true &&
          isAddress(String(t.address)),
      )
      .map((t) => ({
        address: String(t.address) as Address,
        symbol: String(t.symbol),
        decimals: Number(t.decimals),
      })),
  };
}
