import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import LegalPage, { legalDocumentType } from "./LegalPage";
import privacyZh from "./content/privacy.zh-CN.json";
import privacyEn from "./content/privacy.en.json";
import termsZh from "./content/terms.zh-CN.json";
import termsEn from "./content/terms.en.json";
import { LANGUAGE_STORAGE_KEY } from "../../i18n";
afterEach(() => vi.unstubAllGlobals());
describe("migrated H5 legal documents", () => {
  it("preserves all source sections, update date, contact and regional restriction", () => {
    expect(privacyZh.sections).toHaveLength(6);
    expect(termsZh.sections).toHaveLength(8);
    for (const doc of [privacyZh, termsZh]) {
      expect(doc.updatedAt).toBe("最近更新日期：2026年2月3日");
      expect(
        doc.sections
          .flatMap((s) => s.blocks)
          .some((b) => b.type === "email" && b.text === "service@8379hk.com"),
      ).toBe(true);
    }
    expect(JSON.stringify(termsZh)).toContain(
      "本应用不面向中国大陆地区用户提供服务。",
    );
    expect(JSON.stringify(termsZh)).toContain(
      "我们不存储、不持有、不控制您的私钥、助记词或数字资产",
    );
  });
  it("keeps the English translation structurally complete", () => {
    for (const [zh, en] of [
      [privacyZh, privacyEn],
      [termsZh, termsEn],
    ]) {
      expect(en.intro).toHaveLength(zh.intro.length);
      expect(en.sections).toHaveLength(zh.sections.length);
      en.sections.forEach((section, i) => {
        expect(section.blocks.map((b) => b.type)).toEqual(
          zh.sections[i].blocks.map((b) => b.type),
        );
        expect(section.blocks.every((b) => b.text.trim())).toBe(true);
      });
      expect(JSON.stringify(en)).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it.each(["zh-CN", "en"])(
    "follows system language %s regardless of wallet preference",
    (lang) => {
      vi.stubGlobal("navigator", { languages: [lang], language: lang });
      vi.stubGlobal("window", {
        localStorage: {
          getItem: (key: string) =>
            key === LANGUAGE_STORAGE_KEY
              ? lang === "en"
                ? "zh-CN"
                : "en"
              : null,
        },
      });
      for (const type of ["privacy", "terms"] as const) {
        const html = renderToStaticMarkup(
          <MemoryRouter>
            <LegalPage type={type} />
          </MemoryRouter>,
        );
        expect(html).toContain('class="legal-page"');
        expect(html).toContain('href="mailto:service@8379hk.com"');
        expect(html).not.toContain('class="text-btn legal-back"');
        expect(html).not.toContain("safe.global");
        expect(html).toContain(
          lang === "en" ? "February 3, 2026" : "2026年2月3日",
        );
        if (lang === "en") expect(html).not.toMatch(/\p{Script=Han}/u);
      }
    },
  );
  it("recognizes direct and trailing-slash routes without capturing unrelated routes", () => {
    expect(legalDocumentType("/privacy-policy/")).toBe("privacy");
    expect(legalDocumentType("/terms-service")).toBe("terms");
    expect(legalDocumentType("/terms-of-service/")).toBe("terms");
    expect(legalDocumentType("/accounts")).toBeUndefined();
    expect(legalDocumentType("/privacy-policy/other")).toBeUndefined();
  });
});

describe("migrated H5 support pages", () => {
  it.each(["zh-CN", "en"])(
    "follows system language %s for support pages",
    (lang) => {
      vi.stubGlobal("navigator", { languages: [lang], language: lang });
      vi.stubGlobal("window", {
        localStorage: { getItem: () => (lang === "en" ? "zh-CN" : "en") },
      });
      for (const type of ["help", "service", "community", "suggest"] as const) {
        const html = renderToStaticMarkup(
          <MemoryRouter>
            <LegalPage type={type} />
          </MemoryRouter>,
        );
        expect(html).toContain('class="legal-page support-page"');
        expect(html).not.toContain('class="account-legal-links"');
        if (type === "help")
          expect(html.match(/class="faq-item"/g)).toHaveLength(12);
        if (type === "service") expect(html).toContain('href="/suggest"');
        if (type === "suggest") expect(html).toContain('maxLength="500"');
        if (type === "community")
          expect(html.match(/class="support-row"/g)).toHaveLength(3);
        if (lang === "en") expect(html).not.toMatch(/\p{Script=Han}/u);
        else expect(html).toMatch(/\p{Script=Han}/u);
      }
    },
  );
  it("supports source H5 routes as well as local routes", () => {
    for (const [path, type] of [
      ["help", "help"],
      ["service", "service"],
      ["community", "community"],
      ["suggest", "suggest"],
      ["privacy-policy", "privacy"],
      ["terms-service", "terms"],
    ]) {
      expect(legalDocumentType(`/pages/${path}/index`)).toBe(type);
      expect(legalDocumentType(`/${path}`)).toBe(type);
    }
  });
});
