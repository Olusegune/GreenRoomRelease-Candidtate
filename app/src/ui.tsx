import { useEffect, useRef, useState, type ReactNode } from "react";
import { Alert, Check, Info, Pause, Play, Stop } from "./icons";
import { pausePlayback, playToggle, playUrl, resumePlayback, stopPlayback } from "./media";

export function Note({ kind = "info", children }: { kind?: "info" | "warn" | "err" | "ok"; children: ReactNode }) {
  const Icon = kind === "ok" ? Check : kind === "info" ? Info : Alert;
  return (
    <div className={kind === "info" ? "note" : `note ${kind}`} role={kind === "err" ? "alert" : undefined}>
      <Icon size={18} />
      <div>{children}</div>
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      {children && <p className="muted">{children}</p>}
      {action}
    </div>
  );
}

/** A play, pause and resume button for a sound that is fetched only when pressed. While paused, a small Stop ends it. */
export function PlayButton({ get, label = "Play", disabled, round }: { get: () => Promise<string>; label?: string; disabled?: boolean; round?: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused">("idle");
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true; // StrictMode runs the cleanup once before the real mount, which must not leave this false
    return () => void (alive.current = false);
  }, []);
  const click = async () => {
    const what = playToggle(state);
    if (what === "pause") {
      pausePlayback();
      return setState("paused");
    }
    if (what === "resume") {
      resumePlayback();
      return setState("playing");
    }
    if (what === "wait") return;
    setState("loading");
    try {
      const url = await get();
      if (!alive.current) return;
      setState("playing");
      await playUrl(url, () => alive.current && setState("idle"));
    } catch {
      if (alive.current) setState("idle");
    }
  };
  const action = state === "playing" ? `Pause ${label}` : state === "paused" ? `Resume ${label}` : label;
  const icon = state === "loading" ? null : state === "playing" ? <Pause size={14} /> : <Play size={14} />;
  const stop = state === "paused" && (
    <button className={round ? "play-stop" : "sm ghost"} onClick={() => stopPlayback()} aria-label={`Stop ${label}`} title="Stop">
      <Stop size={12} />
    </button>
  );
  if (round)
    return (
      <>
        <button className={state === "playing" ? "play-round on" : "play-round"} onClick={click} disabled={disabled || state === "loading"} aria-label={action} title={action}>
          {state === "loading" ? <span aria-hidden="true">…</span> : icon}
        </button>
        {stop}
      </>
    );
  return (
    <>
      <button className="sm" onClick={click} disabled={disabled || state === "loading"} aria-label={action}>
        {icon}
        {state === "loading" ? "…" : state === "playing" ? "Pause" : state === "paused" ? "Resume" : label}
      </button>
      {stop}
    </>
  );
}

export function useBusy() {
  const [busy, setBusy] = useState(false);
  const run = async <T,>(f: () => Promise<T>): Promise<T | undefined> => {
    setBusy(true);
    try {
      return await f();
    } finally {
      setBusy(false);
    }
  };
  return { busy, run };
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: [T, string][] }) {
  return (
    <div className="tabs" role="tablist">
      {items.map(([k, label]) => (
        <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}>
          {label}
        </button>
      ))}
    </div>
  );
}
