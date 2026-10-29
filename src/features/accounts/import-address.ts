import { translateMessage } from "../../i18n";
import { address } from "../../core";
export function networkPrefix(chainId: number): string {
  return (
    (
      {
        97: "bnbt:",
        56: "bnb:",
        1: "eth:",
        11155111: "sep:",
        8453: "base:",
        42161: "arb1:",
      } as Record<number, string>
    )[chainId] || ""
  );
}
export function stripNetworkPrefix(value: string, chainId: number): string {
  const trimmed = value.trim();
  const prefix = networkPrefix(chainId);
  return prefix && trimmed.toLowerCase().startsWith(prefix)
    ? trimmed.slice(prefix.length).trim()
    : trimmed;
}
export function importAddress(value: string, chainId: number) {
  const stripped = stripNetworkPrefix(value, chainId);
  if (stripped.includes(":")) throw Error(translateMessage("ui.66d84155db"));
  return address(stripped);
}
