import { expect, it } from "vitest";
import {
  APP_SAFE_DEPLOYMENT,
  assertAppSafeVersion,
  appCompatibleDeployment,
} from "./safe-deployment";
it("matches Flutter Safe 1.4.1 L2 deployment defaults", () => {
  expect(APP_SAFE_DEPLOYMENT).toEqual({
    safeVersion: "1.4.1",
    isL1SafeSingleton: false,
  });
  expect(() => assertAppSafeVersion("1.4.1")).not.toThrow();
  expect(() => assertAppSafeVersion("1.3.0")).toThrow("与 App 要求");
});

it("uses the singleton accepted by the installed App only on verified chain 97", () => {
  expect(appCompatibleDeployment(97).singleton).toBe(
    "0xB85c3aED2238B1EEc2cF17954719E31f1fcf31bA",
  );
  expect(() => appCompatibleDeployment(56)).toThrow("仅验证了");
});
