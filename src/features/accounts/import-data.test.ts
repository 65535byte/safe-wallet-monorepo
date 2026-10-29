import { describe, it, expect } from "vitest";
import { parseAccountData } from "./import-data";
const a = "0x1111111111111111111111111111111111111111";
describe("Safe Web account backup contract", () => {
  it("reads the reference versioned addedSafes and addressBook slices", () => {
    expect(
      parseAccountData(
        JSON.stringify({
          version: "3",
          data: {
            addedSafes: { "97": { [a]: { threshold: 2 } } },
            addressBook: { "97": { [a]: "团队账户" } },
          },
        }),
      ),
    ).toEqual([{ address: a, chainId: 97, name: "团队账户" }]);
  });
  it("reads local backup records and deduplicates addresses", () => {
    const s = { address: a, chainId: 97, name: "账户" };
    expect(parseAccountData(JSON.stringify({ safes: [s, s] }))).toEqual([s]);
  });
  it("does not import networks the application cannot manage", () => {
    expect(() =>
      parseAccountData(
        JSON.stringify({
          safes: [{ address: a, chainId: 9999999, name: "未知" }],
        }),
      ),
    ).toThrow("支持网络");
  });
  it("rejects malformed account addresses", () => {
    expect(() =>
      parseAccountData(
        JSON.stringify({ safes: [{ address: "bad", chainId: 97 }] }),
      ),
    ).toThrow("有效的 EVM 地址");
  });
});
