import { useEffect, useState } from "react";
import { api, type LocalRuntimeStatus } from "../api";
import { useApp } from "../ctx";

/** One button: installs the 38 MB engine, then downloads the 2.5 GB model. No account or token is needed. */
export default function DirectorSetup({ percent, onState }: { percent: number; onState: (s: "downloading" | "installed" | "error" | "available") => void }) {
  const { confirmSpend, toast, go, engines, saveEngines } = useApp();
  const [status, setStatus] = useState<LocalRuntimeStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const refresh = () => void api.directorLocalStatus().then(setStatus).catch(() => undefined);
  useEffect(refresh, []);
  const ready = !!status?.installed && !!status?.modelReady;

  const install = async () => {
    setError("");
    const ok = await confirmSpend({ title: "Install the local AI Director?", lines: [
      "Downloads a 38 MB engine (llama.cpp, MIT) and the 2.5 GB Qwen3 4B model (Apache-2.0). Every file is checked.",
      "The Director then runs on this computer: your script never leaves it, and there are no credits. It uses your graphics card when it is working and lets go after a few idle minutes.",
      "It only suggests. You review everything before anything changes.",
    ], download: true });
    if (!ok) return;
    setBusy(true); onState("downloading");
    try {
      const s = await api.directorLocalInstall(); setStatus(s);
      onState(s.installed && s.modelReady ? "installed" : "available");
      saveEngines({ ...engines, directorEngine: "local" });
      toast("The local AI Director is ready and selected. Use it on the Perform screen.");
    } catch (e) { onState("error"); setError((e as Error).message); toast((e as Error).message, true); }
    finally { setBusy(false); }
  };

  if (ready) return <div className="stack"><p className="muted small">Ready. It is selected as your Director in Engines. Use it on the Perform screen.</p><div className="row wrap"><button className="primary" onClick={() => go("perform")}>Open Perform</button></div></div>;
  return (
    <div className="stack">
      {status && <p className="muted small">{status.detail}</p>}
      <div className="row wrap">
        {busy ? <div className="download-progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percent}%` }} /><small>{percent}% file</small></div> :
          <button className="primary" onClick={() => void install()}>Install local Director</button>}
      </div>
      {error && <p role="alert" className="error small">{error}</p>}
    </div>
  );
}
