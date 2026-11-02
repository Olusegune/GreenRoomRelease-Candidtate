import { useEffect, useState } from "react";
import { api } from "./api";

/** True when the on-this-PC Director engine and model are installed. Re-checks when `again` changes. */
export function useLocalDirectorReady(again: unknown = 0): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => { void api.directorLocalStatus().then((s) => setReady(s.installed && s.modelReady)).catch(() => setReady(false)); }, [again]);
  return ready;
}
