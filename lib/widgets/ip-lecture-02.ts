/*
 * Image Processing · Lecture 2 (point processing): the page's worked examples as pure
 * functions. The walkthrough text, its `facts` (checked against the MDX by `expect`) and
 * the scenes all compute from here, so a drawing can't drift from the numbers on the page.
 */

export type Img = readonly (readonly number[])[];
export type Pt = readonly [number, number];

/** Rounding as done by hand and by MATLAB's round: halves go up (2.5 → 3). */
export const round = (v: number) => Math.floor(v + 0.5);
export const clip = (v: number, lo = 0, hi = 255) => Math.min(hi, Math.max(lo, v));
/** uint8 overflow as NumPy does it: modulo 256. */
export const wrap = (v: number) => ((v % 256) + 256) % 256;
/** A number as the page prints it: integers plain, otherwise 2 decimals without trailing zeros. */
export const fmt2 = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));
export const list = (xs: readonly number[]) => xs.map(fmt2).join(" ");

export const mapImg = (img: Img, f: (v: number) => number): number[][] => img.map((row) => row.map(f));
export const flat = (img: Img) => img.flat();

/* ---------- Arithmetic operations ---------- */

/** The 4 × 4 example image of "A worked example". */
export const X: Img = [
  [20, 60, 100, 140],
  [40, 90, 130, 180],
  [70, 120, 200, 230],
  [110, 160, 220, 250],
];

export const OPS = {
  plus: (v: number) => v + 128,
  minus: (v: number) => v - 128,
  double: (v: number) => 2 * v,
  half: (v: number) => v / 2,
  lift: (v: number) => v / 2 + 128,
} as const;
export type OpName = keyof typeof OPS;

/** y = f(x) on an 8-bit image: rounded, then clipped (MATLAB, imadd…) or wrapped (NumPy uint8). */
export function pointOp(img: Img, f: (v: number) => number, overflow: "clip" | "wrap" = "clip") {
  return mapImg(img, (v) => {
    const y = round(f(v));
    return overflow === "clip" ? clip(y) : wrap(y);
  });
}

/** Does f push this value outside 0–255 (so it has to be clipped)? */
export const overflows = (f: (v: number) => number, v: number) => {
  const y = round(f(v));
  return y < 0 || y > 255;
};
export const countOverflow = (img: Img, f: (v: number) => number) => flat(img).filter((v) => overflows(f, v)).length;

/** The pixels that adding 128 sends past 255, smallest first: they all end up at 255. */
export const CLIPPED_BY_PLUS = flat(X)
  .filter((v) => overflows(OPS.plus, v))
  .sort((a, b) => a - b);

/* ---------- Complements ---------- */

export const complement = (v: number, max = 255) => max - v;
/** Solarization: complement only the dark pixels (≤ 128) or only the light ones (≥ 128). */
export const solarize = (v: number, which: "dark" | "light", t = 128) => ((which === "dark" ? v <= t : v >= t) ? 255 - v : v);

/* ---------- Histograms ---------- */

/** hf[k] = number of pixels with grey level k (the slides' algorithm). */
export function histogram(values: readonly number[], L: number) {
  const hf = new Array<number>(L).fill(0);
  for (const v of values) hf[v] += 1;
  return hf;
}
export const cumsum = (xs: readonly number[]) => xs.reduce<number[]>((acc, v) => [...acc, (acc.length ? acc[acc.length - 1] : 0) + v], []);
export const sum = (xs: readonly number[]) => xs.reduce((s, v) => s + v, 0);

/** The histogram after mapping every level i to map[i]: bars move and may merge, never split. */
export function remapHist(hist: readonly number[], map: readonly number[], L: number) {
  const out = new Array<number>(L).fill(0);
  hist.forEach((n, i) => (out[map[i]] += n));
  return out;
}

/** The 4 × 4, 8-level image of "A small example from image to image" (also used for the histogram). */
export const F: Img = [
  [3, 3, 4, 2],
  [3, 4, 4, 5],
  [2, 3, 4, 3],
  [4, 2, 3, 5],
];
export const F_LEVELS = 8;
export const F_HIST = histogram(flat(F), F_LEVELS);

/* ---------- Contrast stretching and piecewise linear functions ---------- */

