import { useEffect, useRef, useState } from "react";

export type MenuItem = { sep: true } | { sep?: false; label: string; hint?: string; disabled?: boolean; run: () => void };
export interface MenuDef { id: string; label: string; items: MenuItem[] }

/** The next menu id when moving left or right, wrapping around. */
export function nextMenu(ids: string[], current: string, dir: 1 | -1): string {
  const i = ids.indexOf(current);
  return ids[(i + dir + ids.length) % ids.length]!;
}

/** The application menu bar. Only one menu is open at a time. It closes on an outside click, on Escape, and when an item is chosen.
 *  Left and Right move between menus; moving over another menu while one is open switches to it, like a desktop menu bar. */
export default function MenuBar({ menus }: { menus: MenuDef[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const ids = menus.map((m) => m.id);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(null); };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(null); (root.current?.querySelector(`[data-menu="${open}"]`) as HTMLElement | null)?.focus(); }
      if (e.key === "ArrowRight") { e.preventDefault(); setOpen(nextMenu(ids, open, 1)); }
      if (e.key === "ArrowLeft") { e.preventDefault(); setOpen(nextMenu(ids, open, -1)); }
    };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", key); };
  }, [open, ids.join("|")]);

  return (
    <div className="menubar" ref={root} role="menubar" aria-label="Application menu">
      {menus.map((m) => (
        <div className="menu" key={m.id}>
          <button type="button" className={open === m.id ? "menu-title on" : "menu-title"} data-menu={m.id} role="menuitem" aria-haspopup="menu" aria-expanded={open === m.id}
            onClick={() => setOpen(open === m.id ? null : m.id)} onMouseEnter={() => { if (open && open !== m.id) setOpen(m.id); }}>{m.label}</button>
          {open === m.id && (
            <div className="menu-popup" role="menu" aria-label={m.label}>
              {m.items.map((it, i) =>
                it.sep ? (
                  <div key={"sep" + i} className="menu-sep" role="separator" />
                ) : (
                  // mouse down must not take focus from a text box, or Cut, Copy and Paste would have nothing to act on
                  <button type="button" key={it.label} role="menuitem" disabled={it.disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => { setOpen(null); it.run(); }}>
                    {it.label}{it.hint && <span>{it.hint}</span>}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
