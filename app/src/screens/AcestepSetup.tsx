import { useEffect, useState } from "react";
import { api, type LocalRuntimeStatus } from "../api";
import { useApp } from "../ctx";
import { ACE_DOWNLOAD_GB, ACE_ENGINE_GB, musicStep } from "../localMusic";

/** One button: installs the GPU engine if needed, then downloads the verified model. */
export default function AcestepSetup({ state, percent, onState }: { state: string; percent: number; onState: (s: "downloading" | "installed" | "error" | "available") => void }) {
  const { confirmSpend, toast, go } = useApp();
  const [status, setStatus] = useState<LocalRuntimeStatus | null>(null);
  const [busy, setBusy] = useState<"engine" | "model" | null>(null);
  const [error, setError] = useState("");
  const refresh = () => void api.acestepStatus().then(setStatus).catch(() => undefined);
  useEffect(refresh, []);
  const step = musicStep(status);

  const install = async () => {
    setError("");
    const needEngine = !status?.installed;
    const needModel = !status?.modelReady;
    const ok = await confirmSpend({ title: "Install local music (ACE-Step)?", lines: [
      `Downloads ${needEngine ? `the GPU music engine (about ${ACE_ENGINE_GB} GB)` : ""}${needEngine && needModel ? " and " : ""}${needModel ? `the music model (${ACE_DOWNLOAD_GB} GB, every file checked)` : ""}.`,
      "Needs an NVIDIA graphics card with at least 8 GB of video memory. Music is made on this computer and stays private.",
      "Licence: Apache-2.0. Check the model card before commercial use.",
    ], download: true });
    if (!ok) return;
    try {
      if (needEngine) { setBusy("engine"); setStatus(await api.acestepRuntimeInstall()); }
      if (needModel) { setBusy("model"); onState("downloading"); const r = await api.modelInstall("ace-step-v1"); onState(r.state === "installed" ? "installed" : "available"); }
      refresh(); toast("Local music is ready. Open Timeline, Make music on this PC.");
    } catch (e) { onState("error"); setError((e as Error).message); toast((e as Error).message, true); }
    finally { setBusy(null); }
  };

  if (step === "ready") return <div className="stack"><p className="muted small">Ready. Open the Timeline and use Make music on this PC.</p><div className="row wrap"><button className="primary" onClick={() => go("timeline")}>Open Timeline</button></div></div>;
  if (step === "gpu") return <p role="status" className="muted small">{status?.detail}</p>;
  return (
    <div className="stack">
      {status && <p className="muted small">{status.detail}</p>}
      <div className="row wrap">
        {busy === "model" ? <div className="download-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /><small>{percent}% file</small></div> :
          <button className="primary" disabled={busy !== null || state === "downloading"} onClick={() => void install()}>{busy === "engine" ? "Installing engine… (several minutes)" : "Install local music"}</button>}
      </div>
      {error && <p role="alert" className="error small">{error}</p>}
    </div>
  );
}
