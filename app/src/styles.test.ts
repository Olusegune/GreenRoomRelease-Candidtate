import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(new URL(p, import.meta.url), "utf-8");

describe("design system", () => {
  it("loads the polish and card layers last, so they win over the earlier passes", () => {
    const main = read("./main.tsx");
    const order = [...main.matchAll(/import "\.\/styles\/([a-z]+)\.css"/g)].map((m) => m[1]);
    expect(order.slice(-2)).toEqual(["polish", "cards"]);
    expect(order).toContain("palettes");
  });
  it("gives every field the same height, radius and spacing from shared tokens", () => {
    const css = read("./styles/polish.css");
    for (const token of ["--ctl-h: 40px", "--ctl-h-sm: 32px", "--ctl-r: 10px", "--field-gap: 8px"]) expect(css).toContain(token);
    expect(css).toMatch(/\.field select, \.field input[^{]*\{[^}]*width: 100%/);
  });
  it("styles the native file picker and keeps disabled primary buttons clearly unavailable", () => {
    const css = read("./styles/polish.css");
    expect(css).toContain('input[type="file"]::file-selector-button');
    expect(css).toMatch(/button\.primary:disabled \{[^}]*background: var\(--surface-3\)/);
  });
  it("stacks two-column screens on narrow windows", () => {
    expect(read("./styles/polish.css")).toMatch(/@media \(max-width: 960px\)[\s\S]*\.row\.top \{ flex-direction: column/);
  });
  it("never justifies text, which spreads words apart", () => {
    for (const f of ["base", "components", "shell", "screens", "refresh", "polish", "cards"]) expect(read(`./styles/${f}.css`)).not.toMatch(/text-align:\s*justify/);
  });
  it("uses colour tokens, not the old fixed green-black backgrounds, in the new layer", () => {
    expect(read("./styles/polish.css")).not.toMatch(/rgba\(\s*(?:5|12|13|24),\s*(?:10|19|23|34),/);
  });
});