/** y on the polyline through `pts` (sorted by x); flat beyond the ends. */
export function piecewise(pts: readonly Pt[], x: number) {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [a1, b1] = pts[i];
    const [a2, b2] = pts[i + 1];
    if (x <= a2) return ((b2 - b1) / (a2 - a1)) * (x - a1) + b1;
  }
  return pts[pts.length - 1][1];
}
export const slopes = (pts: readonly Pt[]) => pts.slice(1).map(([a2, b2], i) => (b2 - pts[i][1]) / (a2 - pts[i][0]));

/** Linear stretch of [rmin, rmax] onto [smin, smax], clipped outside. */
export const linearStretch = (r: number, rmin: number, rmax: number, smin = 0, smax = 255) => clip(((r - rmin) / (rmax - rmin)) * (smax - smin) + smin, Math.min(smin, smax), Math.max(smin, smax));

/** The slides' 16-level, 360-pixel image (histogram stretching). */
export const STRETCH_LEVELS = 16;
export const STRETCH_HIST = [15, 0, 0, 0, 0, 70, 110, 45, 70, 35, 0, 0, 0, 0, 0, 15];
/** Its stretching function: 5–9 onto 2–14, with 0 and 15 left alone. */
export const STRETCH_POINTS: readonly Pt[] = [
  [0, 0],
  [5, 2],
  [9, 14],
  [15, 15],
];
export const STRETCH_MAP = STRETCH_HIST.map((_, i) => round(piecewise(STRETCH_POINTS, i)));
export const STRETCH_OUT = remapHist(STRETCH_HIST, STRETCH_MAP, STRETCH_LEVELS);
export const STRETCH_BAND = [5, 6, 7, 8, 9];

/** imadjust(x, [a b], [c d], gamma), all on a [0, 1] scale. */
export function imadjust(x: number, a = 0, b = 1, c = 0, d = 1, gamma = 1) {
  const t = clip((x - a) / (b - a), 0, 1);
  return t ** gamma * (d - c) + c;
}

/** The piecewise.m example: breakpoints (a_i, b_i) on 8-bit values. */
export const PW_STRETCH: readonly Pt[] = [
  [0, 0],
  [64, 20],
  [192, 235],
  [255, 255],
];
/** The opposite shape: a shallow middle that compresses the mid-tones. */
export const PW_COMPRESS: readonly Pt[] = [
  [0, 0],
  [64, 100],
  [192, 155],
  [255, 255],
];
export const pw8 = (pts: readonly Pt[], x: number) => round(piecewise(pts, x));

/* ---------- Gamma correction ---------- */

/** y = 255 (x / 255)^γ on 8-bit values, rounded. */
export const gamma8 = (x: number, g: number) => round(255 * (x / 255) ** g);
/** The columns of the page's gamma table. */
export const GAMMA_XS = [0, 32, 64, 128, 192, 255];

/* ---------- Histogram equalization ---------- */

/** j = round((L − 1)/n · Σ_{k ≤ i} n_k) for every level i, plus the new histogram. */
export function equalize(hist: readonly number[], L: number) {
  const n = sum(hist);
  const cum = cumsum(hist);
  const scaled = cum.map((c) => ((L - 1) * c) / n);
  const map = scaled.map(round);
  return { n, cum, scaled, map, out: remapHist(hist, map, L) };
}

/** The slides' example: 16 levels, 360 pixels. */
export const EQ_LEVELS = 16;
export const EQ_HIST = [15, 0, 0, 0, 0, 0, 0, 0, 0, 70, 110, 45, 80, 40, 0, 0];
export const EQ = equalize(EQ_HIST, EQ_LEVELS);
/** The occupied levels of the slides' example. */
export const EQ_USED = EQ_HIST.flatMap((n, i) => (n ? [i] : []));

/** The small example: f equalized with L = 8. */
export const EQ_SMALL = equalize(F_HIST, F_LEVELS);
export const G = mapImg(F, (v) => EQ_SMALL.map[v]);
/** The occupied levels of f (2–5). */
export const F_USED = F_HIST.flatMap((n, i) => (n ? [i] : []));
/** Linear stretching of f's occupied range 2–5 onto 0–7, for comparison. */
export const LINEAR_SMALL = F_HIST.map((_, r) => round(linearStretch(r, 2, 5, 0, 7)));
