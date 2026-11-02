import { describe, expect, it } from "vitest";
import { SOUND_ENGINES, soundEngineOf, soundReady } from "./engines";

const keys = { elevenlabs: false, kie: false };

describe("sound engines", () => {
  it("offers the on-this-PC engine as free and limited to 11 seconds", () => {
    const local = SOUND_ENGINES.find((e) => e.id === "local")!;
    expect(local).toMatchObject({ provider: "local-sfx", free: true, maxSeconds: 11 });
    expect(SOUND_ENGINES.filter((e) => e.free).length).toBe(1);
  });
  it("is ready only when its engine and model are installed, regardless of cloud keys", () => {
    const local = soundEngineOf({ soundEngine: "local" });
    expect(soundReady(local, { elevenlabs: true, kie: true }, false)).toBe(false);
    expect(soundReady(local, keys, true)).toBe(true);
  });
  it("cloud engines still depend on their own key and ignore the local install", () => {
    expect(soundReady(soundEngineOf({ soundEngine: "elevenlabs" }), keys, true)).toBe(false);
    expect(soundReady(soundEngineOf({ soundEngine: "kie" }), { ...keys, kie: true }, false)).toBe(true);
  });
  it("keeps ElevenLabs as the default so existing projects are unchanged", () => {
    expect(soundEngineOf({}).id).toBe("elevenlabs");
  });
});
