import { describe, expect, it } from "vitest";
import { hash, lookFor, mix, traits } from "./avatar";

describe("avatar traits", () => {
  it("are the same every time for the same voice and differ between voices", () => {
    expect(traits("v1Ada", "feminine")).toEqual(traits("v1Ada", "feminine"));
    const faces = new Set(Array.from({ length: 60 }, (_, i) => JSON.stringify(traits("voice" + i, "neutral"))));
    expect(faces.size).toBeGreaterThan(40);
    expect(hash("a")).not.toBe(hash("b"));
  });
  it("read a gender hint kindly, and fall back to neutral", () => {
    expect(lookFor("female")).toBe("feminine");
    expect(lookFor("Male")).toBe("masculine");
    expect(lookFor("")).toBe("neutral");
    expect(lookFor(undefined)).toBe("neutral");
    expect(lookFor("non-binary")).toBe("neutral");
  });
  it("only give beards to faces that are not hinted feminine, and always give a valid style", () => {
    for (let i = 0; i < 80; i++) expect(traits("s" + i, "feminine").beard).toBe(false);
    const styles = new Set(Array.from({ length: 200 }, (_, i) => traits("t" + i, "neutral").style));
    for (const s of styles) expect(["long", "bob", "bun", "curls", "wrap", "short", "crop", "cap", "bald"]).toContain(s);
  });
});

describe("avatar colours", () => {
  it("blend two colours for soft shading", () => {
    expect(mix("#000000", "#ffffff", 0.5)).toBe("#808080");
    expect(mix("#102030", "#102030", 0.7)).toBe("#102030");
    expect(mix("#ff0000", "#ffffff", 0)).toBe("#ff0000");
  });
});
