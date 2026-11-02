import { describe, expect, it } from "vitest";
import { ACCENTS, applyPalette, readPalette } from "./palette";

describe("palette", () => {
  it("defaults to emerald on graphite when nothing is stored", () => {
    expect(readPalette(() => null)).toEqual({ accent: "emerald", surface: "graphite" });
  });
  it("ignores unknown stored values", () => {
    expect(readPalette((k) => (k === "greenroom-accent" ? "hotpink" : "weird"))).toEqual({ accent: "emerald", surface: "graphite" });
  });
  it("reads a saved choice", () => {
    expect(readPalette((k) => (k === "greenroom-accent" ? "amber" : "tinted"))).toEqual({ accent: "amber", surface: "tinted" });
  });
  it("sets and clears root attributes", () => {
    const root: { dataset: Record<string, string | undefined> } = { dataset: {} };
    applyPalette(root, { accent: "violet", surface: "tinted" });
    expect(root.dataset).toEqual({ accent: "violet" });
    applyPalette(root, { accent: "emerald", surface: "graphite" });
    expect(root.dataset).toEqual({ surface: "graphite" });
  });
  it("offers five accents with unique ids", () => {
    expect(new Set(ACCENTS.map((a) => a.id)).size).toBe(5);
  });
});
