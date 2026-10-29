import { translateMessage } from "../../i18n";
import snapshot from "./safe-config.snapshot.json";
export const SAFE_CONFIG_URL = "https://msw.dplife.org/api/config/safe";
export async function fetchSafeService(
  chainId: number,
  signal?: AbortSignal,
): Promise<string> {
  const registry = await fetchSafeRegistry(signal);
  const url = registry[`evm_${chainId}`]?.api_url;
  if (typeof url !== "string" || !url.trim())
    throw Error(translateMessage("ui.98a900da6f"));
  const parsed = new URL(url);
  if (!["https:", "http:"].includes(parsed.protocol))
    throw Error(translateMessage("ui.495acdc985"));
  return url.replace(/\/$/, "");
}
export type SafeRegistry = Record<
  string,
  {
    api_url?: string;
    safe?: {
      factory: string;
      singleton: string;
      handler: string;
    };
  }
>;
// The published registry currently omits CORS headers. Ship the supplied registry
// as a fallback so deployed static builds can still discover the service.
export async function fetchSafeRegistry(
  signal?: AbortSignal,
  allowSnapshotFallback = true,
): Promise<SafeRegistry> {
  try {
    const response = await fetch(
      import.meta.env.VITE_SAFE_CONFIG_URL ||
        (import.meta.env.DEV ? "/api/config/safe" : SAFE_CONFIG_URL),
      {
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(5000)])
          : AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) throw Error(`Safe config HTTP ${response.status}`);
    const registry = await response.json();
    if (!registry || typeof registry !== "object" || Array.isArray(registry))
      throw Error("Invalid Safe registry");
    return registry;
  } catch (error) {
    if (signal?.aborted || !allowSnapshotFallback) throw error;
    return snapshot;
  }
}
