import { describe, expect, it } from "vitest";
import { engineChip } from "./engineStatus";
import { parseScript } from "./script";
import { TEMPLATES } from "./templates";

describe("home templates", () => {
  it("each template parses into at least two lines and one scene", () => {
    for (const t of TEMPLATES) {
      const p = parseScript(t.script, [], []);
      expect(p.lines.length, t.id).toBeGreaterThanOrEqual(2);
      expect(p.scenes.length, t.id).toBeGreaterThanOrEqual(1);
      expect(p.characters.length, t.id).toBeGreaterThanOrEqual(1);
    }
  });
  it("has unique ids and covers the six starting points", () => {
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(6);
  });
  it("dialogue templates have more than one speaker", () => {
    const multi = ["podcast", "training", "advert", "game"];
    for (const id of multi) expect(parseScript(TEMPLATES.find((t) => t.id === id)!.script, [], []).characters.length, id).toBeGreaterThan(1);
  });
});

const none = { elevenlabs: false, kie: false, voicekiller: false, huggingface: false };
describe("engine chip", () => {
  it("asks for setup when nothing is ready", () => {
    expect(engineChip(none, [], false).level).toBe("setup");
  });
  it("says cloud only when only keys exist", () => {
    expect(engineChip({ ...none, elevenlabs: true }, [], false)).toMatchObject({ level: "partial", label: "Cloud voices" });
  });
  it("needs both an engine and a local voice to say offline ready", () => {
    expect(engineChip(none, [{ provider: "piper" }], true)).toMatchObject({ level: "ready", label: "Offline ready" });
    expect(engineChip(none, [], true).level).toBe("partial");
    expect(engineChip({ ...none, kie: true }, [{ provider: "wazobia" }], true).label).toBe("Local + cloud");
  });
});
