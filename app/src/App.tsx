import { useEffect, useRef, useState } from "react";
import { api, inApp } from "./api";
import { engineChip } from "./engineStatus";
import { Provider, useApp, type Tab } from "./ctx";
import { Book, Cast as CastIcon, Chip, ChevronLeft, ChevronRight, Clock, Cube, Direct, Export as ExportIcon, Eye, Gear, Home as HomeIcon, Shield, Mark, Script, Sparkle, Speaker, Timeline as TimelineIcon, Voices as VoicesIcon } from "./icons";
import Cast from "./screens/Cast";
import Engines from "./screens/Engines";
import Export from "./screens/Export";
import Home from "./screens/Home";
import Studio from "./screens/Studio";
import Lab from "./screens/Lab";
import Perform from "./screens/Perform";
import PictureScreen from "./screens/Picture";
import Timeline from "./screens/Timeline";
import History from "./screens/History";
import { checkForUpdates, useUpdates } from "./updates";
import Settings from "./screens/Settings";
import Voices from "./screens/Voices";
import Models from "./screens/Models";
import Help from "./screens/Help";
import SfxStudio from "./screens/SfxStudio";
import Write from "./screens/Write";

export default function App() {
  const [splash, setSplash] = useState<"show" | "fade" | "gone">("show");
  useEffect(() => {
    const a = setTimeout(() => setSplash("fade"), 1400);
    const b = setTimeout(() => setSplash("gone"), 1900);
    return () => (clearTimeout(a), clearTimeout(b));
  }, []);
  return (
    <Provider>
      {splash !== "gone" && (
        <div className={splash === "fade" ? "splash out" : "splash"} onClick={() => setSplash("gone")} role="presentation">
          <img src="/splash.webp" alt="Greenroom. Sound without limits." />
        </div>
      )}
      <Shell />
    </Provider>
  );
}

