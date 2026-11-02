import { describe, expect, it } from "vitest";
import { buildDescription, directionWords, NO_CHOICES, sampleFrom } from "./voiceBrief";

const l = (text: string, emotion = "", note = "") => ({ text, emotion, note });

describe("voice brief", () => {
  it("uses the delivery words the script gives, most common first", () => {
    const words = directionWords([l("a", "gruff"), l("b", "gruff"), l("c", "weary, slow"), l("d", "")]);
    expect(words).toEqual(["gruff", "slow", "weary"]);
  });
  it("leaves sound cues out of the manner and words the sentence correctly", () => {
    const d = buildDescription("PIP", [l("a", "excited"), l("b", "laughs"), l("c", "worried, whispering")]);
    expect(d).toContain("Typical delivery: excited, whispering, worried");
    expect(d).not.toMatch(/laughs|a excited/);
  });
  it("never guesses age or gender from a name", () => {
    const d = buildDescription("Adaeze", [l("Hello.")]);
    expect(d).not.toMatch(/woman|man\b|girl|boy|feminine|masculine|young|old/i);
    expect(d).toContain("Adaeze");
  });
  it("includes only the age and voice type the person chose", () => {
    const d = buildDescription("Tunde", [l("Hi")], { ...NO_CHOICES, age: "older", type: "masculine" });
    expect(d).toMatch(/older masculine voice/);
  });
  it("adds an accent sentence from the shared accent list", () => {
    const d = buildDescription("Ife", [l("Hi")], { ...NO_CHOICES, accent: "Scottish English" });
    expect(d).toMatch(/Scottish accent/);
  });
  it("describes a narrator as a storyteller and keeps the person's own words", () => {
    const d = buildDescription("NARRATOR", [l("Once upon a time.")], { ...NO_CHOICES, extra: "slightly husky, in her sixties" });
    expect(d).toMatch(/storyteller/);
    expect(d).toMatch(/slightly husky, in her sixties\./);
  });
  it("always meets the designer's 20 to 1000 character range", () => {
    expect(buildDescription("X", []).length).toBeGreaterThanOrEqual(20);
    expect(buildDescription("X", [], { ...NO_CHOICES, extra: "y".repeat(2000) }).length).toBeLessThanOrEqual(1000);
  });
  it("offers a spoken sample only when the lines are long enough", () => {
    expect(sampleFrom([l("Short line.")])).toBe("");
    const long = [l("I have waited a very long time for this day, and I will not let anyone take it from me."), l("[sighs] Now, let us begin, and quickly, before the light fades.")];
    const s = sampleFrom(long);
    expect(s.length).toBeGreaterThanOrEqual(100);
    expect(s).not.toMatch(/\[/);
  });
  it("stops the sample at the end of a sentence when it must cut", () => {
    const sentence = "I have waited a very long time for this day and I will not give it up. ";
    const s = sampleFrom([l(sentence.repeat(8))]);
    expect(s.length).toBeLessThanOrEqual(400);
    expect(s.endsWith(".")).toBe(true);
  });
});
