import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Select, { nextOption, selectOptions } from "./Select";

describe("WebView-compatible select", () => {
  it("reads options from fragments and arrays without losing disabled networks", () => {
    const options = selectOptions(
      <>
        <option value="" disabled>
          Choose network
        </option>
        {[97, 56, 8379].map((id) => (
          <option key={id} value={id} disabled={id === 8379}>
            Chain {id}
          </option>
        ))}
      </>,
    );
    expect(options.map((o) => [o.value, o.disabled])).toEqual([
      ["", true],
      ["97", false],
      ["56", false],
      ["8379", true],
    ]);
  });
  it("skips disabled options and wraps keyboard navigation", () => {
    const options = selectOptions(
      <>
        <option value="" disabled />
        <option value="97" />
        <option value="56" />
        <option value="8379" disabled />
      </>,
    );
    expect(nextOption(options, 1, 1)).toBe(2);
    expect(nextOption(options, 2, 1)).toBe(1);
    expect(nextOption(options, 1, -1)).toBe(2);
    expect(nextOption([], 0, 1)).toBe(-1);
    expect(nextOption([{ value: "", label: "", disabled: true }], 0, 1)).toBe(
      -1,
    );
  });
  it("uses a web combobox and hidden form value instead of a native select dialog", () => {
    const html = renderToStaticMarkup(
      <Select name="token" value="erc20" aria-label="Asset">
        <option value="">tBNB</option>
        <option value="erc20">USDT</option>
      </Select>,
    );
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('type="button"');
    expect(html).toContain('type="hidden"');
    expect(html).toContain('name="token" value="erc20"');
    expect(html).toContain("USDT");
    expect(html).not.toContain("<select");
    expect(html).not.toContain("<option");
  });
  it("preserves proposal signing defaults and disabled form state", () => {
    const html = renderToStaticMarkup(
      <Select name="proposal-signing" defaultValue="sign" disabled>
        <option value="unsigned">Unsigned</option>
        <option value="sign">Sign and submit</option>
      </Select>,
    );
    expect(html).toContain('disabled="" name="proposal-signing" value="sign"');
    expect(html).toContain('disabled=""');
    expect(html).toContain("Sign and submit");
  });
  it("defaults to the first enabled option, preserving the empty native-token value", () => {
    const html = renderToStaticMarkup(
      <Select name="token">
        <option value="">tBNB</option>
        <option value="erc20">USDT</option>
      </Select>,
    );
    expect(html).toContain('name="token" value=""');
  });
});
