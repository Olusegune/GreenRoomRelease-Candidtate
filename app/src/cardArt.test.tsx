import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ART_HUES, artSpec, CardArt, hash } from "./cardArt";

describe("card art", () => {
  it("is deterministic: the same seed and kind always make the same picture", () => {
    const a = renderToStaticMarkup(<CardArt seed="wazobia-voice" kind="speech" label="Voice" />);
    const b = renderToStaticMarkup(<CardArt seed="wazobia-voice" kind="speech" label="Voice" />);
    expect(a).toBe(b);
  });
  it("differs between seeds and between kinds", () => {
    const m = (seed: string, kind: "speech" | "music") => renderToStaticMarkup(<CardArt seed={seed} kind={kind} />);
    expect(m("a", "speech")).not.toBe(m("b", "speech"));
    expect(m("a", "speech")).not.toBe(m("a", "music"));
  });
  it("keeps each kind inside its own colour family, within a small shift", () => {
    for (const kind of Object.keys(ART_HUES) as (keyof typeof ART_HUES)[]) {
      for (const seed of ["x", "y", "z", "model-1", "model-2"]) {
        const s = artSpec(seed, kind);
        const [b1] = ART_HUES[kind];
        const d = Math.min(Math.abs(s.h1 - b1), 360 - Math.abs(s.h1 - b1));
        expect(d, `${kind}/${seed}`).toBeLessThanOrEqual(15);
      }
    }
  });
  it("is a decorative SVG with unique ids, a waveform and an optional label", () => {
    const html = renderToStaticMarkup(<CardArt seed="s" kind="sfx" label="Sound" />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("SOUND");
    expect((html.match(/<rect /g) ?? []).length + (html.match(/<path /g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(artSpec("a", "voice").id).not.toBe(artSpec("b", "voice").id);
    expect(hash("a")).toBe(hash("a"));
  });
  it("uses all three waveform styles across seeds", () => {
    const v = new Set(Array.from({ length: 30 }, (_, i) => artSpec("seed-" + i, "voice").variant));
    expect(v).toEqual(new Set([0, 1, 2]));
  });
  it("draws no label when none is given", () => {
    expect(renderToStaticMarkup(<CardArt seed="s" kind="story" />)).not.toContain("<text");
  });
});
