import type { LocalRuntimeStatus } from "./api";

export const ACE_DOWNLOAD_GB = 8.3;
export const ACE_ENGINE_GB = 3;
export const MIN_SECONDS = 10;
export const MAX_SECONDS = 90;

/** Mirrors the limits the backend enforces, so a bad request never leaves the screen. */
export function checkLocalMusic(style: string, lyrics: string, seconds: number): string | null {
  if (!style.trim()) return "Describe the music first.";
  if (style.length > 1000) return "The description can be up to 1000 characters.";
  if (lyrics.length > 2000) return "Lyrics can be up to 2000 characters.";
  if (!Number.isInteger(seconds) || seconds < MIN_SECONDS || seconds > MAX_SECONDS) return `Choose a length between ${MIN_SECONDS} and ${MAX_SECONDS} seconds.`;
  return null;
}

export type MusicStep = "gpu" | "install" | "ready";

/** What the Model Center card should do next. A missing NVIDIA card is a hard stop, not a step. */
export function musicStep(status: LocalRuntimeStatus | null): MusicStep {
  if (!status) return "install";
  if (status.installed && status.modelReady) return "ready";
  if (!status.installed && !status.modelReady && /NVIDIA/i.test(status.detail) && /None was found/i.test(status.detail)) return "gpu";
  return "install";
}

export function localMusicSource(style: string, date: string): string {
  return `Made on this computer with ACE-Step v1 (Apache-2.0) on ${date}. Style prompt: ${style.trim().slice(0, 200)}. No audio left the computer. Review the model card before commercial use.`;
}
