export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

/** Frames → SMPTE-style timecode HH:MM:SS:FF at the given fps (non-drop). */
export function timecode(frames: number, fps = 24) {
  const f = Math.max(0, Math.round(frames));
  const ff = f % fps;
  const totalSeconds = Math.floor(f / fps);
  const ss = totalSeconds % 60;
  const mm = Math.floor(totalSeconds / 60) % 60;
  const hh = Math.floor(totalSeconds / 3600);
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

/** Scroll position → timecode. 4px of scroll = one frame. */
export const scrollTimecode = (y: number) => timecode(y / 4);

/** Deterministic PRNG (mulberry32) so generated visuals render identically on server and client. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const isPlaceholderValue = (v: string) => /\{\{.*\}\}/.test(v);
