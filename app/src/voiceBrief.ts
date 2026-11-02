import { DESIGN_ACCENTS } from "./accents";
import { wantsNarration } from "./autocast";
import { SOUNDS } from "./direct";

/** Body sounds and effects (laughs, gasps, beeps) are not a manner of speaking, so they stay out of a voice description. */
const NOT_A_MANNER = new Set([...SOUNDS.map((x) => x.tag), "beeps", "beep", "static", "whistles", "sneezes", "screams", "shouts", "yells"]);

/** Builds a starting description for the voice designer from what the script already says about a character.
 *  Age and voice type are never guessed from a name: they come only from the person's own choice. */
export interface BriefLine { text: string; emotion: string; note?: string }
export interface BriefChoices { age: string; type: string; accent: string; extra: string }

export const AGES = ["", "child", "teenage", "young adult", "middle-aged", "older"] as const;
export const TYPES = ["", "feminine", "masculine", "neutral"] as const;
export const NO_CHOICES: BriefChoices = { age: "", type: "", accent: "", extra: "" };

/** The delivery words the script gives for this character: `(gruff)` in the script, or a direction set by the director. */
export function directionWords(lines: BriefLine[], max = 4): string[] {
  const counts = new Map<string, number>();
  for (const l of lines) {
    for (const raw of [l.emotion, l.note ?? ""]) {
      const w = raw.trim().toLowerCase().replace(/[^\p{L}\p{N} ,'-]+/gu, "");
      for (const part of w.split(",").map((x) => x.trim()).filter((x) => x.length >= 3 && x.length <= 24 && !NOT_A_MANNER.has(x))) counts.set(part, (counts.get(part) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, max).map(([w]) => w);
}

export function buildDescription(name: string, lines: BriefLine[], choices: BriefChoices = NO_CHOICES): string {
  const narration = wantsNarration(name);
  const words = directionWords(lines);
  const subject = [choices.age, choices.type].filter(Boolean).join(" ");
  const opening = narration ? `A ${subject ? subject + " " : ""}storyteller voice, calm, clear and easy to listen to` : `A ${subject ? subject + " " : ""}voice for a character called ${name.trim()}`;
  const manner = words.length ? `. Typical delivery: ${words.join(", ")}` : narration ? "" : ", natural and expressive";
  const accent = DESIGN_ACCENTS.find((a) => a.label === choices.accent);
  const parts = [opening + manner + ".", accent ? `The speaker ${accent.phrase}.` : "", choices.extra.trim() ? choices.extra.trim().replace(/[.\s]*$/, "") + "." : ""].filter(Boolean);
  let out = parts.join(" ");
  if (out.length < 20) out += " Natural, clear, easy to listen to.";
  return out.slice(0, 1000);
}

/** A line of at least 100 characters can be used as the spoken sample; shorter lines leave it to the designer. */
export function sampleFrom(lines: BriefLine[]): string {
  const clean = (t: string) => t.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
  const joined = lines.map((l) => clean(l.text)).filter(Boolean).join(" ");
  if (joined.length < 100) return "";
  const cut = joined.slice(0, 400);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
  // Prefer to stop at the end of a sentence; otherwise stop at a word.
  return end >= 100 ? cut.slice(0, end + 1) : joined.length <= 400 ? joined : cut.replace(/\s+\S*$/, "");
}
