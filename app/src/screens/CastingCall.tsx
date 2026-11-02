import { useEffect, useMemo, useRef, useState } from "react";
import { api, toUrl } from "../api";
import { useApp } from "../ctx";
import { Avatar } from "../avatar";
import { DESIGN_RECIPES, PIPER_ROLES, WAZOBIA_ROLES, type PiperRole } from "../castcall";
import { wazobiaVoiceEntry } from "../wazobia";

/** Voices grouped by accent, ready to add in one step. Local ones are free and work offline; recipes open Voice Design. */
export default function CastingCall({ onDesign }: { onDesign: (description: string, line: string) => void }) {
  const { confirmSpend, toast, library, saveLibrary, go } = useApp();
  const [accent, setAccent] = useState("All");
  const [busy, setBusy] = useState("");
  const [playing, setPlaying] = useState("");
  const [wazobia, setWazobia] = useState<string[] | null>(null);
  const [wLang, setWLang] = useState<"en" | "yo" | "ha" | "ig">("en");
  const audio = useRef<HTMLAudioElement | null>(null);
  const url = useRef("");
  useEffect(() => { void api.wazobiaVoices().then(setWazobia).catch(() => setWazobia([])); return () => { audio.current?.pause(); if (url.current) URL.revokeObjectURL(url.current); }; }, []);

  const accents = useMemo(() => ["All", ...Array.from(new Set(PIPER_ROLES.map((r) => r.accent)))], []);
  const shown = PIPER_ROLES.filter((r) => accent === "All" || r.accent === accent);
  const have = (key: string) => library.some((v) => v.provider === "piper" && v.id === key);

  const preview = async (r: PiperRole) => {
    if (playing === r.key) { audio.current?.pause(); setPlaying(""); return; }
    audio.current?.pause();
    setBusy(r.key);
    try {
      if (url.current) URL.revokeObjectURL(url.current);
      url.current = toUrl(await api.piperPreview(r.key));
      const a = new Audio(url.current); audio.current = a; a.onended = () => setPlaying("");
      await a.play(); setPlaying(r.key);
    } catch (e) { toast((e as Error).message, true); } finally { setBusy(""); }
  };
  const add = async (r: PiperRole) => {
    const ok = await confirmSpend({ title: `Add ${r.name} (${r.accent})?`, lines: [`Downloads about ${r.mb} MB, then it works offline.`, "If needed, Greenroom installs the small Piper speech engine first.", "Check the voice's licence before commercial use."], download: true });
    if (!ok) return;
    setBusy(r.key);
    try {
      const status = await api.piperStatus();
      if (!status.installed) await api.piperInstall();
      if (!status.voices.includes(r.key)) await api.piperInstallVoice(r.key);
      saveLibrary((l) => (l.some((v) => v.provider === "piper" && v.id === r.key) ? l : [...l, { id: r.key, name: `${r.name} (${r.accent})`, provider: "piper", source: "library", language: r.language, accent: r.accent, gender: "", notes: r.use, createdAt: new Date().toISOString() }]));
      toast(`${r.name} added to your library.`);
    } catch (e) { toast((e as Error).message, true); } finally { setBusy(""); }
  };
  const addWazobia = (voice: string) => {
    const e = wazobiaVoiceEntry(voice, wLang);
    if (library.some((v) => v.id === e.id && v.provider === "wazobia")) { toast(`${e.name} is already in your library.`); return; }
    saveLibrary((l) => [...l, { ...e, createdAt: new Date().toISOString() }]);
    toast(`${e.name} added to your library.`);
  };
  const wazobiaReady = (wazobia?.length ?? 0) > 0;

  return (
    <div className="stack casting">
      <div><span className="eyebrow">CASTING CALL</span><h2>Voices by accent, ready to add</h2><p className="muted">Hear a voice, press Add, and it is in your library for any character. Local voices are free and work offline. Accents come from each voice's region; judge how convincing they are by ear.</p></div>

      <div className="chips" role="group" aria-label="Accent filter">{accents.map((a) => <button key={a} className="chip" aria-pressed={accent === a} onClick={() => setAccent(a)}>{a}</button>)}</div>
      <div className="shelf-grid">{shown.map((r) => <article className="shelf-voice" key={r.key}>
        <Avatar seed={r.key} size={54} />
        <div className="shelf-info"><strong>{r.name}</strong><span>{r.accent} · {r.language}</span><small>{r.use} · {r.mb} MB</small></div>
        <div className="shelf-actions">
          <button className="sm" disabled={busy === r.key} onClick={() => void preview(r)} aria-label={`${playing === r.key ? "Stop" : "Hear"} ${r.name}`}>{playing === r.key ? "Stop" : "Hear"}</button>
          <button className="primary sm" disabled={busy === r.key || have(r.key)} onClick={() => void add(r)}>{have(r.key) ? "In library" : busy === r.key ? "Adding…" : "Add"}</button>
        </div>
      </article>)}</div>

      <div className="card stack">
        <div><h3>NIGERIAN LANGUAGES · WAZOBIAVOICE</h3><p className="muted small">Nigerian English, Yoruba, Hausa and Igbo, {WAZOBIA_ROLES.length / 4} voices each. Research licence: not for commercial use.</p></div>
        {wazobiaReady ? <>
          <div className="row wrap"><label className="small muted" htmlFor="cc-lang">Language</label><select id="cc-lang" value={wLang} onChange={(e) => setWLang(e.target.value as typeof wLang)}><option value="en">Nigerian English</option><option value="yo">Yoruba</option><option value="ha">Hausa</option><option value="ig">Igbo</option></select></div>
          <div className="chips">{wazobia?.map((v) => <button className="chip" key={v} onClick={() => addWazobia(v)}>+ {v.replace("_", " ")}</button>)}</div>
        </> : <div className="row wrap"><button className="primary" onClick={() => go("models")}>Set up WazobiaVoice</button><span className="muted small">A free Hugging Face account and about 3.2 GB.</span></div>}
      </div>

      <div className="stack">
        <div><h3>DESIGN RECIPES · ELEVENLABS (PAID)</h3><p className="muted small">Ready-written descriptions for characters the local voices cannot cover. Opening one fills Design a voice. Nothing is spent until you press generate.</p></div>
        <div className="shelf-grid">{DESIGN_RECIPES.map((r) => <article className="shelf-voice" key={r.id}>
          <Avatar seed={r.id} size={54} />
          <div className="shelf-info"><strong>{r.name}</strong><span>{r.accent}</span><small>{r.description.slice(0, 70)}…</small></div>
          <div className="shelf-actions"><button className="sm" onClick={() => onDesign(r.description, r.line)}>Open in Design</button></div>
        </article>)}</div>
      </div>
    </div>
  );
}
