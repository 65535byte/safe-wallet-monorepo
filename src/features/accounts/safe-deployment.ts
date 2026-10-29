import { translateMessage } from "../../i18n";
// Match drixone_client SafeServiceOptions and _buildDeployTransaction defaults.
export const APP_SAFE_DEPLOYMENT = {
  safeVersion: "1.4.1",
  isL1SafeSingleton: false,
} as const;
export function assertAppSafeVersion(version: string) {
  if (version !== APP_SAFE_DEPLOYMENT.safeVersion)
    throw Error(
      translateMessage("ui.0e3f42359a", {
        p0: version,
        p1: APP_SAFE_DEPLOYMENT.safeVersion,
      }),
    );
}
// Public deployment addresses read from the currently installed App's evm_97 cache.
export const LEGACY_APP_BSC_TEST_DEPLOYMENT = {
  factory: "0x09998762C09B3a885C90c0C40658857981aA012d",
  singleton: "0xB85c3aED2238B1EEc2cF17954719E31f1fcf31bA",
  handler: "0x2F57c69e51933d5cEb37efd30c71962f089D9343",
} as const;
export function appCompatibleDeployment(chainId: number) {
  if (chainId !== 97) throw Error(translateMessage("ui.dafb53ba15"));
  return LEGACY_APP_BSC_TEST_DEPLOYMENT;
}
