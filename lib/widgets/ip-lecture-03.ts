/**
 * The worked numbers of image-processing lecture 3 (spatial filtering) that the convolution
 * module doesn't already cover: order statistics (median, max/min, alpha-trimmed mean),
 * separable passes, Laplacian sharpening, unsharp masking and high-boost filtering, clipping
 * and scaling, and the 1-D profiles the walkthroughs plot. Built on convolution.ts; pure and
 * client-safe, and the walkthrough facts computed here are checked by the page's `expect`.
 */

import { filterImage, KERNEL_PRESETS, type FilterMode, type Kernel, type Padding } from "./convolution";

export type Matrix = number[][];

const round3 = (x: number) => Math.round(x * 1000) / 1000;
const round2 = (x: number) => Math.round(x * 100) / 100;

/** A number list as the page prints it in `expect`: "20 40 60". */
export const listOf = (xs: readonly number[]) => xs.map((x) => String(round3(x))).join(" ");

export const kernel = (weights: Matrix, divisor = 1): Kernel => ({ weights, divisor });
export const negate = (m: Matrix): Matrix => m.map((row) => row.map((v) => (v === 0 ? 0 : -v)));
export const outer = (col: readonly number[], row: readonly number[]): Matrix => col.map((a) => row.map((b) => a * b));
export const sumOf = (m: Matrix) => m.flat().reduce((s, v) => s + v, 0);
export const rotate180 = (m: Matrix): Matrix => m.map((row) => [...row].reverse()).reverse();

/* ---------- The worked example (slide 5) ---------- */

export const WORKED_IMAGE: Matrix = [
  [3, 3, 2, 1, 0],
  [0, 0, 1, 3, 1],
  [3, 1, 2, 2, 3],
  [2, 0, 0, 2, 2],
  [2, 0, 0, 0, 1],
];
export const WORKED_MASK: Matrix = [
  [0, 1, 2],
  [2, 2, 0],
  [0, 1, 2],
];
export const worked = (mode: FilterMode = "correlation", padding: Padding = "none") => filterImage(WORKED_IMAGE, kernel(WORKED_MASK), mode, padding);

/** A k×k image of zeros with a single `value` at its centre. */
export const impulseImage = (k: number, value = 1): Matrix => Array.from({ length: k }, (_, r) => Array.from({ length: k }, (_, c) => (r === (k - 1) / 2 && c === (k - 1) / 2 ? value : 0)));

/* ---------- The 20 | 80 edge used all through the page ---------- */

export const EDGE_ROW = [20, 20, 20, 80, 80] as const;
/** Five identical rows: a vertical edge between grey levels 20 and 80. */
export const EDGE_IMAGE: Matrix = Array.from({ length: 5 }, () => [...EDGE_ROW]);
/** The middle row of a filtered edge image. */
const middleRow = (m: Matrix) => m[Math.floor(m.length / 2)];

export const MEAN3 = KERNEL_PRESETS.mean;
export const H1: Matrix = KERNEL_PRESETS.laplacian.weights;
export const H2: Matrix = negate(H1);
export const H3: Matrix = [
  [1, 1, 1],
  [1, -8, 1],
  [1, 1, 1],
];
/** The one-mask sharpener δ − h1 (= δ + h2). */
export const SHARPEN: Matrix = [
  [0, -1, 0],
  [-1, 5, -1],
  [0, -1, 0],
];
/** High-boost with the Laplacian: A·δ + h2, i.e. A + 4 at the centre. */
export const highBoostMask = (A: number): Matrix => H2.map((row, r) => row.map((v, c) => (r === 1 && c === 1 ? round3(v + A) : v)));

/** Mean of the edge image without padding: the interior pixels 20, 40, 60. */
export const edgeMean = () => middleRow(filterImage(EDGE_IMAGE, MEAN3, "correlation", "none").output);
/** The edge's interior pixels (those the 3×3 mask fits on). */
export const edgeInterior = () => EDGE_ROW.slice(1, -1);

/** The Laplacian (h1) of the edge row, borders replicated: 0 0 60 −60 0. */
export const edgeLaplacian = () => middleRow(filterImage(EDGE_IMAGE, kernel(H1), "correlation", "replicate").output);

export const clip = (x: number, lo = 0, hi = 255) => Math.min(Math.max(x, lo), hi);
/** Map [min, max] of the values onto [0, 255] (scaling for display), rounded to whole grey levels. */
export const scaleTo255 = (xs: readonly number[]) => {
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  return xs.map((x) => (hi === lo ? 0 : Math.round((255 * (x - lo)) / (hi - lo))));
};

