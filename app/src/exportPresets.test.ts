import { describe, expect, it } from "vitest";
import { EXPORT_PRESETS, applyPreset, matchingPreset } from "./exportPresets";
import { TARGETS } from "./loudness";
import { DEFAULT_EXPORT } from "./types";

describe("export presets", () => {
  it("only uses loudness targets, rates, bit depths and ceilings the Export screen offers", () => {
    const ids = new Set(TARGETS.map((t) => t.id));
    for (const p of EXPORT_PRESETS) {
      if (p.set.target) expect(ids.has(p.set.target), p.id).toBe(true);
      if (p.set.rate) expect([44100, 48000, 96000], p.id).toContain(p.set.rate);
      if (p.set.bits) expect([16, 24, 32], p.id).toContain(p.set.bits);
      if (p.set.ceiling !== undefined) expect([-1, -2, -3], p.id).toContain(p.set.ceiling);
    }
  });
  it("has unique ids and a note on each", () => {
    expect(new Set(EXPORT_PRESETS.map((p) => p.id)).size).toBe(EXPORT_PRESETS.length);
    for (const p of EXPORT_PRESETS) expect(p.note.length).toBeGreaterThan(20);
  });
  it("applies a preset without touching unrelated settings", () => {
    const cfg = { ...DEFAULT_EXPORT, fps: 25 };
    const out = applyPreset(cfg, EXPORT_PRESETS.find((p) => p.id === "podcast")!);
    expect(out).toMatchObject({ rate: 44100, bits: 24, target: "web", ceiling: -1, fps: 25 });
  });
  it("recognises the preset that matches the current settings", () => {
    const film = EXPORT_PRESETS.find((p) => p.id === "film")!;
    expect(matchingPreset(applyPreset(DEFAULT_EXPORT, film))?.id).toBe("film");
  });
  it("is honest that audiobook loudness is a starting point, not ACX certification", () => {
    expect(EXPORT_PRESETS.find((p) => p.id === "audiobook")!.note).toMatch(/ACX/);
  });
});
