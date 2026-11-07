import { describe, expect, it } from "vitest";
import { parsePlayback, playToggle } from "./media";

describe("play button", () => {
  it("starts, pauses, resumes and waits, depending on what it shows", () => {
    expect(playToggle("idle")).toBe("start");
    expect(playToggle("playing")).toBe("pause");
    expect(playToggle("paused")).toBe("resume");
    expect(playToggle("loading")).toBe("wait");
  });
  it("reads the shared playback state and which source started it", () => {
    expect(parsePlayback("idle|")).toEqual({ state: "idle", source: "" });
    expect(parsePlayback("paused|scene")).toEqual({ state: "paused", source: "scene" });
  });
});
