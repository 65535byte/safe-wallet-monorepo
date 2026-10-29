import { isAddress } from "viem";
import { chains } from "../../core";
import type { SafeRegistry } from "../transactions/safe-config";
export function creationNetworks(registry: SafeRegistry) {
  return Object.entries(registry).flatMap(([key, config]) => {
    const match = /^evm_([1-9]\d*)$/.exec(key);
    if (!match) return [];
    const id = Number(match[1]);
    if (
      !Number.isSafeInteger(id) ||
      !config?.safe ||
      ![config.safe.factory, config.safe.singleton, config.safe.handler].every(
        (a) => typeof a === "string" && isAddress(a),
      )
    )
      return [];
    const chain = chains.find((c) => c.id === id);
    return [{ id, name: chain?.name || `EVM ${id}`, supported: !!chain }];
  });
}
