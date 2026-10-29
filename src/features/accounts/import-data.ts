import { translateMessage } from "../../i18n";
import { address, chains } from "../../core";
import type { SavedSafe } from "./AccountsPage";
export function parseAccountData(raw: string): SavedSafe[] {
  const value = JSON.parse(raw);
  let rows: SavedSafe[] = [];
  if (Array.isArray(value.safes)) rows = value.safes;
  else {
    const data = value.data ?? value;
    const added = data.addedSafes;
    if (!added || typeof added !== "object")
      throw Error(translateMessage("ui.de52549a80"));
    for (const [chainId, entries] of Object.entries(added)) {
      if (!entries || typeof entries !== "object") continue;
      for (const addr of Object.keys(entries)) {
        const book = data.addressBook?.[chainId]?.[addr];
        rows.push({
          chainId: Number(chainId),
          address: address(addr),
          name:
            typeof book === "string"
              ? book
              : (book?.name ?? translateMessage("ui.7f0c3ab2b6")),
        });
      }
    }
  }
  const supported = rows
    .filter((s) => chains.some((c) => c.id === Number(s.chainId)))
    .map((s) => ({
      chainId: Number(s.chainId),
      address: address(s.address),
      name: String(s.name || translateMessage("ui.7f0c3ab2b6")).slice(0, 60),
    }));
  if (!supported.length) throw Error(translateMessage("ui.c5fae7f339"));
  return [
    ...new Map(
      supported.map((s) => [`${s.chainId}:${s.address.toLowerCase()}`, s]),
    ).values(),
  ];
}
