import { afterEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import GlobalLoading from "./GlobalLoading";
import { LANGUAGE_STORAGE_KEY } from "../i18n";
afterEach(() => vi.unstubAllGlobals());
it.each(["zh-CN", "en"])(
  "renders the accessible global processing state in %s",
  (language) => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) =>
          key === LANGUAGE_STORAGE_KEY ? language : null,
      },
    });
    const html = renderToStaticMarkup(<GlobalLoading />);
    expect(html).toContain('class="global-loading"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('role="status"');
    expect(html).toContain(
      language === "en" ? "Processing, please wait…" : "正在处理，请稍候…",
    );
    expect(html).not.toContain("<button");
  },
);
