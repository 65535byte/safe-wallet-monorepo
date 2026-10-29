import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import AccountsPage, { type SavedSafe } from "./AccountsPage";
const noop = () => {};
const props = {
  safes: [],
  busy: false,
  onConnect: noop,
  onAdd: noop,
  onCreate: noop,
  onImport: noop,
  onOpen: noop,
  onRemove: noop,
};
describe("reference account page states", () => {
  it("uses GetStartedCard and no wallet sidebar when signed out", () => {
    const html = renderToStaticMarkup(<AccountsPage {...props} />);
    expect(html).toContain("开始使用");
    expect(html).toContain("关注任意账户");
    expect(html).toContain("brand-logo.png");
    expect(html).not.toContain("safe-sidebar");
    expect(html).not.toContain("feature-grid");
  });
  it("uses searchable empty account list when connected", () => {
    const html = renderToStaticMarkup(
      <AccountsPage
        {...props}
        account="0x1111111111111111111111111111111111111111"
      />,
    );
    expect(html).toContain("你还没有多签钱包");
    expect(html).toContain("创建多签");
    expect(html).toContain("按名称、ENS、地址或链搜索");
    expect(html).not.toContain("开始使用");
  });
  it("keeps watched accounts visible without a connected owner wallet", () => {
    const html = renderToStaticMarkup(
      <AccountsPage
        {...props}
        safes={[
          {
            address: "0x1111111111111111111111111111111111111111",
            chainId: 97,
            name: "团队账户",
          },
        ]}
      />,
    );
    expect(html).toContain("团队账户");
    expect(html).not.toContain("开始使用");
    expect(html).not.toContain("你还没有多签钱包");
  });
  it.each([6, 20, 100])(
    "renders all %i saved accounts without a five-account cap",
    (count) => {
      const safes: SavedSafe[] = Array.from({ length: count }, (_, i) => ({
        address: `0x${(i + 1).toString(16).padStart(40, "0")}`,
        chainId: i % 2 ? 56 : 97,
        name: `Wallet ${String(i + 1).padStart(3, "0")}`,
      }));
      const html = renderToStaticMarkup(
        <AccountsPage {...props} safes={safes} />,
      );
      expect(html.match(/class="account-list-row"/g)).toHaveLength(count);
      expect(html).toContain(safes[count - 1].name);
    },
  );
});
