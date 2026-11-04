import { describe, expect, it } from "vitest";
import { ACCENT_ROLES, ALL_PIPER_ROLES, DESIGN_RECIPES, PIPER_ROLES, VOICE_PACKS, WAZOBIA_ROLES, baseKey } from "./castcall";
import { ALL_ACCENTS } from "./accents";

describe("casting call", () => {
  it("lists real Piper voice keys: locale-name-quality, unique", () => {
    const keys = ALL_PIPER_ROLES.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const k of keys) expect(k).toMatch(/^[a-z]{2}_[A-Z]{2}-[a-z0-9_]+-(x_low|low|medium|high)(@\d{1,3})?$/);
  });
  it("covers many accents", () => {
    expect(new Set(PIPER_ROLES.map((r) => r.accent)).size).toBeGreaterThanOrEqual(12);
  });
  it("has Chinese, Korean, Indian, Arabic, Spanish and Vietnamese voices, native and accented", () => {
    const accents = new Set(ALL_PIPER_ROLES.map((r) => r.accent));
    for (const a of ["Mandarin", "Korean", "Indian", "Telugu", "Mexican", "Vietnamese", "Chinese English", "Korean English", "Indian English", "Arabic English", "Spanish English", "Vietnamese English"]) expect(accents.has(a), a).toBe(true);
  });
  it("gives each accent voice its own speaker number, 0 to 23", () => {
    const n = ACCENT_ROLES.map((r) => Number(r.key.split("@")[1]));
    expect(ACCENT_ROLES).toHaveLength(24);
    expect(new Set(n).size).toBe(24);
    expect(Math.min(...n)).toBe(0);
    expect(Math.max(...n)).toBe(23);
    for (const r of ACCENT_ROLES) expect(r.use).toMatch(/Non-commercial/);
  });
  it("only bundles voices that exist in the casting call", () => {
    const keys = new Set(ALL_PIPER_ROLES.map((r) => r.key));
    for (const pk of VOICE_PACKS) { expect(pk.keys.length).toBeGreaterThan(2); for (const k of pk.keys) expect(keys.has(k), `${pk.id}: ${k}`).toBe(true); }
    expect(baseKey("en_US-l2arctic-medium@7")).toBe("en_US-l2arctic-medium");
  });
  it("offers many accents to design", () => {
    expect(ALL_ACCENTS.length).toBeGreaterThanOrEqual(30);
  });
  it("offers each Wazobia voice in four languages", () => {
    expect(WAZOBIA_ROLES).toHaveLength(13 * 4);
    expect(new Set(WAZOBIA_ROLES.map((r) => r.lang))).toEqual(new Set(["en", "yo", "ha", "ig"]));
  });
  it("writes design recipes long enough for ElevenLabs and a short test line", () => {
    for (const r of DESIGN_RECIPES) {
      expect(r.description.length).toBeGreaterThanOrEqual(20);
      expect(r.description.length).toBeLessThan(1000);
      expect(r.line.length).toBeLessThan(200);
    }
    expect(new Set(DESIGN_RECIPES.map((r) => r.id)).size).toBe(DESIGN_RECIPES.length);
  });
});
