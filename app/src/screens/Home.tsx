import { useEffect, useState } from "react";
import { api, type ProjectInfo } from "../api";
import { Cover } from "../avatar";
import { useApp } from "../ctx";
import { Plus } from "../icons";
import { TEMPLATES } from "../templates";

export default function Home() {
  const { openProject, createProject, keys, go } = useApp();
  const [list, setList] = useState<ProjectInfo[] | null>(null);
  const [name, setName] = useState("");
  useEffect(() => void api.projectList().then(setList).catch(() => setList([])), []);
  const noKeys = !keys.elevenlabs && !keys.voicekiller && !keys.kie;

  return (
    <section>
      <div>
        <h1>Your projects</h1>
        <p className="lede">Write a scene, give each character a voice, direct how they sound, and export the finished audio.</p>
      </div>
      {noKeys && (
        <div className="note warn">
          <div>
            Set up a local voice, or connect a cloud engine in Settings.{" "}
            <button className="sm" onClick={() => go("voices")}>
              Explore voices
            </button>
          </div>
        </div>
      )}
      <form
        className="card row"
        onSubmit={(e) => {
          e.preventDefault();
          void createProject(name);
        }}
      >
        <input type="text" aria-label="New project name" placeholder="Name your project, for example Late Delivery" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
        <button className="primary" type="submit">
          <Plus size={16} /> New project
        </button>
      </form>
      <div className="templates" aria-label="Start from a template">
        <h2>Start from a template</h2>
        <div className="template-grid">
          {TEMPLATES.map((t) => (
            <button key={t.id} className="card template-card" onClick={() => void createProject(name.trim() || t.title, t.script)}>
              <Cover seed={"tpl-" + t.id} size={44} />
              <strong>{t.title}</strong>
              <span className="muted small">{t.tagline}</span>
            </button>
          ))}
        </div>
      </div>
      {list === null ? (
        <p className="muted">Loading…</p>
      ) : list.length === 0 ? (
        <div className="hero">
          <div className="hero-art" aria-hidden="true">
            {[5, 9, 14, 8, 17, 11, 6, 13, 9, 4].map((h, i) => (
              <i key={i} style={{ height: h * 4, animationDelay: `${i * 90}ms` }} />
            ))}
          </div>
          <h2>Start your first scene</h2>
          <p className="muted">Name a project above. Project files are saved on this computer in Documents\Greenroom Local.</p>
          <ol className="steps">
            <li>
              <b>Write</b> the lines
            </li>
            <li>
              <b>Cast</b> a voice for each character
            </li>
            <li>
              <b>Direct</b> how they sound
            </li>
            <li>
              <b>Export</b> for your editor
            </li>
          </ol>
        </div>
      ) : (
        <div className="grid">
          {list.map((p) => (
            <button key={p.id} className="card project-card" onClick={() => void openProject(p.id)}>
              <Cover seed={p.id + p.name} size={56} />
              <span className="pc-text">
                <h2>{p.name}</h2>
                <span className="muted small">{p.updatedAt ? "Edited " + new Date(p.updatedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : ""}</span>
              </span>
              <span className="project-open">Continue →</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
