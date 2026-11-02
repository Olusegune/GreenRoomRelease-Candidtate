import type { Pronunciation } from "./types";

const MAX_RULES = 2000;
const MAX_FIELD = 120;

/** Splits one CSV line, honouring double quotes and doubled quotes inside them. Tabs and semicolons also separate columns. */
function splitLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  const sep = line.includes(",") ? "," : line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

export interface CsvResult { rules: Pronunciation[]; skipped: number; truncated: boolean }

/** Reads `written,spoken` rows. A header row (written/from/word and spoken/to/say) is skipped. Bad rows are counted, not fatal. */
export function parsePronunciationCsv(text: string): CsvResult {
  const rows = text.replace(/^﻿/, "").replace(/\r\n?/g, "\n").split("\n").filter((r) => r.trim() !== "");
  const rules: Pronunciation[] = [];
  let skipped = 0;
  let truncated = false;
  rows.forEach((row, i) => {
    const [from, to] = splitLine(row);
    if (i === 0 && /^(written|from|word|text)$/i.test(from ?? "") && /^(spoken|to|say|sounds?|pronunciation|respelling)$/i.test(to ?? "")) return;
    if (!from || !to || from.length > MAX_FIELD || to.length > MAX_FIELD) { skipped++; return; }
    if (rules.length >= MAX_RULES) { truncated = true; return; }
    rules.push({ from, to });
  });
  return { rules, skipped, truncated };
}

/** Adds incoming rules; a rule for a word already present (any case) replaces it. */
export function mergePronunciations(existing: Pronunciation[], incoming: Pronunciation[]): Pronunciation[] {
  const byKey = new Map(existing.map((r) => [r.from.toLowerCase(), r]));
  for (const r of incoming) byKey.set(r.from.toLowerCase(), r);
  return [...byKey.values()];
}

const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
export function pronunciationsToCsv(rules: Pronunciation[]): string {
  return ["written,spoken", ...rules.map((r) => `${cell(r.from)},${cell(r.to)}`)].join("\n") + "\n";
}
