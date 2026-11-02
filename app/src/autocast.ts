import { PIPER_ROLES, type PiperRole } from "./castcall";
import type { Character, VoiceEntry } from "./types";

/** Names that usually mean a storyteller or announcer rather than a person in the scene. */
const NARRATION = /^(narrator|narration|announcer|host|presenter|voiceover|voice over|instructor|reader|storyteller)\b/i;
const LOCAL: VoiceEntry["provider"][] = ["piper", "wazobia", "chatterbox", "local"];

export const wantsNarration = (name: string) => NARRATION.test(name.trim());
const norm = (s: string) => s.trim().toLowerCase();

function suits(v: Pick<VoiceEntry, "notes" | "name">, narration: boolean): boolean {
  const text = `${v.notes} ${v.name}`.toLowerCase();
  return /narrat|documentary|audiobook|announcer|presenter|lecturer/.test(text) === narration;
}

export interface CastPlan {
  /** Character id to library voice id, for characters that had none. */
  assign: Record<string, string>;
  /** Voices from the Casting call that would fill the characters the library could not. */
  suggestions: { characterId: string; role: PiperRole }[];
}

/**
 * Picks a distinct voice for every character that has none. Existing choices are never touched. A voice is reused only
 * when the library has fewer voices than characters. It prefers the character's language, then a different accent from
 * those already used, then free local voices. Narration names get narration voices. Gender is never guessed from a name:
 * only a voice's own recorded gender is ever shown, and it is not used to match characters.
 */
export function planCast(characters: Character[], library: VoiceEntry[], options: { roles?: PiperRole[]; preferLocal?: boolean } = {}): CastPlan {
  const roles = options.roles ?? PIPER_ROLES;
  const preferLocal = options.preferLocal ?? true;
  const valid = new Set(library.map((v) => v.id));
  const taken = new Set(characters.filter((c) => c.voiceId && valid.has(c.voiceId)).map((c) => c.voiceId!));
  const accents = new Set(library.filter((v) => taken.has(v.id)).map((v) => norm(v.accent)).filter(Boolean));
  const needs = characters.filter((c) => !c.voiceId || !valid.has(c.voiceId));
  const plan: CastPlan = { assign: {}, suggestions: [] };
  const usedRoles = new Set<string>(library.filter((v) => v.provider === "piper").map((v) => v.id));

  // Narration first, so the storyteller gets first pick of the narration voices.
  const ordered = [...needs].sort((a, b) => Number(wantsNarration(b.name)) - Number(wantsNarration(a.name)));
  for (const c of ordered) {
    const narration = wantsNarration(c.name);
    const free = library.filter((v) => !taken.has(v.id));
    const pool = free.length > 0 ? free : library;
    if (library.length === 0 || (free.length === 0 && roles.length > 0 && !plan.assign[c.id])) {
      // The library is out of distinct voices: reuse one, but also offer a fresh voice from the Casting call.
      const fresh = roles.filter((r) => !usedRoles.has(r.key) && norm(r.language) === norm(c.language)).sort((a, b) => Number(suits({ notes: b.use, name: b.name }, narration)) - Number(suits({ notes: a.use, name: a.name }, narration)))[0]
        ?? roles.find((r) => !usedRoles.has(r.key));
      if (fresh) { plan.suggestions.push({ characterId: c.id, role: fresh }); usedRoles.add(fresh.key); }
    }
    if (pool.length === 0) continue;
    const score = (v: VoiceEntry) =>
      (norm(v.language) === norm(c.language) ? 100 : 0) +
      (suits(v, narration) ? 20 : 0) +
      (v.accent && !accents.has(norm(v.accent)) ? 10 : 0) +
      (preferLocal && LOCAL.includes(v.provider) ? 5 : 0);
    const best = [...pool].sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name))[0]!;
    plan.assign[c.id] = best.id;
    taken.add(best.id);
    if (best.accent) accents.add(norm(best.accent));
  }
  return plan;
}

export function describePlan(plan: CastPlan, characters: Character[], library: VoiceEntry[]): string[] {
  return Object.entries(plan.assign).map(([cid, vid]) => `${characters.find((c) => c.id === cid)?.name ?? cid}: ${library.find((v) => v.id === vid)?.name ?? vid}`);
}
