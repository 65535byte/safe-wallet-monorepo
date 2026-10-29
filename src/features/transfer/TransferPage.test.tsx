import { describe, it, expect } from "vitest";
import { transferConfig, transferEnvironment } from "./TransferPage";
import { legalDocumentType } from "../legal/LegalPage";
describe("H5 transfer migration", () => {
  it("preserves parameters and decodes nested launch URLs once", () => {
    const url = "dapp://open?url=https%3A%2F%2Fexample.com%2F?a=1&b=2";
    const config = transferConfig(
      new URLSearchParams({
        appName: "测试服务",
        appIcon: "https://example.com/logo.png",
        openUrl: url,
      }).toString(),
    );
    expect(config).toEqual({
      title: "测试服务",
      icon: "https://example.com/logo.png",
      scheme: url,
    });
    expect(transferConfig("").scheme).toBe("dapp://open?url=");
    expect(transferConfig("").title).toBe("title");
  });
  it("detects the original iOS standalone and WeChat environments", () => {
    expect(
      transferEnvironment({ userAgent: "iPhone", standalone: true }),
    ).toEqual({ ios: true, standalone: true, wechat: false });
    expect(transferEnvironment({ userAgent: "iPhone MicroMessenger" })).toEqual(
      { ios: true, standalone: false, wechat: true },
    );
    expect(
      transferEnvironment({ userAgent: "Android Chrome" }).standalone,
    ).toBe(false);
  });
  it("rejects script URLs while keeping custom app schemes", () => {
    expect(
      transferConfig("?openUrl=javascript:alert(1)&appIcon=data:text/html,test")
        .scheme,
    ).toBe("dapp://open?url=");
    expect(transferConfig("?appIcon=//example.com/icon").icon).toBe(
      "/images/transfer/app_icon.png",
    );
    expect(transferConfig("?openUrl=drixone://open").scheme).toBe(
      "drixone://open",
    );
  });
  it("accepts both local and original routes", () => {
    for (const route of [
      "/transfer",
      "/pages/transfer",
      "/pages/transfer/index",
      "/pages/transfer/index/",
    ])
      expect(legalDocumentType(route)).toBe("transfer");
  });
});
