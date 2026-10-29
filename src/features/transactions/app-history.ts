import { formatUnits } from "viem";
import { translateMessage } from "../../i18n";
export const APP_HISTORY_PAGE_SIZE = 50;
export const appHistoryQueryPolicy = {
  staleTime: 0,
  retry: false,
  refetchInterval: false,
  refetchOnMount: "always",
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
} as const;
export type AppHistoryRecord = {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  symbol: string;
  timestamp: number;
  status: "success" | "pending" | "failed";
  block: string;
  nonce: string;
  data: string;
  note: string;
};
export function parseAppHistory(
  row: Record<string, unknown>,
): AppHistoryRecord {
  const str = (key: string) => String(row[key] ?? "");
  const token = str("addr_token");
  const native = !token || token === "native" || /^0x0{40}$/i.test(token);
  const decimals = Number(row.decimal ?? 0);
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255)
    throw Error(translateMessage("history.invalidResponse"));
  const hash = str("hash");
  return {
    id: hash + (str("log_index") ? `_${str("log_index")}` : ""),
    hash,
    from: str("from"),
    to: str("to"),
    amount: formatUnits(BigInt(String(row.token_value ?? "0")), decimals),
    token: native ? "native" : token,
    symbol: str("symbol"),
    timestamp: Number(row.timestamp ?? 0) * 1000,
    status:
      Number(row.status ?? 0) === 1
        ? "success"
        : Number(row.status ?? 0) === 0
          ? "pending"
          : "failed",
    block: str("block_number"),
    nonce: str("nonce"),
    data: str("input"),
    note: str("selector_display_text"),
  };
}
export async function fetchAppHistory(
  chainId: number,
  safe: string,
  page = 0,
  signal?: AbortSignal,
) {
  const url = new URL(
    "https://pretxs-hk.mytokenpocket.vip/v1/transaction_action/universal_list",
  );
  url.search = new URLSearchParams({
    new_way: "tp",
    page: String(page),
    count: String(APP_HISTORY_PAGE_SIZE),
    ret_icon: "1",
    ns: "ethereum",
    chain_id: String(chainId),
    address: safe,
    type: "0",
    lang: "zh-Hans",
  }).toString();
  const response = await fetch(url, { signal, cache: "no-store" });
  if (!response.ok)
    throw Error(
      translateMessage("history.requestFailed", { status: response.status }),
    );
  const body = await response.json();
  if (body.result !== 0 || !Array.isArray(body.data))
    throw Error(
      translateMessage("history.serviceUnavailable", {
        message: body.message ?? translateMessage("history.invalidResponse"),
      }),
    );
  const records = (body.data as Record<string, unknown>[]).map(parseAppHistory);
  const own = safe.toLowerCase();
  const scoped = records.filter(
    (row) => row.from.toLowerCase() === own || row.to.toLowerCase() === own,
  );
  return {
    records: [...new Map(scoped.map((row) => [row.id, row])).values()].sort(
      (a, b) => b.timestamp - a.timestamp,
    ),
    hasNext: body.data.length === APP_HISTORY_PAGE_SIZE,
  };
}
