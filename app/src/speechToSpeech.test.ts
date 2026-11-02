import { describe, expect, it } from "vitest";
import { checkRecording, convertedTake, sampleExt } from "./speechToSpeech";

describe("speech to speech", () => {
  it("accepts normal recordings and refuses empty or very long ones", () => {
    expect(checkRecording(3)).toBeNull();
    expect(checkRecording(0.2)).toMatch(/too short/);
    expect(checkRecording(0)).toMatch(/too short/);
    expect(checkRecording(301)).toMatch(/too long/);
    expect(checkRecording(NaN)).toMatch(/too short/);
  });
  it("maps a sample's type to a file type, defaulting to WAV", () => {
    expect(sampleExt("audio/mpeg")).toBe("mp3");
    expect(sampleExt("audio/flac")).toBe("flac");
    expect(sampleExt("audio/ogg; codecs=opus")).toBe("ogg");
    expect(sampleExt("audio/wav")).toBe("wav");
    expect(sampleExt("")).toBe("wav");
  });
  it("records in the take that a real person performed it", () => {
    const t = convertedTake({ id: "t-1", at: "2026-11-02T00:00:00Z", voice: { id: "v1", name: "Alan (British)", provider: "piper" }, seconds: 4.2, sha256: "a".repeat(64), appVersion: "0.2.8", source: "recorded on this computer", emotion: "worried", note: "" });
    expect(t).toMatchObject({ model: "chatterbox", ext: "wav", voiceId: "v1", seconds: 4.2 });
    expect(t.sent).toContain("speech to speech");
    expect(t.provenance!.instructions).toMatch(/real person performed this line/);
    expect(t.provenance!.chars).toBe(0);
    expect(t.provenance!.engine).toBe("chatterbox");
  });
});
