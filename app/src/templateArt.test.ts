import { existsSync, readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TEMPLATES } from "./templates";

const dir = new URL("../public/templates/", import.meta.url);

describe("template pictures", () => {
  it("has a real WebP picture for every template, a sensible size, and a credits note", () => {
    for (const t of TEMPLATES) {
      const file = new URL(`${t.id}.webp`, dir);
      expect(existsSync(file), t.id).toBe(true);
      const bytes = readFileSync(file);
      expect(bytes.subarray(0, 4).toString("ascii"), t.id).toBe("RIFF");
      expect(bytes.subarray(8, 12).toString("ascii"), t.id).toBe("WEBP");
      const kb = statSync(file).size / 1024;
      expect(kb, `${t.id} ${kb}KB`).toBeGreaterThan(5);
      expect(kb, `${t.id} ${kb}KB`).toBeLessThan(200);
    }
    expect(existsSync(new URL("../../docs/TEMPLATE_ART_CREDITS.md", import.meta.url))).toBe(true);
  });
});
