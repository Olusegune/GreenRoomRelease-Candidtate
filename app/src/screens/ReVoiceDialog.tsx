import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { fromBase64 } from "../audio";
import { useApp } from "../ctx";
import { remember } from "../media";
import { uid } from "../script";
import { checkRecording, convertedTake, decodeToWav, sampleExt } from "../speechToSpeech";
import { sha256Hex } from "../trust";
import type { Character, Line, Take, VoiceEntry } from "../types";
import { Note } from "../ui";
import { useSample } from "../useSample";
import { APP_VERSION } from "../version";

type Source = { url: string; b64: string; seconds: number; label: string };

/** Speech to speech: perform the line yourself, then hear it in the character's voice. The timing, pauses and emotion are yours. */
export default function ReVoiceDialog({ line, character, voice, projectId, onClose, onDone }: { line: Line; character?: Character; voice: VoiceEntry; projectId: string; onClose: () => void; onDone: (t: Take) => void }) {
  const { toast, go } = useApp();
  const sample = useSample();
  const [source, setSource] = useState<Source | null>(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const url = useRef("");
  useEffect(() => { void api.chatterboxReady().then(setReady).catch(() => setReady(false)); return () => { stream.current?.getTracks().forEach((t) => t.stop()); if (url.current) URL.revokeObjectURL(url.current); }; }, []);

  const take = async (data: ArrayBuffer, blob: Blob, label: string) => {
    try {
      const { b64, seconds } = await decodeToWav(data);
      const problem = checkRecording(seconds);
      if (problem) { setError(problem); return; }
      if (url.current) URL.revokeObjectURL(url.current);
      url.current = URL.createObjectURL(blob);
      setSource({ url: url.current, b64, seconds, label });
      setError("");
    } catch { setError("Greenroom could not read that audio. Try a WAV or MP3 file, or record again."); }
  };

  const start = async () => {
    setError("");
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.current = media;
      const chunks: Blob[] = [];
      const rec = new MediaRecorder(media);
      rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = () => { media.getTracks().forEach((t) => t.stop()); const blob = new Blob(chunks, { type: rec.mimeType }); void blob.arrayBuffer().then((buf) => take(buf, blob, "recorded on this computer")); };
      recorder.current = rec;
      rec.start();
      setRecording(true);
    } catch { setError("Greenroom could not use the microphone. Allow microphone access, or choose a recording file instead."); }
  };
  const stop = () => { recorder.current?.stop(); setRecording(false); };
  const choose = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    if (f.size > 40_000_000) { setError("That file is too large. Use a recording up to about 5 minutes."); return; }
    await take(await f.arrayBuffer(), f, `file ${f.name.slice(0, 40)}`);
  };

  const convert = async () => {
    if (!source) return;
    setBusy(true); setError("");
    try {
      const sampleUrl = await sample(voice); // the target voice, as a few seconds of the character's own voice
      const blob = await (await fetch(sampleUrl)).blob();
      const targetB64 = btoa(Array.from(new Uint8Array(await blob.arrayBuffer()), (b) => String.fromCharCode(b)).join(""));
      const out = await api.voiceConvert({ sourceB64: source.b64, sourceExt: "wav", targetB64, targetExt: sampleExt(blob.type) });
      const id = "t-" + uid();
      await api.takeWrite(projectId, id, "wav", out.audioB64);
      const seconds = await remember(id, out);
      const sha256 = await sha256Hex(fromBase64(out.audioB64));
      onDone(convertedTake({ id, at: new Date().toISOString(), voice, seconds, sha256, appVersion: APP_VERSION, source: source.label, emotion: line.direction.emotion, note: line.direction.note ?? "" }));
      toast(`Re-voiced as ${voice.name}. It is added as a take on this line.`);
      onClose();
    } catch (e) { const m = (e as Error).message; if (m !== "cancelled") setError(m); }
    finally { setBusy(false); }
  };

  return (
    <div className="scrim" role="presentation">
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="rv-t" style={{ maxWidth: 560, width: "92vw" }}>
        <h2 id="rv-t">Re-voice a recording as {voice.name}</h2>
        <p className="muted small">Perform {character ? `${character.name}'s` : "the"} line yourself, in your own timing and emotion. Greenroom keeps your performance and changes only the voice. It runs on this computer: the recording is not uploaded.</p>
        <blockquote className="muted small" style={{ margin: "8px 0" }}>{line.text}</blockquote>
        {ready === false && <Note kind="warn">Voice conversion uses the Chatterbox engine and model, which are not installed yet. <button className="sm" onClick={() => { onClose(); go("models"); }}>Open Model Center</button></Note>}
        <div className="row wrap">
          {!recording ? <button className="primary" disabled={busy} onClick={() => void start()}>Record</button> : <button className="primary" onClick={stop}>Stop recording</button>}
          <label className="sm" style={{ cursor: "pointer" }}><button type="button" className="sm" disabled={busy || recording} onClick={(e) => (e.currentTarget.nextElementSibling as HTMLInputElement).click()}>Choose a recording</button><input type="file" accept="audio/*" aria-label="Choose a recording" style={{ display: "none" }} onChange={(e) => void choose(e)} /></label>
          {recording && <span className="muted small" role="status">Recording… speak the line, then press Stop.</span>}
        </div>
        {source && (
          <div className="card stack lit">
            <div className="row wrap"><audio controls src={source.url} /><span className="muted small">{source.seconds.toFixed(1)} s, {source.label}</span></div>
            <button className="primary" disabled={busy || ready === false} onClick={() => void convert()}>{busy ? "Re-voicing… (about a minute on most PCs)" : `Re-voice as ${voice.name}`}</button>
          </div>
        )}
        {error && <p role="alert" className="error small">{error}</p>}
        <div className="row"><button onClick={onClose} disabled={busy}>Close</button></div>
      </div>
    </div>
  );
}
