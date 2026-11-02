import { describe, expect, it } from "vitest";
import { voiceChips } from "./voiceMeta";

describe("voice card chips", () => {
  it("shows language, accent and gender in that order, only when known", () => {
    expect(voiceChips({ language: "en", accent: "nigerian", gender: "male" })).toEqual([{ kind: "language", text: "EN" }, { kind: "accent", text: "Nigerian" }, { kind: "gender", text: "Male" }]);
    expect(voiceChips({ language: "English", accent: "", gender: "" })).toEqual([{ kind: "language", text: "English" }]);
  });
  it("falls back to the combined line for older entries, and shows nothing when there is nothing", () => {
    expect(voiceChips({ language: "", accent: "", gender: "" }, "English · British")).toEqual([{ kind: "text", text: "English · British" }]);
    expect(voiceChips({ language: " ", accent: "", gender: "" })).toEqual([]);
  });
});
