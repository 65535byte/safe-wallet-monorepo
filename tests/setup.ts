import { beforeEach, vi } from "vitest";
beforeEach(() => {
  vi.stubGlobal("navigator", { languages: ["zh-CN"], language: "zh-CN" });
});
