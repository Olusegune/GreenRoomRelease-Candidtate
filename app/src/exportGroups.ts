/** Groups the files an export saved, so "where is each character's audio?" has an obvious answer. */
export interface ExportFile { path: string; label: string }
export interface ExportGroup { id: string; title: string; note?: string; files: ExportFile[] }

const base = (p: string) => p.replace(/\\/g, "/").split("/").pop() ?? p;
const parent = (p: string) => p.replace(/\\/g, "/").split("/").slice(-2, -1)[0] ?? "";

export function groupExports(paths: string[]): ExportGroup[] {
  const mixes: ExportFile[] = [];
  const stems: ExportFile[] = [];
  const records: ExportFile[] = [];
  const characters = new Map<string, ExportFile[]>();

  for (const path of paths) {
    const name = base(path);
    const folder = parent(path);
    const lines = /^Lines - (.+)$/.exec(folder);
    if (folder === "Stems") stems.push({ path, label: name.replace(/^.* - stem - /, "").replace(/\.wav$/i, "") });
    else if (lines) characters.set(lines[1]!, [...(characters.get(lines[1]!) ?? []), { path, label: name }]);
    else if (/\.(wav|mp3)$/i.test(name)) mixes.push({ path, label: name });
    else records.push({ path, label: name });
  }

  const out: ExportGroup[] = [];
  if (mixes.length) out.push({ id: "mixes", title: "Mixes", files: mixes });
  if (stems.length) out.push({ id: "stems", title: "One full track per character and sound", note: "All the same length, so they line up in an editor and add back up to the mix.", files: stems });
  for (const [name, files] of characters) out.push({ id: "char-" + name, title: `${name}: every line`, note: `${files.length} line${files.length === 1 ? "" : "s"}, untouched originals`, files });
  if (records.length) out.push({ id: "records", title: "Cue sheets, editor files and records", files: records });
  return out;
}

/** Shown when lines were saved per character but no full per-character tracks were. */
export const stemsHint = (groups: ExportGroup[]): boolean => groups.some((g) => g.id.startsWith("char-")) && !groups.some((g) => g.id === "stems");
