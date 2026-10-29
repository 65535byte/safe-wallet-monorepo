import { expect, it } from "vitest";
import { importAddress, stripNetworkPrefix } from "./import-address";
const safe = "0x958cf8755929483a1125D0657fc45771c256ADA0";
it("accepts a raw Safe address and an address with the selected chain prefix", () => {
  expect(importAddress(safe, 97)).toBe(safe);
  expect(importAddress(` bnbt:${safe} `, 97)).toBe(safe);
  expect(stripNetworkPrefix(`bnbt:${safe}`, 97)).toBe(safe);
});
it("rejects a different network prefix and malformed addresses", () => {
  expect(() => importAddress(`bnb:${safe}`, 97)).toThrow("前缀");
  expect(() => importAddress("0x123", 97)).toThrow();
});
