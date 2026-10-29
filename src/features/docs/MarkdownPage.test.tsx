import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import MarkdownPage, { MarkdownContent, documentResourceUrl } from "./MarkdownPage";
import { legalDocumentType } from "../legal/LegalPage";
import source from "./content/quick_app.md?raw";

describe("migrated quick Markdown", () => {
  it("preserves instructions and serves all four screenshots locally", () => {
    const html = renderToStaticMarkup(<MarkdownPage type="quick" />);
    expect(html).toContain('添加到桌面');
    for (const brand of ['华为', 'OPPO', 'vivo', '小米']) expect(html).toContain(brand);
    expect(html.match(/<img /g)).toHaveLength(4);
    for (const suffix of ['', '-1', '-2', '-3']) expect(html).toContain(`/images/quick/image${suffix}.png`);
    expect(html).not.toContain('https://wallet.8379hk.com');
    expect(source.match(/!\[/g)).toHaveLength(4);
    expect(html).not.toContain('safe-topbar');
  });
  it("retains guide code examples as text and the external reference link", () => {
    const html = renderToStaticMarkup(<MarkdownPage type="guide" />);
    expect(html).toContain('eth_requestAccounts');
    expect(html).toContain('eth_signTypedData_v4');
    expect(html).toContain('<pre><code>');
    expect(html).toContain('href="https://github.com/MetaMask/test-dapp"');
  });
  it("never renders Markdown HTML or unsafe links as executable markup", () => {
    const html = renderToStaticMarkup(<MarkdownContent markdown={'<script>alert(1)</script>\n\n[unsafe](javascript:alert)\n\n![bad](data:text/html,test)'} />);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain('<img');
    expect(documentResourceUrl('javascript:alert(1)')).toBeUndefined();
  });
  it("supports direct and original H5 quick paths", () => {
    for (const path of ['/quick', '/quick/', '/pages/quick', '/pages/quick/']) expect(legalDocumentType(path)).toBe('quick');
    expect(legalDocumentType('/guide')).toBe('guide');
    expect(legalDocumentType('/quick/other')).toBeUndefined();
  });
});
