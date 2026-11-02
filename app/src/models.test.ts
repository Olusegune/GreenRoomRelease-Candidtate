import { describe, expect, it } from "vitest";
import { MODEL_CATALOG, recommendedModels, totalDownload } from "./models";

describe("model catalogue", () => {
  it("keeps studio models off compact machines", () => {
    expect(recommendedModels({ platform: "windows", memoryGb: 8, accelerator: "CPU", vramGb: 0, tier: "compact" })).toEqual(["greenroom-runtime", "kokoro-82m"]);
  });
  it("calculates a setup download", () => {
    expect(totalDownload(["greenroom-runtime", "whisper-large-v3-turbo"], MODEL_CATALOG)).toBeCloseTo(2.9);
  });
});

import { modelArt, shortDescription } from "./models";
describe("model card helpers", () => {
  it("shortens a description to its first sentence", () => {
    expect(shortDescription("Makes music on your PC. Free and private. Needs a GPU.")).toBe("Makes music on your PC.");
  });
  it("cuts a very long first sentence at a word with an ellipsis", () => {
    const out = shortDescription("word ".repeat(60).trim() + ".", 40);
    expect(out.length).toBeLessThanOrEqual(41);
    expect(out.endsWith("…")).toBe(true);
  });
  it("gives each kind of model its own artwork family and label", () => {
    expect(modelArt({ id: "ace-step-v1", kind: "audio" })).toEqual({ kind: "music", label: "Music" });
    expect(modelArt({ id: "stable-audio-open-small", kind: "audio" })).toEqual({ kind: "sfx", label: "Sound" });
    expect(modelArt({ id: "director-qwen3-4b", kind: "director" }).kind).toBe("director");
    expect(modelArt({ id: "wazobia-voice", kind: "speech" })).toEqual({ kind: "speech", label: "Voice" });
    expect(modelArt({ id: "whisper", kind: "transcription" }).kind).toBe("content");
  });
});
