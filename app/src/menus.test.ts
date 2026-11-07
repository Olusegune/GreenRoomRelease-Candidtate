import { describe, expect, it } from "vitest";
import { buildMenus, shortcutFor, type MenuActions } from "./menus";

const noop = () => {};
const base: MenuActions = { hasProject: true, canUndo: true, canRedo: false, version: "0.5.0", go: noop, save: noop, backup: noop, close: noop, exit: noop, undo: noop, redo: noop, edit: noop, checkUpdates: noop, about: noop };
const labels = (m: ReturnType<typeof buildMenus>, id: string) => m.find((x) => x.id === id)!.items.map((i) => (i.sep ? "-" : i.label));
const item = (m: ReturnType<typeof buildMenus>, id: string, label: string) => m.find((x) => x.id === id)!.items.find((i) => !i.sep && i.label === label) as Exclude<ReturnType<typeof buildMenus>[number]["items"][number], { sep: true }>;

describe("application menus", () => {
  it("offer the standard File, Edit, View and Help menus in order", () => {
    const m = buildMenus(base);
    expect(m.map((x) => x.id)).toEqual(["file", "edit", "view", "help"]);
    expect(labels(m, "file")).toEqual(["New project…", "Open project…", "Open a backup…", "-", "Save", "Save a backup copy", "Export audio…", "-", "Close project", "Exit"]);
    expect(labels(m, "edit")).toEqual(["Undo", "Redo", "-", "Cut", "Copy", "Paste", "Select all"]);
    expect(labels(m, "help")).toContain("About Greenroom Local 0.5.0");
  });
  it("grey out what needs an open project, and only that", () => {
    const none = buildMenus({ ...base, hasProject: false });
    for (const l of ["Open a backup…", "Save", "Save a backup copy", "Export audio…", "Close project"]) expect(item(none, "file", l).disabled).toBe(true);
    for (const l of ["New project…", "Open project…", "Exit"]) expect(item(none, "file", l).disabled).toBeFalsy();
    expect(item(none, "view", "Perform").disabled).toBe(true);
    expect(item(none, "view", "Settings").disabled).toBeFalsy();
    expect(item(buildMenus(base), "file", "Save").disabled).toBe(false);
  });
  it("grey out Undo and Redo when there is nothing to undo or redo", () => {
    const m = buildMenus(base);
    expect(item(m, "edit", "Undo").disabled).toBe(false);
    expect(item(m, "edit", "Redo").disabled).toBe(true);
  });
  it("run the action each item names", () => {
    const calls: string[] = [];
    const m = buildMenus({ ...base, save: () => calls.push("save"), exit: () => calls.push("exit"), edit: (w) => calls.push(w), go: (t) => calls.push("go:" + t) });
    item(m, "file", "Save").run();
    item(m, "file", "Exit").run();
    item(m, "edit", "Paste").run();
    item(m, "file", "Open project…").run();
    expect(calls).toEqual(["save", "exit", "paste", "go:home"]);
  });
});

describe("keyboard shortcuts", () => {
  const key = (k: string, o: Partial<{ ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean }> = {}) => shortcutFor({ key: k, ctrlKey: true, metaKey: false, shiftKey: false, altKey: false, ...o });
  it("map Ctrl+N, O, S, Shift+S, W and Q", () => {
    expect([key("n"), key("o"), key("s"), key("S", { shiftKey: true }), key("w"), key("q")]).toEqual(["new", "open", "save", "backup", "close", "exit"]);
  });
  it("never catch ordinary typing, Alt combinations or unrelated Ctrl keys", () => {
    expect(key("s", { ctrlKey: false })).toBeNull();
    expect(key("s", { altKey: true })).toBeNull();
    expect(key("z")).toBeNull();
    expect(key("c")).toBeNull();
  });
});
