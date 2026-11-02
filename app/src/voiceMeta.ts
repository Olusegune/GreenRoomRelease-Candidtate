import type { VoiceEntry } from "./types";

export interface MetaChip { kind: "language" | "accent" | "gender" | "text"; text: string }

const title = (s: string) => s.trim().replace(/^./, (c) => c.toUpperCase());

/** The facts a voice card shows as chips, in a fixed order, only when known. Older entries that only have a combined line still show it. */
export function voiceChips(v: Pick<VoiceEntry, "language" | "accent" | "gender">, fallbackLine = ""): MetaChip[] {
  const out: MetaChip[] = [];
  if (v.language.trim()) out.push({ kind: "language", text: v.language.trim().length <= 3 ? v.language.trim().toUpperCase() : title(v.language) });
  if (v.accent.trim()) out.push({ kind: "accent", text: title(v.accent) });
  if (v.gender.trim()) out.push({ kind: "gender", text: title(v.gender) });
  if (out.length === 0 && fallbackLine.trim()) out.push({ kind: "text", text: fallbackLine.trim() });
  return out;
}

/** Favourites first, everything else in its existing order (a stable partition). */
export function favouritesFirst<T>(items: T[], isFavourite: (item: T) => boolean): T[] {
  return [...items.filter(isFavourite), ...items.filter((x) => !isFavourite(x))];
}
