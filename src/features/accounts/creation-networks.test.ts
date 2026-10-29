import { expect, it } from "vitest";
import { creationNetworks } from "./creation-networks";
import snapshot from "../transactions/safe-config.snapshot.json";
it("shows exactly the networks returned by the registry, including Fusn", () => {
  const networks = creationNetworks(snapshot);
  expect(networks.map((c) => c.id)).toEqual([97, 56, 8379]);
  expect(networks.every((c) => c.supported)).toBe(true);
  expect(networks.find((c) => c.id === 8379)?.name).toBe("Fusn Chain");
  expect(
    creationNetworks({ evm_97: snapshot.evm_97 }).map((c) => c.id),
  ).toEqual([97]);
});
it("rejects malformed deployment entries and marks networks without RPC metadata unavailable", () => {
  expect(
    creationNetworks({
      bad: snapshot.evm_97,
      evm_0: snapshot.evm_97,
      evm_56: { safe: { factory: "bad", singleton: "bad", handler: "bad" } },
    }),
  ).toEqual([]);
  expect(creationNetworks({ evm_999999: snapshot.evm_97 })).toEqual([
    { id: 999999, name: "EVM 999999", supported: false },
  ]);
});
