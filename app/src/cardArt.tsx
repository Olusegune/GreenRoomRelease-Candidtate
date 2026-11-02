/** Generated card artwork: a layered gradient, soft glows, fine rings and a waveform, different for every seed but always the same for
 *  the same seed. Each kind of thing has its own colour family, so a glance says what a card is. Pictures added by the owner replace it. */
export type ArtKind = "speech" | "music" | "sfx" | "director" | "story" | "content" | "voice";

/** Two hues per kind (degrees): the gradient runs from the first to the second, with a small per-seed shift. */
export const ART_HUES: Record<ArtKind, [number, number]> = {
  speech: [172, 268], music: [318, 32], sfx: [205, 160], director: [42, 8], story: [262, 330], content: [190, 225], voice: [150, 200],
};

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let a = seed;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export interface ArtSpec {
  id: string; h1: number; h2: number;
  blobs: { x: number; y: number; r: number; h: number; a: number }[];
  rings: { cx: number; cy: number; r: number }[];
  bars: { x: number; h: number; o: number }[];
  /** 0 = bold bars, 1 = fine lines, 2 = flowing curves. Chosen by the seed so neighbouring cards differ. */
  variant: 0 | 1 | 2;
  curves: string[];
}

export function artSpec(seed: string, kind: ArtKind): ArtSpec {
  const hv = hash(seed + "|" + kind);
  const rand = rng(hv);
  const [b1, b2] = ART_HUES[kind];
  const shift = Math.round(rand() * 30 - 15);
  const h1 = (b1 + shift + 360) % 360;
  const h2 = (b2 + shift + 360) % 360;
  const blobs = [0, 1, 2].map((i) => ({ x: r1(60 + rand() * 280), y: r1(30 + rand() * 165), r: r1(70 + rand() * 70), h: (i === 1 ? h2 : h1 + i * 14) % 360, a: r1(0.38 + rand() * 0.25) }));
  const cx = r1(120 + rand() * 160), cy = r1(70 + rand() * 90);
  const rings = [46, 78, 112].map((r) => ({ cx, cy, r }));
  const variant = (hv % 3) as 0 | 1 | 2;
  const n = variant === 1 ? 72 : 40, phase = rand() * Math.PI * 2, freq = 0.18 + rand() * 0.22, calm = 0.35 + rand() * 0.4;
  const bars = Array.from({ length: n }, (_, i) => {
    const env = Math.sin((i / (n - 1)) * Math.PI);
    const wave = Math.abs(Math.sin(i * freq + phase)) * 0.65 + rand() * calm * 0.35;
    return { x: r1(30 + i * ((400 - 60) / (n - 1))), h: r1(6 + env * wave * 70), o: r1(0.25 + env * 0.65) };
  });
  const curves = [0, 1, 2].map((c) => {
    const amp = 22 + rand() * 30, f = 0.018 + rand() * 0.02, ph = rand() * 6.28 + c * 1.3;
    let d = "";
    for (let x = 0; x <= 400; x += 8) { const env = Math.sin((x / 400) * Math.PI); d += `${x === 0 ? "M" : "L"}${x} ${r1(118 + Math.sin(x * f + ph) * amp * env)} `; }
    return d.trim();
  });
  return { id: "art" + hv.toString(36), h1, h2, blobs, rings, bars, variant, curves };
}

export function CardArt({ seed, kind, label, className = "" }: { seed: string; kind: ArtKind; label?: string; className?: string }) {
  const s = artSpec(seed, kind);
  return (
    <svg className={`card-art ${className}`} viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${s.id}-bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={`hsl(${s.h1} 52% 17%)`} /><stop offset="1" stopColor={`hsl(${s.h2} 58% 9%)`} /></linearGradient>
        <linearGradient id={`${s.id}-bar`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={`hsl(${s.h1} 95% 82%)`} /><stop offset="1" stopColor={`hsl(${s.h2} 90% 66%)`} /></linearGradient>
        <filter id={`${s.id}-blur`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="26" /></filter>
        <filter id={`${s.id}-grain`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.07 0" /></filter>
      </defs>
      <rect width="400" height="225" fill={`url(#${s.id}-bg)`} />
      <g filter={`url(#${s.id}-blur)`}>{s.blobs.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={`hsl(${b.h} 85% 58%)`} opacity={b.a} />)}</g>
      <g fill="none" stroke={`hsl(${s.h1} 80% 78%)`} strokeWidth="1" opacity="0.16">{s.rings.map((r, i) => <circle key={i} cx={r.cx} cy={r.cy} r={r.r} />)}</g>
      {s.variant === 2 ? (
        <g fill="none" strokeLinecap="round">{s.curves.map((d, i) => <path key={i} d={d} stroke={`hsl(${i === 1 ? s.h2 : s.h1} 90% ${78 - i * 6}%)`} strokeWidth={2.4 - i * 0.5} opacity={0.95 - i * 0.28} />)}</g>
      ) : (
        <g fill={`url(#${s.id}-bar)`}>{s.bars.map((b, i) => <rect key={i} x={b.x - (s.variant === 1 ? 1 : 2)} y={r1(118 - b.h / 2)} width={s.variant === 1 ? 2 : 4} height={b.h} rx="1.5" opacity={b.o} />)}</g>
      )}
      <rect width="400" height="225" filter={`url(#${s.id}-grain)`} />
      {label && <text x="40" y="200" fill="#fff" opacity="0.82" fontSize="10" fontWeight="600" letterSpacing="2.2" fontFamily="inherit">{label.toUpperCase()}</text>}
    </svg>
  );
}
