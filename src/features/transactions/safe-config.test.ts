import { afterEach, expect, it, vi } from "vitest";
import { fetchSafeRegistry, fetchSafeService } from "./safe-config";
afterEach(() => vi.unstubAllGlobals());
it("uses the supplied registry when browser CORS blocks config discovery", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );
  expect(await fetchSafeService(97)).toBe("https://msw-bsc-test.dplife.org");
  expect(await fetchSafeService(56)).toBe("https://msw-bsc.dplife.org");
  expect((await fetchSafeRegistry()).evm_97.safe?.factory).toBe(
    "0xC9f5705c1d3036E8919f323f68a36A19De5A4ac8",
  );
});
it("prefers the remotely updated registry", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ evm_97: { api_url: "https://updated.example/" } }),
        ),
      ),
  );
  expect(await fetchSafeService(97)).toBe("https://updated.example");
});
it("does not mask cancellation with cached config", async () => {
  const controller = new AbortController();
  controller.abort();
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(controller.signal.reason));
  await expect(fetchSafeRegistry(controller.signal)).rejects.toBe(
    controller.signal.reason,
  );
});
it("does not use a bundled network list when creation requires the live registry", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
  );
  await expect(fetchSafeRegistry(undefined, false)).rejects.toThrow(
    "Failed to fetch",
  );
});