/** f − ∇²f with h1 (before clipping): 20 20 −40 140 80. */
export const edgeSharpenedRaw = () => {
  const lap = edgeLaplacian();
  return EDGE_ROW.map((f, i) => f - lap[i]);
};
/** The same row filtered once with SHARPEN (must agree with f − ∇²f). */
export const edgeSharpenedOneMask = () => middleRow(filterImage(EDGE_IMAGE, kernel(SHARPEN), "correlation", "replicate").output);
/** High-boost A·f − ∇²f on the edge row (replicated borders), raw. */
export const edgeHighBoost = (A: number) => middleRow(filterImage(EDGE_IMAGE, kernel(highBoostMask(A)), "correlation", "replicate").output);

/** Unsharp masking on the edge interior: f̄, the difference f − f̄, and A·f − f̄. */
export const edgeUnsharp = (A: number) => {
  const f = edgeInterior();
  const blurred = edgeMean();
  return { f, blurred, difference: f.map((v, i) => round3(v - blurred[i])), boosted: f.map((v, i) => round3(A * v - blurred[i])) };
};

/** Salt (255) on a flat 30 background: the mean smears each impulse into a 3×3 blotch of 55. */
export const SALT_IMAGE: Matrix = Array.from({ length: 7 }, (_, r) => Array.from({ length: 7 }, (_, c) => ((r === 2 && c === 2) || (r === 4 && c === 5) ? 255 : 30)));
export const saltMean = () => filterImage(SALT_IMAGE, MEAN3, "correlation", "replicate").output;

/** A flat 6×6 image of 90s under the 3×3 mean, zero-padded or replicated. */
export const FLAT_IMAGE: Matrix = Array.from({ length: 6 }, () => Array(6).fill(90));
export const flatMean = (padding: "zero" | "replicate") => filterImage(FLAT_IMAGE, MEAN3, "correlation", padding);

/* ---------- Order statistics (slide 36 and the practice window) ---------- */

export const sorted = (xs: readonly number[]) => [...xs].sort((a, b) => a - b);
export const mean = (xs: readonly number[]) => xs.reduce((s, v) => s + v, 0) / xs.length;
/** The value at 1-based `rank` in the sorted list (a rank-order filter): 1 = min, n = max. */
export const rankOrder = (xs: readonly number[], rank: number) => sorted(xs)[rank - 1];
export const median = (xs: readonly number[]) => {
  const s = sorted(xs);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
/** Sort, drop `trim` values at each end, average the rest. */
export const alphaTrimmed = (xs: readonly number[], trim: number) => mean(sorted(xs).slice(trim, xs.length - trim));

/** The neighbourhood on slide 36: an outlier, 70, at the centre. */
export const SLIDE36: Matrix = [
  [5, 7, 10],
  [12, 70, 8],
  [1, 4, 15],
];
export const slide36 = () => {
  const xs = SLIDE36.flat();
  return {
    sorted: sorted(xs),
    mean: round2(mean(xs)),
    median: median(xs),
    max: rankOrder(xs, xs.length),
    min: rankOrder(xs, 1),
    trimmed: round2(alphaTrimmed(xs, 2)),
  };
};

/**
 * An order-statistic filter over k×k windows: `pick` maps the window's values to the output.
 * The windows come from filterImage's padded grid, so the border methods are the same.
 */
export function orderFilter(image: Matrix, k: number, pick: (values: number[]) => number, padding: Padding = "replicate"): Matrix {
  const zero = kernel(Array.from({ length: k }, () => Array(k).fill(0)));
  const { padded } = filterImage(image, zero, "correlation", padding);
  const rows = padded.length - k + 1;
  const cols = padded[0].length - k + 1;
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const values: number[] = [];
      for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) values.push(padded[r + i][c + j].value);
      return pick(values);
    }),
  );
}

/** A 7×7 picture with an edge (40 | 200) and salt (255) and pepper (0) pixels. */
export const NOISY_EDGE: Matrix = [
  [40, 40, 40, 200, 200, 200, 200],
  [40, 255, 40, 200, 200, 0, 200],
  [40, 40, 40, 200, 200, 200, 200],
  [40, 40, 0, 200, 200, 200, 200],
  [40, 40, 40, 200, 255, 200, 200],
  [255, 40, 40, 200, 200, 200, 200],
  [40, 40, 40, 200, 200, 200, 0],
];
/** Mean (rounded to grey levels, as uint8 output is) or median of NOISY_EDGE, borders replicated. */
export const denoise = (how: "mean" | "median") =>
  how === "median" ? orderFilter(NOISY_EDGE, 3, median) : filterImage(NOISY_EDGE, MEAN3, "correlation", "replicate").output.map((row) => row.map(Math.round));

