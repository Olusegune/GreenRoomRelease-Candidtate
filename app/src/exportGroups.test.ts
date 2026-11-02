import { describe, expect, it } from "vitest";
import { groupExports, stemsHint } from "./exportGroups";

const root = "C:\\Users\\eduni\\Documents\\Greenroom Local\\projects\\p-1\\exports\\";
const sample = [
  root + "Animation story - full scene.wav",
  root + "Lines - NARRATOR\\01 - NARRATOR.mp3",
  root + "Lines - PIP\\02 - PIP.mp3",
  root + "Lines - NARRATOR\\06 - NARRATOR.mp3",
  root + "Animation story - cue sheet.csv",
  root + "Animation story - production report.md",
  root + "Animation story - manifest.sha256.txt",
];

describe("export groups", () => {
  it("groups the lines by character and counts them", () => {
    const g = groupExports(sample);
    const narrator = g.find((x) => x.id === "char-NARRATOR")!;
    expect(narrator.files).toHaveLength(2);
    expect(narrator.note).toBe("2 lines, untouched originals");
    expect(g.find((x) => x.id === "char-PIP")!.note).toBe("1 line, untouched originals");
  });
  it("separates mixes from records", () => {
    const g = groupExports(sample);
    expect(g.find((x) => x.id === "mixes")!.files.map((f) => f.label)).toEqual(["Animation story - full scene.wav"]);
    expect(g.find((x) => x.id === "records")!.files).toHaveLength(3);
  });
  it("lists stems by character name", () => {
    const g = groupExports([root + "Stems\\Animation story - stem - BOLO.wav", root + "Stems\\Animation story - stem - PIP.wav"]);
    expect(g.find((x) => x.id === "stems")!.files.map((f) => f.label)).toEqual(["BOLO", "PIP"]);
  });
  it("orders mixes, stems, characters, then records", () => {
    const g = groupExports([...sample, root + "Stems\\Animation story - stem - PIP.wav"]);
    expect(g.map((x) => x.id)).toEqual(["mixes", "stems", "char-NARRATOR", "char-PIP", "records"]);
  });
  it("hints about stems only when per-line files exist without stems", () => {
    expect(stemsHint(groupExports(sample))).toBe(true);
    expect(stemsHint(groupExports([...sample, root + "Stems\\Animation story - stem - PIP.wav"]))).toBe(false);
    expect(stemsHint(groupExports([root + "x - full scene.wav"]))).toBe(false);
  });
  it("copes with forward slashes and an empty list", () => {
    expect(groupExports(["/tmp/Lines - ADA/01 - ADA.mp3"])[0]!.id).toBe("char-ADA");
    expect(groupExports([])).toEqual([]);
  });
});
