import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import chinese from "./locales/zh-CN.json";
import english from "./locales/en.json";
import {
  LANGUAGE_STORAGE_KEY,
  formatDate,
  getLanguage,
  initializeLanguage,
  setLanguage,
  translateMessage,
} from "./index";
import AccountsPage from "../features/accounts/AccountsPage";
import CreateSafePage from "../features/accounts/CreateSafePage";
import ImportSafePage from "../features/accounts/ImportSafePage";
import OwnersPage from "../features/accounts/OwnersPage";
import Topbar from "../ui/Topbar";
import NonceConflictDialog from "../features/transactions/NonceConflictDialog";
import { defaults } from "../storage";
import { address, draft } from "../core";
import { appSharePayload } from "../share";
import { parseShare } from "../share";
import fixture from "../fixtures/flutter-multisig-share.json";

function storage(language = "zh-CN") {
  const values = new Map([[LANGUAGE_STORAGE_KEY, language]]);
  const localStorage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
  vi.stubGlobal("window", { localStorage });
  vi.stubGlobal("document", { documentElement: { lang: "" }, title: "" });
  return localStorage;
}
afterEach(() => vi.unstubAllGlobals());
const a = "0x1111111111111111111111111111111111111111" as const;
const noop = () => {};
function render(node: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{node}</MemoryRouter>
    </QueryClientProvider>,
  );
}
describe("language resources", () => {
  it("has matching complete catalogs and preserves interpolation variables", () => {
    expect(Object.keys(english).sort()).toEqual(Object.keys(chinese).sort());
    for (const key of Object.keys(chinese) as (keyof typeof chinese)[]) {
      expect(english[key].trim(), key).not.toBe("");
      expect(
        [...english[key].matchAll(/\{\{(\w+)\}\}/g)].map((x) => x[1]).sort(),
        key,
      ).toEqual(
        [...chinese[key].matchAll(/\{\{(\w+)\}\}/g)].map((x) => x[1]).sort(),
      );
      expect(english[key], key).not.toMatch(/\p{Script=Han}/u);
    }
  });
  it("follows the system when preference is invalid and survives blocked storage", () => {
    vi.stubGlobal("navigator", { languages: ["zh-CN"], language: "zh-CN" });
    expect(getLanguage()).toBe("zh-CN");
    storage("unknown");
    expect(getLanguage()).toBe("zh-CN");
    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("blocked");
      },
    });
    expect(getLanguage()).toBe("zh-CN");
    expect(setLanguage("en")).toBe(false);
  });
  it("keeps the active language when saving becomes unavailable", () => {
    storage("en");
    expect(getLanguage()).toBe("en");
    vi.stubGlobal("window", {
      get localStorage() {
        throw new Error("blocked");
      },
    });
    expect(setLanguage("zh-CN")).toBe(false);
    expect(getLanguage()).toBe("en");
  });
  it("persists the same preference key as Safe and updates document language and title", () => {
    const local = storage();
    expect(setLanguage("en")).toBe(true);
    expect(local.setItem).toHaveBeenCalledWith("8379.language", "en");
    initializeLanguage();
    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe("8379 · Multisig wallet");
    expect(getLanguage()).toBe("en");
  });
  it("inserts addresses, bigint amounts and user names unchanged, without interpreting markup", () => {
    storage("en");
    expect(
      translateMessage("account.removePrompt", { name: "我的金库 <script>" }),
    ).toContain("我的金库 <script>");
    expect(translateMessage("ui.be9d4a83b8", { p0: a })).toBe(
      `Executed on-chain: ${a}`,
    );
    expect(
      translateMessage("ui.e980d24c45", { p0: 123456789123456789n }),
    ).toContain("123456789123456789");
  });
  it("formats dates according to the language without changing protocol share timestamps", async () => {
    storage();
    const date = new Date("2026-10-25T12:00:00Z");
    const zh = formatDate(date);
    setLanguage("en");
    expect(formatDate(date)).not.toBe(zh);
    expect(formatDate("invalid")).toBe("—");
    const enShare = await parseShare(JSON.stringify(fixture));
    setLanguage("zh-CN");
    expect(await parseShare(JSON.stringify(fixture))).toEqual(enShare);
  });
});
it("keeps Safe hashes and exported proposal payloads identical across languages", () => {
  storage();
  const tx = draft(defaults, a, a, "123456789123456789", "0x", 5);
  const info = {
    owners: [a],
    threshold: 1,
    nonce: 5,
    balance: 1n,
    version: "1.4.1",
  };
  const before = appSharePayload(tx, info, "tBNB");
  setLanguage("en");
  expect(draft(defaults, a, a, tx.value, "0x", 5).safeTxHash).toBe(
    tx.safeTxHash,
  );
  expect(appSharePayload(tx, info, "tBNB")).toEqual(before);
  expect(() => address("invalid")).toThrow("Enter a valid EVM address");
});
describe.each(["zh-CN", "en"] as const)("%s pages", (language) => {
  it("renders account empty and watch states with localized controls while preserving user names", () => {
    storage(language);
    const html = render(
      <AccountsPage
        account={a}
        safes={[]}
        busy={false}
        onConnect={noop}
        onAdd={noop}
        onCreate={noop}
        onImport={noop}
        onOpen={noop}
        onRemove={noop}
      />,
    );
    expect(html).toContain(
      language === "en"
        ? "You don&#x27;t have a multisig wallet yet"
        : "你还没有多签钱包",
    );
    const watch = render(
      <AccountsPage
        safes={[{ address: a, chainId: 97, name: "用户命名 Treasury" }]}
        busy={false}
        onConnect={noop}
        onAdd={noop}
        onCreate={noop}
        onImport={noop}
        onOpen={noop}
        onRemove={noop}
      />,
    );
    expect(watch).toContain("用户命名 Treasury");
  });
  it("renders create, import, owners and nonce dialog messages in the selected language", () => {
    storage(language);
    const create = render(
      <CreateSafePage
        settings={defaults}
        provider={() => {
          throw new Error("read-only test");
        }}
        onCreated={noop}
        onNetworkChange={noop}
        onConnected={noop}
      />,
    );
    const load = render(
      <ImportSafePage
        settings={defaults}
        onNetworkChange={noop}
        onImported={noop}
      />,
    );
    const owners = render(<OwnersPage onCopy={noop} />);
    const conflict = render(
      <NonceConflictDialog
        nonce={3}
        queueNonce={5}
        canReplace={true}
        onChoose={noop}
      />,
    );
    expect(create).toContain(
      language === "en" ? "Create multisig wallet" : "创建多签钱包",
    );
    expect(load).toContain(
      language === "en" ? "Add existing multisig wallet" : "添加已有多签钱包",
    );
    expect(owners).toContain(language === "en" ? "Signers" : "签名者");
    expect(conflict).toContain(
      language === "en" ? "Replace and continue" : "覆盖并继续",
    );
    if (language === "en")
      for (const html of [create, load, owners, conflict])
        expect(html).not.toMatch(/\p{Script=Han}/u);
  });
  it("shows the selected language and disables switching during transaction operations", () => {
    storage(language);
    const html = render(
      <Topbar
        busy={false}
        languageDisabled={true}
        settings={defaults}
        onConnect={noop}
        onDisconnect={noop}
        onChain={noop}
        onCopy={noop}
        onSelectSafe={noop}
        notifications={[]}
      />,
    );
    expect(html).toContain(language === "en" ? "Select language" : "选择语言");
    expect(html).toMatch(/class="language-button" disabled=""/);
  });
});

it.each([
  [["zh-CN"], "zh-CN"],
  [["zh-TW"], "zh-CN"],
  [["en-US"], "en"],
  [["fr-FR", "zh-CN"], "en"],
  [[], "en"],
])("detects system language %j", (languages, expected) => {
  storage("unknown");
  vi.stubGlobal("navigator", { languages, language: "" });
  expect(getLanguage()).toBe(expected);
});
it("uses saved choices over system language and defaults to English without system metadata", () => {
  storage("en");
  vi.stubGlobal("navigator", { languages: ["zh-CN"] });
  expect(getLanguage()).toBe("en");
  storage("unknown");
  vi.stubGlobal("navigator", undefined);
  expect(getLanguage()).toBe("en");
});