/* ---------- Separable filters ---------- */

/** Work per pixel for an N×N mask, applied directly or as two 1-D passes. */
export const separableCost = (N: number) => ({ direct: N * N, directAdds: N * N - 1, separable: 2 * N, separableAdds: 2 * N - 2 });

/** A 1-D mask along the rows ("row") or down the columns ("col"), only where it fits (no padding). */
export function pass1d(image: Matrix, weights: readonly number[], divisor: number, along: "row" | "col"): Matrix {
  const k = weights.length;
  const t = along === "col" ? transpose(image) : image;
  const out = t.map((row) => Array.from({ length: row.length - k + 1 }, (_, c) => round3(weights.reduce((s, w, j) => s + w * row[c + j], 0) / divisor)));
  return along === "col" ? transpose(out) : out;
}
const transpose = (m: Matrix): Matrix => m[0].map((_, c) => m.map((row) => row[c]));

/** Multiples of 9, so both 1/3 passes stay whole numbers. */
export const SEPARABLE_IMAGE: Matrix = [
  [0, 0, 0, 90, 90],
  [0, 0, 90, 90, 90],
  [0, 90, 90, 90, 90],
  [90, 90, 90, 90, 90],
  [90, 90, 90, 90, 90],
];
export function separableDemo() {
  const rows = pass1d(SEPARABLE_IMAGE, [1, 1, 1], 3, "row");
  const both = pass1d(rows, [1, 1, 1], 3, "col");
  const direct = filterImage(SEPARABLE_IMAGE, MEAN3, "correlation", "none").output;
  if (JSON.stringify(both) !== JSON.stringify(direct)) throw new Error(`ip-lecture-03: row-then-column passes ${JSON.stringify(both)} differ from the 3×3 mean ${JSON.stringify(direct)}`);
  return { rows, both };
}

/* ---------- Directional masks ---------- */

export type Direction = "diagonal" | "horizontal" | "vertical";

export const DIRECTIONAL: Record<Direction, Matrix> = {
  diagonal: [
    [-1, -1, 0],
    [-1, 0, 1],
    [0, 1, 1],
  ],
  horizontal: [
    [-1, -1, -1],
    [0, 0, 0],
    [1, 1, 1],
  ],
  vertical: [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1],
  ],
};

/** 3×3 patches with an edge through the centre, dark (0) on the low side and bright (9) on the high side. */
export const EDGE_PATCHES: Record<Direction, Matrix> = {
  horizontal: [
    [0, 0, 0],
    [9, 9, 9],
    [9, 9, 9],
  ],
  vertical: [
    [0, 9, 9],
    [0, 9, 9],
    [0, 9, 9],
  ],
  diagonal: [
    [0, 0, 9],
    [0, 9, 9],
    [9, 9, 9],
  ],
};
/** The response of a directional mask at the centre of a patch (correlation). */
export const respond = (mask: Matrix, patch: Matrix) => mask.reduce((s, row, r) => s + row.reduce((t, w, c) => t + w * patch[r][c], 0), 0);

/* ---------- 1-D profiles for the plots ---------- */

/** Filter a 1-D signal with symmetric weights, borders replicated. */
export function smooth1d(signal: readonly number[], weights: readonly number[]): number[] {
  const r = (weights.length - 1) / 2;
  const total = weights.reduce((s, w) => s + w, 0) || 1;
  return signal.map((_, i) => weights.reduce((s, w, j) => s + w * signal[Math.min(Math.max(i + j - r, 0), signal.length - 1)], 0) / total);
}
/** Sampled Gaussian weights e^(−x²/2σ²) for x = −radius…radius (not normalized). */
export const gaussian1d = (sigma: number, radius: number) => Array.from({ length: 2 * radius + 1 }, (_, i) => Math.exp(-((i - radius) ** 2) / (2 * sigma * sigma)));

/**
 * One image row: a gentle ramp (low frequency), a step edge, and fine texture (high frequency).
 * Deterministic, so the plots never change.
 */
export const PROFILE: number[] = Array.from({ length: 60 }, (_, i) => {
  const ramp = i < 20 ? 40 + i * 1.5 : 70;
  const step = i >= 30 ? 110 : 0;
  const texture = i >= 40 ? (i % 2 ? 18 : -18) : 0;
  return ramp + step + texture;
});