function Shell() {
  const { tab, go, project, closeProject, saving, undo, redo, canUndo, canRedo, engines } = useApp();
  const upd = useUpdates();
  // Look once shortly after start (not at the instant of launch, so saved settings are loaded first). Quiet on failure.
  const updateCheck = useRef(engines.updateCheck);
  updateCheck.current = engines.updateCheck;
  useEffect(() => {
    if (!inApp()) return;
    const t = setTimeout(() => updateCheck.current !== false && void checkForUpdates(true), 4000);
    return () => clearTimeout(t);
  }, []);
  const Item = ({ id, label, icon, count, off }: { id: Tab; label: string; icon: React.ReactNode; count?: string; off?: boolean }) => (
    <button className={tab === id ? "nav on" : "nav"} onClick={() => go(id)} disabled={off} aria-current={tab === id ? "page" : undefined}>
      {icon}
      <span className="label">{label}</span>
      {count && <span className="count">{count}</span>}
    </button>
  );
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem("greenroom-rail") === "collapsed"; } catch { return false; } });
  const toggleRail = () => setCollapsed((c) => { const next = !c; try { localStorage.setItem("greenroom-rail", next ? "collapsed" : "open"); } catch { /* not saved */ } return next; });
  const takes = project ? project.lines.filter((l) => l.takes.length > 0).length : 0;
  const screens: Record<Tab, React.ReactNode> = { home: <Home />, write: <Write />, cast: <Cast />, perform: <Perform />, timeline: <Timeline />, picture: <PictureScreen />, export: <Export />, studio: <Studio />, history: <History />, voices: <Voices />, models: <Models />, engines: <Engines />, sfx: <SfxStudio />, lab: <Lab />, settings: <Settings />, help: <Help /> };

  return (
    <div className={collapsed ? "shell rail-collapsed" : "shell"}>
      <nav className="rail" aria-label="Main">
        <div className="brand">
          <Mark size={34} />
          <span className="brand-name">Greenroom <em>Local</em></span>
          <button className="rail-toggle" onClick={toggleRail} aria-label={collapsed ? "Expand the sidebar" : "Collapse the sidebar"} aria-expanded={!collapsed} title={collapsed ? "Expand the sidebar" : "Collapse the sidebar"}>{collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}</button>
        </div>
        <Item id="home" label="Projects" icon={<HomeIcon size={18} />} />
        {project && (
          <>
            <h3>{project.name.slice(0, 22)}</h3>
            <Item id="write" label="Script" icon={<Script size={18} />} count={project.lines.length ? String(project.lines.length) : undefined} />
            <Item id="cast" label="Cast" icon={<CastIcon size={18} />} />
            <Item id="perform" label="Perform" icon={<Direct size={18} />} count={project.lines.length ? `${takes}/${project.lines.length}` : undefined} />
            <Item id="timeline" label="Timeline" icon={<TimelineIcon size={18} />} />
            <Item id="picture" label="Picture" icon={<Eye size={18} />} count={project.picture ? "on" : undefined} />
            <Item id="export" label="Export" icon={<ExportIcon size={18} />} />
            <Item id="studio" label="Studio" icon={<Shield size={18} />} />
            <Item id="history" label="History" icon={<Clock size={18} />} />
          </>
        )}
        <h3>Studio tools</h3>
        {!project && <>
          <Item id="cast" label="Cast" icon={<CastIcon size={18} />} />
          <Item id="perform" label="Perform" icon={<Direct size={18} />} />
          <Item id="timeline" label="Timeline" icon={<TimelineIcon size={18} />} />
        </>}
        <Item id="voices" label="Voices" icon={<VoicesIcon size={18} />} />
        <Item id="models" label="Model Center" icon={<Cube size={18} />} />
        <Item id="engines" label="Engines" icon={<Chip size={18} />} />
        <Item id="sfx" label="SFX Studio" icon={<Sparkle size={18} />} />
        <Item id="lab" label="Voice lab" icon={<Speaker size={18} />} />
        <div className="rail-divider" role="separator" />
        <Item id="settings" label="Settings" icon={<Gear size={18} />} count={upd.phase === "available" ? "update" : undefined} />
        <Item id="help" label="Help & guide" icon={<Book size={18} />} />
        <div className="rail-foot">
          {project && (
            <>
              <div className="row undo-bar">
                <button className="sm" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
                  Undo
                </button>
                <button className="sm" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
                  Redo
                </button>
              </div>
              <div aria-live="polite">{saving === "saving" ? "Saving…" : saving === "saved" ? "Saved" : saving === "error" ? "Not saved" : ""}</div>
              <button className="sm ghost" onClick={closeProject}>
                Close project
              </button>
            </>
          )}
        </div>
      </nav>
      <div className="workspace"><div className="app-menu" aria-label="Application menu">
        <details><summary>File</summary><div className="menu-popup"><button onClick={() => go("home")}>New or open project</button><button disabled={!project} onClick={closeProject}>Close project</button><button disabled={!project} onClick={() => go("export")}>Export…</button></div></details>
        <details><summary>Edit</summary><div className="menu-popup"><button disabled={!canUndo} onClick={undo}>Undo <span>Ctrl+Z</span></button><button disabled={!canRedo} onClick={redo}>Redo <span>Ctrl+Shift+Z</span></button></div></details>
        <details><summary>View</summary><div className="menu-popup"><button onClick={() => go("voices")}>Voice library</button><button onClick={() => go("models")}>Model Center</button><button onClick={() => go("settings")}>Settings</button></div></details>
        <details><summary>Help</summary><div className="menu-popup"><button onClick={() => go("help")}>Help & guide</button></div></details>
        <EngineChipButton />
        <AppearanceToggle />
      </div><main className="stage">{screens[tab]}</main></div>
    </div>
  );
}

function AppearanceToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem("greenroom-appearance") ?? "system");
  const apply = (next: string) => {
    setTheme(next);
    localStorage.setItem("greenroom-appearance", next);
    const resolved = next === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : next;
    document.documentElement.dataset.theme = resolved;
  };
  useEffect(() => apply(theme), []); // Restore the person's choice before navigating any screen.
  return <div className="appearance-toggle" role="group" aria-label="Appearance"><button className={theme === "light" ? "on" : ""} onClick={() => apply("light")}>Light</button><button className={theme === "dark" ? "on" : ""} onClick={() => apply("dark")}>Dark</button><button className={theme === "system" ? "on" : ""} onClick={() => apply("system")}>Auto</button></div>;
}

function EngineChipButton() {
  const { keys, library, go } = useApp();
  const [localReady, setLocalReady] = useState(false);
  useEffect(() => {
    void Promise.all([api.piperStatus().then((s) => s.installed).catch(() => false), api.chatterboxReady().catch(() => false), api.wazobiaVoices().then((v) => v.length > 0).catch(() => false)]).then((r) => setLocalReady(r.some(Boolean)));
  }, [library.length]);
  const chip = engineChip(keys, library, localReady);
  return <button className={"engine-chip " + chip.level} title={chip.detail} onClick={() => go("models")}><i aria-hidden="true" />{chip.label}</button>;
}
