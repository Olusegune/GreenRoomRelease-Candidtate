import { useEffect, useState } from "react";
import { api, type LocalRuntimeStatus } from "../api";
import { useApp } from "../ctx";
import { installHint, nextStep, TOKEN_PAGE } from "../wazobia";

export const SFX_PAGE = "https://huggingface.co/stabilityai/stable-audio-open-small";
const open = (url: string) => { void import("@tauri-apps/plugin-opener").then(({ openUrl }) => openUrl(url)).catch(() => window.open(url, "_blank", "noopener")); };

/** Same golden path as WazobiaVoice: token, accept the terms, then one install button for the engine and the model. */
export default function SfxSetup({ percent, onState }: { percent: number; onState: (s: "downloading" | "installed" | "error" | "available") => void }) {
  const { keys, refreshKeys, confirmSpend, toast, go } = useApp();
  const [status, setStatus] = useState<LocalRuntimeStatus | null>(null);
  const [termsOpened, setTermsOpened] = useState(false);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState<"engine" | "model" | null>(null);
  const [error, setError] = useState("");
  const refresh = () => void api.sfxStatus().then(setStatus).catch(() => undefined);
  useEffect(refresh, []);
  const ready = !!status?.installed && !!status?.modelReady;
  // Reuse the WazobiaVoice step order: token, terms, then install. The engine and model are one button here.
  const step = nextStep({ hasToken: keys.huggingface, termsOpened, engineReady: true, modelReady: ready });
  const fail = (e: unknown) => { const m = (e as Error).message; setError(`${m} ${installHint(m)}`); toast(m, true); };

  const saveToken = async () => {
    setError("");
    try { await api.setKey("huggingface", token); setToken(""); refreshKeys(); toast("Hugging Face token saved in your system credential store."); } catch (e) { fail(e); }
  };
  const install = async () => {
    setError("");
    const ok = await confirmSpend({ title: "Install local sound effects?", lines: [
      `Downloads the sound-effects engine (about 3 GB) if needed, then the Stable Audio Open Small model (about 1.7 GB) and its text encoder (about 0.9 GB). Every file is checked.`,
      "Uses your Hugging Face token for the gated model. Sounds are made on this computer, up to 11 seconds each.",
      "Licence: Stability AI Community License, free below its revenue limit. Read it before commercial use.",
    ], download: true });
    if (!ok) return;
    try {
      if (!status?.installed) { setBusy("engine"); setStatus(await api.sfxRuntimeInstall()); }
      setBusy("model"); onState("downloading");
      const s = await api.sfxInstallModels(); setStatus(s);
      onState(s.installed && s.modelReady ? "installed" : "available");
      toast("Local sound effects are ready. Pick them as the Sound engine in Engines, or in SFX Studio.");
    } catch (e) { onState("error"); fail(e); }
    finally { setBusy(null); }
  };

  if (ready) return <div className="stack"><p className="muted small">Ready. Choose Stable Audio Open as the Sound engine in Engines, then use SFX Studio.</p><div className="row wrap"><button className="primary" onClick={() => go("engines")}>Open Engines</button></div></div>;
  return (
    <div className="stack">
      {status && <p className="muted small">{status.detail}</p>}
      {step === "token" && <div className="row wrap"><input type="password" aria-label="Hugging Face read token" placeholder="Paste a read token (hf_…)" value={token} onChange={(e) => setToken(e.target.value)} autoComplete="off" style={{ flex: 1, minWidth: 220 }} /><button className="primary" disabled={!token.trim()} onClick={() => void saveToken()}>Save token</button><button className="sm" onClick={() => open(TOKEN_PAGE)}>Create a token ↗</button></div>}
      {step !== "token" && <div className="row wrap">
        {busy === "model" ? <div className="download-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /><small>{percent}% file</small></div> :
          step === "terms" ? <><button className="primary" onClick={() => { open(SFX_PAGE); setTermsOpened(true); }}>Open model page</button><button onClick={() => setTermsOpened(true)}>I already accepted</button></> :
          <button className="primary" disabled={busy !== null} onClick={() => void install()}>{busy === "engine" ? "Installing engine… (several minutes)" : "Install local sound effects"}</button>}
        <button className="sm" onClick={() => open(SFX_PAGE)}>Model page ↗</button>
      </div>}
      {error && <p role="alert" className="error small">{error}</p>}
    </div>
  );
}
