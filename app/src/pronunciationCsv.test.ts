import { describe, expect, it } from "vitest";
import { mergePronunciations, parsePronunciationCsv, pronunciationsToCsv } from "./pronunciationCsv";

describe("pronunciation CSV", () => {
  it("reads rows and skips a header", () => {
    const r = parsePronunciationCsv("written,spoken\nTunde,Toon-day\nAdeyemi,Ah-DEH-yeh-mee\n");
    expect(r.rules).toEqual([{ from: "Tunde", to: "Toon-day" }, { from: "Adeyemi", to: "Ah-DEH-yeh-mee" }]);
    expect(r.skipped).toBe(0);
  });
  it("handles quotes, commas inside quotes, tabs, semicolons, BOM and Windows line endings", () => {
    const r = parsePronunciationCsv('﻿"Smith, J.",Smith\r\nOlu\tOh-loo\r\nIfe;Ee-feh\r\n"say ""hi""",say hi');
    expect(r.rules).toEqual([{ from: "Smith, J.", to: "Smith" }, { from: "Olu", to: "Oh-loo" }, { from: "Ife", to: "Ee-feh" }, { from: 'say "hi"', to: "say hi" }]);
  });
  it("counts bad rows instead of failing", () => {
    const r = parsePronunciationCsv("onlyonecolumn\n,missing\nGood,Gud\n" + "x".repeat(200) + ",y");
    expect(r.rules).toEqual([{ from: "Good", to: "Gud" }]);
    expect(r.skipped).toBe(3);
  });
  it("caps very large files", () => {
    const text = Array.from({ length: 2100 }, (_, i) => `w${i},v${i}`).join("\n");
    const r = parsePronunciationCsv(text);
    expect(r.rules.length).toBe(2000);
    expect(r.truncated).toBe(true);
  });
  it("merges case-insensitively, newest wins", () => {
    const out = mergePronunciations([{ from: "tunde", to: "old" }, { from: "Ada", to: "Ay-da" }], [{ from: "Tunde", to: "Toon-day" }]);
    expect(out).toEqual([{ from: "Tunde", to: "Toon-day" }, { from: "Ada", to: "Ay-da" }]);
  });
  it("round-trips through CSV with quoting", () => {
    const rules = [{ from: "Smith, J.", to: 'say "hi"' }, { from: "Ada", to: "Ay-da" }];
    expect(parsePronunciationCsv(pronunciationsToCsv(rules)).rules).toEqual(rules);
  });
});
