import { describe, expect, it } from "vitest";
import { checkLocalMusic, localMusicSource, musicStep } from "./localMusic";

describe("local music", () => {
  it("accepts a normal request and mirrors the backend limits", () => {
    expect(checkLocalMusic("calm piano", "", 20)).toBeNull();
    expect(checkLocalMusic("  ", "", 20)).toMatch(/Describe/);
    expect(checkLocalMusic("x".repeat(1001), "", 20)).toMatch(/1000/);
    expect(checkLocalMusic("ok", "y".repeat(2001), 20)).toMatch(/2000/);
    expect(checkLocalMusic("ok", "", 9)).toMatch(/between 10 and 90/);
    expect(checkLocalMusic("ok", "", 91)).toMatch(/between 10 and 90/);
    expect(checkLocalMusic("ok", "", 20.5)).toMatch(/between/);
  });
  it("sends the card to install, ready or a hard stop for no NVIDIA card", () => {
    expect(musicStep(null)).toBe("install");
    expect(musicStep({ installed: true, modelReady: true, detail: "Ready" })).toBe("ready");
    expect(musicStep({ installed: true, modelReady: false, detail: "Engine ready" })).toBe("install");
    expect(musicStep({ installed: false, modelReady: false, detail: "ACE-Step needs an NVIDIA graphics card with at least 8 GB of video memory. None was found." })).toBe("gpu");
  });
  it("writes a source note that says the music stayed on the computer", () => {
    expect(localMusicSource("warm piano", "2026-11-02")).toMatch(/ACE-Step.*No audio left the computer/);
  });
});
