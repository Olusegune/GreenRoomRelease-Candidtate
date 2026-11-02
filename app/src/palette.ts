export const ACCENTS = [
  { id: "emerald", label: "Emerald", swatch: "#52d68a", note: "The Greenroom logo green" },
  { id: "amber", label: "On-air amber", swatch: "#f2b544", note: "Studio tally light, warm" },
  { id: "azure", label: "Azure", swatch: "#5aa9ff", note: "Cool and calm" },
  { id: "violet", label: "Violet", swatch: "#9b8cff", note: "Creative, soft" },
  { id: "coral", label: "Record coral", swatch: "#ff7a6b", note: "Record-button warmth" },
] as const;
export type AccentId = (typeof ACCENTS)[number]["id"];
export type SurfaceId = "graphite" | "tinted";

export const DEFAULT_PALETTE = { accent: "emerald" as AccentId, surface: "graphite" as SurfaceId };

export function readPalette(get: (k: string) => string | null): { accent: AccentId; surface: SurfaceId } {
  const a = get("greenroom-accent");
  const s = get("greenroom-surface");
  return {
    accent: ACCENTS.some((x) => x.id === a) ? (a as AccentId) : DEFAULT_PALETTE.accent,
    surface: s === "tinted" ? "tinted" : DEFAULT_PALETTE.surface,
  };
}

/** Emerald and the graphite surface are the defaults, so only other choices need an attribute. */
export function applyPalette(root: { dataset: Record<string, string | undefined> }, p: { accent: AccentId; surface: SurfaceId }) {
  if (p.accent === "emerald") delete root.dataset.accent; else root.dataset.accent = p.accent;
  if (p.surface === "graphite") root.dataset.surface = "graphite"; else delete root.dataset.surface;
}

export function loadAndApplyPalette() {
  let stored: (k: string) => string | null = () => null;
  try { stored = (k) => localStorage.getItem(k); } catch { /* private mode: use the defaults */ }
  applyPalette(document.documentElement, readPalette(stored));
}

export function savePalette(p: { accent: AccentId; surface: SurfaceId }) {
  try { localStorage.setItem("greenroom-accent", p.accent); localStorage.setItem("greenroom-surface", p.surface); } catch { /* not saved */ }
}
