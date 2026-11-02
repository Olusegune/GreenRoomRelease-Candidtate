import { describe, expect, it } from "vitest";
import { DESIGN_RECIPES, PIPER_ROLES, WAZOBIA_ROLES } from "./castcall";

describe("casting call", () => {
  it("lists real Piper voice keys: locale-name-quality, unique", () => {
    const keys = PIPER_ROLES.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const k of keys) expect(k).toMatch(/^[a-z]{2}_[A-Z]{2}-[a-z_]+-(low|medium|high)$/);
  });
  it("covers many accents", () => {
    expect(new Set(PIPER_ROLES.map((r) => r.accent)).size).toBeGreaterThanOrEqual(12);
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
