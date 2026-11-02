import { describe, expect, it } from "vitest";
import { DEFAULT_ENGINES_CFG, directorReady } from "./engines";

describe("director engine", () => {
  it("defaults to the cloud Director so existing projects are unchanged", () => {
    expect(DEFAULT_ENGINES_CFG.directorEngine).toBeUndefined();
    expect(directorReady({}, { kie: true }, false)).toBe(true);
    expect(directorReady({}, { kie: false }, true)).toBe(false);
  });
  it("is ready on this PC only when the engine and model are installed, whatever the keys", () => {
    expect(directorReady({ directorEngine: "local" }, { kie: true }, false)).toBe(false);
    expect(directorReady({ directorEngine: "local" }, { kie: false }, true)).toBe(true);
  });
});
