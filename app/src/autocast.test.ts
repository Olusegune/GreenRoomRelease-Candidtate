import { describe, expect, it } from "vitest";
import { describePlan, planCast, wantsNarration } from "./autocast";
import { PIPER_ROLES } from "./castcall";
import type { Character, VoiceEntry } from "./types";

const v = (id: string, over: Partial<VoiceEntry> = {}): VoiceEntry => ({ id, name: id, provider: "piper", source: "library", language: "English", accent: "", gender: "", notes: "", createdAt: "", ...over });
const ch = (id: string, name: string, over: Partial<Character> = {}): Character => ({ id, name, language: "English", ...over });

describe("auto-cast", () => {
  it("gives every character without a voice a different voice", () => {
    const lib = [v("a", { accent: "British" }), v("b", { accent: "American" }), v("c", { accent: "Scottish" })];
    const plan = planCast([ch("1", "PIP"), ch("2", "BOLO"), ch("3", "GUARD")], lib);
    expect(new Set(Object.values(plan.assign)).size).toBe(3);
    expect(plan.suggestions).toEqual([]);
  });
  it("never changes a character that already has a voice, and does not reuse it", () => {
    const lib = [v("a"), v("b")];
    const plan = planCast([ch("1", "PIP", { voiceId: "a" }), ch("2", "BOLO")], lib);
    expect(plan.assign).toEqual({ "2": "b" });
  });
  it("matches the character's language first", () => {
    const lib = [v("en"), v("fr", { language: "French" })];
    const plan = planCast([ch("1", "AMELIE", { language: "French" })], lib);
    expect(plan.assign["1"]).toBe("fr");
  });
  it("gives narration names the narration voices and does it first", () => {
    const lib = [v("chatty", { notes: "Casual, podcast co-host" }), v("doc", { notes: "Narrator, documentary" })];
    const plan = planCast([ch("1", "PIP"), ch("2", "Narrator")], lib);
    expect(plan.assign["2"]).toBe("doc");
    expect(plan.assign["1"]).toBe("chatty");
    expect(wantsNarration("NARRATOR")).toBe(true);
    expect(wantsNarration("Ada")).toBe(false);
  });
  it("prefers a new accent so the cast sounds varied", () => {
    const lib = [v("a1", { accent: "British", name: "A1" }), v("a2", { accent: "British", name: "A2" }), v("b1", { accent: "American", name: "B1" })];
    const plan = planCast([ch("1", "X"), ch("2", "Y")], lib);
    expect(new Set([plan.assign["1"], plan.assign["2"]]).has("b1")).toBe(true);
  });
  it("reuses a voice only when the library is smaller than the cast, and then suggests fresh voices", () => {
    const lib = [v("only")];
    const plan = planCast([ch("1", "A"), ch("2", "B")], lib);
    expect(Object.values(plan.assign)).toEqual(["only", "only"]);
    expect(plan.suggestions.length).toBeGreaterThanOrEqual(1);
    for (const s of plan.suggestions) expect(PIPER_ROLES.some((r) => r.key === s.role.key)).toBe(true);
  });
  it("does not suggest a voice that is already in the library", () => {
    const key = PIPER_ROLES[0]!.key;
    const lib = [v(key)];
    const plan = planCast([ch("1", "A"), ch("2", "B")], lib);
    expect(plan.suggestions.every((s) => s.role.key !== key)).toBe(true);
  });
  it("with an empty library assigns nothing and suggests voices", () => {
    const plan = planCast([ch("1", "A")], []);
    expect(plan.assign).toEqual({});
    expect(plan.suggestions.length).toBe(1);
  });
  it("is deterministic and describes the plan in words", () => {
    const lib = [v("a", { name: "Alan" }), v("b", { name: "Amy" })];
    const chars = [ch("1", "PIP"), ch("2", "BOLO")];
    expect(planCast(chars, lib)).toEqual(planCast(chars, lib));
    expect(describePlan(planCast(chars, lib), chars, lib).every((l) => /^(PIP|BOLO): (Alan|Amy)$/.test(l))).toBe(true);
  });
});
