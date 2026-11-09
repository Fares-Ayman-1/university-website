/*
 * Image Processing · Lecture 4 (the course book's Chapter 4, frequency domain filtering): the
 * maths its walkthroughs draw. Pure and client-safe, so the scenes and the page's `expect`
 * facts use the same numbers. The DFT itself is Lecture 5's (lib/widgets/ip-lecture-05.ts):
 * dft2 there carries the 1/MN in the forward transform, as this lecture's 2-D formulas do,
 * and dft(…, "matlab") is the book's 1-D formula, with the 1/N in the inverse.
 */

import { abs, cx, dft, dft2, fftshift2, fmtList, fmtNum, gridMax, idft, idft2, idftTerms, logMag, mapGrid, normalise, scale, type C, type Grid } from "./ip-lecture-05";

/* ---------- Filter profiles H(D) ---------- */

export type Family = "ideal" | "butterworth" | "gaussian";
export type Pass = "low" | "high";

/** Low-pass H at distance D from the centre: ideal step, Butterworth of order n, or Gaussian. */
export function lowPass(family: Family, D: number, D0: number, n = 2): number {
  if (family === "ideal") return D <= D0 ? 1 : 0;
  if (family === "butterworth") return 1 / (1 + (D / D0) ** (2 * n));
  return Math.exp(-(D * D) / (2 * D0 * D0));
}

/** High-pass H = 1 − low-pass H. For Butterworth this is 1 / (1 + (D0/D)^(2n)), and 0 at D = 0. */
export const highPass = (family: Family, D: number, D0: number, n = 2) => 1 - lowPass(family, D, D0, n);

export const filterAt = (family: Family, pass: Pass, D: number, D0: number, n = 2) => (pass === "low" ? lowPass(family, D, D0, n) : highPass(family, D, D0, n));

/** D(u, v) = √((u − M/2)² + (v − N/2)²): the distance from the centre of the shifted spectrum. */
export const distance = (u: number, v: number, M: number, N: number) => Math.hypot(u - M / 2, v - N / 2);

export const distanceGrid = (M: number, N: number): Grid<number> => Array.from({ length: M }, (_, u) => Array.from({ length: N }, (_, v) => distance(u, v, M, N)));

/** H(u, v) on a centred M × N spectrum. */
export const filterGrid = (family: Family, pass: Pass, M: number, N: number, D0: number, n = 2): Grid<number> =>
  mapGrid(distanceGrid(M, N), (D) => filterAt(family, pass, D, D0, n));

/** Two decimals, as the page prints H: 0.8, 0.37, 0.06. */
export const h2 = (x: number) => fmtNum(x, 2);

/* ---------- Worked example: H at a few points of an 8 × 8 spectrum ---------- */

export const EX = { M: 8, N: 8, D0: 2, n: 2 } as const;
/** The points (u, v) of the page's table, counted from 0; the centre is (4, 4). */
export const EX_POINTS = [
  [4, 4],
  [5, 5],
  [4, 6],
  [6, 6],
  [0, 4],
] as const;

export type ExRow = { u: number; v: number; D: number; ideal: number; butterworth: number; gaussian: number };

export const EX_ROWS: readonly ExRow[] = EX_POINTS.map(([u, v]) => {
  const D = distance(u, v, EX.M, EX.N);
  return { u, v, D, ideal: lowPass("ideal", D, EX.D0), butterworth: lowPass("butterworth", D, EX.D0, EX.n), gaussian: lowPass("gaussian", D, EX.D0) };
});

/** The row of a point in the worked example. */
export const exRow = (u: number, v: number) => EX_ROWS.find((r) => r.u === u && r.v === v) as ExRow;

/** The whole 8 × 8 grid of one filter, for drawing. */
export const exGrid = (family: Family, pass: Pass = "low") => filterGrid(family, pass, EX.M, EX.N, EX.D0, EX.n);

/* ---------- §4.2: two 4-sample signals with the same average ---------- */

/** One slow cycle (smooth) and the fastest possible alternation, both with sum 8. */
export const SIGNALS = { smooth: [4, 2, 0, 2], alternating: [1, 3, 1, 3] } as const;
export type SignalId = keyof typeof SIGNALS;

/** The book's 1-D DFT: F[k] = Σ f[n] e^(−i2πkn/N), with no 1/N (MATLAB's fft). */
export const bookDft = (f: readonly number[]) => dft(f, "matlab");
/** Its inverse: f[n] = (1/N) Σ F[k] e^(i2πkn/N). */
export const bookIdft = (F: readonly C[]) => idft(F, "matlab");

export const SPECTRA = { smooth: bookDft(SIGNALS.smooth), alternating: bookDft(SIGNALS.alternating) } as const;

/** "[8, 4, 0, 4]" */
export const spectrumText = (id: SignalId) => fmtList(SPECTRA[id]);

/** The terms F[k] · e^(i2πkn/N) of the inverse at sample n, before the 1/N. */
export const inverseTerms = (F: readonly C[], n: number) => idftTerms(F, n);
/** The sample the page rebuilds by hand: f[1] of the smooth signal. */
export const INVERSE_N = 1;
export const inverseAt = (F: readonly C[], n: number) => bookIdft(F)[n].re;

/* ---------- §4.3: a 4 × 4 image of vertical stripes ---------- */

/** Every row is 2, 4, 2, 4: mean 3, plus the fastest pattern across the columns. */
export const STRIPES: Grid<number> = Array.from({ length: 4 }, () => [2, 4, 2, 4]);

/** f(x, y) · (−1)^(x+y): the centring trick. */
export const checker = (g: readonly (readonly number[])[]): Grid<number> => mapGrid(g, (v, x, y) => ((x + y) % 2 ? -v : v));

/** F(u, v) with the 1/MN in front (this lecture's 2-D formula). */
export const STRIPES_F = dft2(STRIPES);
/** The transform of the image multiplied by (−1)^(x+y): everything moved by (M/2, N/2). */
export const STRIPES_FC = dft2(checker(STRIPES));

/** A real number from a grid of complex values, printed as the page prints it. */
export const re = (g: readonly (readonly C[])[], u: number, v: number) => fmtNum(g[u][v].re);

/** A small image that is not symmetric, for |F(u, v)| = |F(−u, −v)|. */
export const ASYM: Grid<number> = [
  [9, 1, 0, 0, 0, 0, 0, 3],
  [2, 6, 1, 0, 0, 0, 0, 0],
  [0, 3, 8, 2, 0, 0, 0, 0],
  [0, 0, 1, 7, 4, 0, 0, 0],
  [0, 0, 0, 2, 9, 1, 0, 0],
  [0, 0, 0, 0, 3, 6, 2, 0],
  [0, 0, 0, 0, 0, 1, 8, 1],
  [1, 0, 0, 0, 0, 0, 2, 7],
];

/** |F| of ASYM, centred, rounded to 2 decimals (for printing pairs). */
export const ASYM_MAG = mapGrid(fftshift2(dft2(ASYM)), (v) => abs(v));

/** A block, wide (20 × 4 pixels) or tall (4 × 20), on a 32 × 32 image: the book's Figure 4.2, in pixels. */
export const BLOCKS = {
  wide: Array.from({ length: 32 }, (_, r) => Array.from({ length: 32 }, (_, c) => (r >= 14 && r < 18 && c >= 6 && c < 26 ? 255 : 0))),
  tall: Array.from({ length: 32 }, (_, r) => Array.from({ length: 32 }, (_, c) => (r >= 6 && r < 26 && c >= 14 && c < 18 ? 255 : 0))),
} as const satisfies Record<string, Grid<number>>;
export type BlockId = keyof typeof BLOCKS;

const spectra = new WeakMap<object, Grid<number>>();
/** The centred log-magnitude spectrum of an image, scaled to 0–255 for drawing (computed once per image). */
export function spectrumImage(img: readonly (readonly number[])[]): Grid<number> {
  let s = spectra.get(img);
  if (!s) {
    s = normalise(logMag(fftshift2(dft2(img))));
    spectra.set(img, s);
  }
  return s;
}

/** The uncentred log-magnitude spectrum (DC in the top-left corner), for comparison. */
export const rawSpectrumImage = (img: readonly (readonly number[])[]) => normalise(logMag(dft2(img)));

/* ---------- §4.4: operation counts ---------- */

export const COST_SIZE = 512;
/** Spatial filtering: m² multiplications per pixel for an m × m mask. */
export const spatialPerPixel = (m: number) => m * m;
/**
 * Frequency filtering of a spatial mask, per pixel: an FFT of the image, one of the zero-padded
 * mask and one inverse, about log₂(MN) each, plus the one product G = H · F.
 */
export const freqPerPixel = (M: number, N: number) => 3 * Math.log2(M * N) + 1;
/** The smallest odd mask size for which the frequency route is cheaper. */
export function breakEven(M: number, N: number): number {
  let m = 1;
  while (spatialPerPixel(m) <= freqPerPixel(M, N)) m += 2;
  return m;
}

/* ---------- The test image the filtering scenes use ---------- */

export const TEST_N = 32;
/** 32 × 32: a bright square (an edge to ring around) and a patch of one-pixel stripes (the finest detail). */
export const TEST_IMG: Grid<number> = Array.from({ length: TEST_N }, (_, r) =>
  Array.from({ length: TEST_N }, (_, c) => {
    if (r >= 5 && r < 17 && c >= 4 && c < 16) return 220;
    if (r >= 20 && r < 28 && c >= 18 && c < 28) return c % 2 ? 40 : 200;
    return 40;
  }),
);
/** The row the ringing cross-section is taken along (through the square only). */
export const RING_ROW = 10;
/** The cutoffs the scenes use on the 32 × 32 image. */
export const TEST_D0 = { small: 3, large: 9 } as const;

/** Undo fftshift2 (for an even size it is the same swap). */
export const ifftshift2 = <T>(g: readonly (readonly T[])[]): T[][] => fftshift2(g);

let testSpectrum: Grid<C> | undefined;
/** F(u, v) of the test image, centred (computed once). */
export function testF(): Grid<C> {
  testSpectrum ??= fftshift2(dft2(TEST_IMG));
  return testSpectrum;
}

export type Filtered = { H: Grid<number>; G: Grid<C>; g: Grid<number> };
const filteredCache = new Map<string, Filtered>();

/** Filter the test image: G = H · F on the centred spectrum, then undo the shift and invert. */
export function filterTest(family: Family, pass: Pass, D0: number, n = 2): Filtered {
  const key = `${family}/${pass}/${D0}/${n}`;
  const hit = filteredCache.get(key);
  if (hit) return hit;
  const H = filterGrid(family, pass, TEST_N, TEST_N, D0, n);
  const G = mapGrid(testF(), (v, r, c) => scale(v, H[r][c]));
  const g = idft2(ifftshift2(G)).map((row) => row.map((v) => v.re));
  const out = { H, G, g };
  filteredCache.set(key, out);
  return out;
}

/** The same product, inverted WITHOUT undoing the shift: the result comes back as g · (−1)^(x+y). */
export function invertWithoutUnshift(G: readonly (readonly C[])[]): Grid<number> {
  return idft2(G.map((row) => [...row])).map((row) => row.map((v) => v.re));
}

/** A centred mask applied to the UNcentred spectrum: it keeps the wrong frequencies. */
export function filterUncentred(family: Family, D0: number): Grid<number> {
  const H = filterGrid(family, "low", TEST_N, TEST_N, D0);
  const F = dft2(TEST_IMG);
  return idft2(mapGrid(F, (v, r, c) => scale(v, H[r][c]))).map((row) => row.map((v) => v.re));
}

/** For drawing: clip to 0–255, or stretch [min, max] to 0–255, or take |g| and stretch. */
export function toDisplay(g: readonly (readonly number[])[], mode: "clip" | "stretch" | "abs"): Grid<number> {
  if (mode === "clip") return mapGrid(g, (v) => Math.round(Math.min(255, Math.max(0, v))));
  const src = mode === "abs" ? mapGrid(g, Math.abs) : g.map((row) => [...row]);
  const lo = Math.min(...src.flat());
  const hi = gridMax(src);
  return mapGrid(src, (v) => Math.round(((v - lo) / (hi - lo || 1)) * 255));
}

/** The log spectrum of the test image with H applied, for drawing what a filter keeps. */
export const keptSpectrum = (H: readonly (readonly number[])[]) => {
  const spec = normalise(logMag(testF()));
  return mapGrid(spec, (v, r, c) => Math.round(v * H[r][c]));
};

/** The filtered image's values along RING_ROW, as [column, value] points for a Curve. */
export const crossSection = (g: readonly (readonly number[])[]) => g[RING_ROW].map((v, c) => [c, v] as const);

/** The test image's two grey levels along RING_ROW: background and square. */
export const LEVELS = { dark: 40, bright: 220 } as const;
/**
 * Ringing, in grey levels: how far the filtered row strays outside the original's range
 * [40, 220], above the square or below the background. A filter that only blurs gives 0.
 */
export function ripple(g: readonly (readonly number[])[]): number {
  const row = g[RING_ROW];
  return Math.max(0, Math.round(Math.max(Math.max(...row) - LEVELS.bright, LEVELS.dark - Math.min(...row))));
}
/** The cutoff of the ringing comparison. */
export const RING_D0 = 5;

/* ---------- §4.4: periodic noise, two spikes in the spectrum ---------- */

/** Vertical stripes of noise: amp · cos(2π · cycles · c / 32) added to every row. */
export const NOISE = { cycles: 6, amp: 40 } as const;
export const NOISY_IMG: Grid<number> = mapGrid(TEST_IMG, (v, _r, c) => v + NOISE.amp * Math.cos((2 * Math.PI * NOISE.cycles * c) / TEST_N));
/** Where the noise sits in the centred spectrum: (M/2, N/2 ± cycles). */
export const NOISE_SPIKES = [
  [TEST_N / 2, TEST_N / 2 - NOISE.cycles],
  [TEST_N / 2, TEST_N / 2 + NOISE.cycles],
] as const;

let noisyCache: { F: Grid<C>; clean: Grid<number> } | undefined;
/** The noisy image's centred spectrum, and the image rebuilt with the two spikes set to 0. */
export function denoise() {
  if (!noisyCache) {
    const F = fftshift2(dft2(NOISY_IMG));
    const G = mapGrid(F, (v, r, c) => (NOISE_SPIKES.some(([sr, sc]) => sr === r && sc === c) ? cx(0) : v));
    noisyCache = { F, clean: idft2(ifftshift2(G)).map((row) => row.map((v) => v.re)) };
  }
  return noisyCache;
}

/* ---------- §4.1: a signal with a strong slow wave and weaker fast ones ---------- */

export const INTRO_PARTS = [
  { u: 1, amp: 1 },
  { u: 3, amp: 0.5 },
  { u: 7, amp: 0.25 },
] as const;
export const introSignal = (x: number) => INTRO_PARTS.reduce((s, p) => s + p.amp * Math.sin(p.u * x), 0);
export const introPart = (i: number) => (x: number) => INTRO_PARTS[i].amp * Math.sin(INTRO_PARTS[i].u * x);

/** Two rows of pixels: a gentle ramp and a sudden edge. Frequency = how fast the values change. */
export const ROWS = {
  smooth: [60, 75, 90, 105, 120, 135, 150, 165],
  edge: [60, 60, 60, 60, 200, 200, 200, 200],
  noise: [120, 60, 150, 90, 200, 70, 160, 100],
} as const;
export type RowId = keyof typeof ROWS;
/** The largest jump between neighbours in a row. */
export const maxJump = (row: readonly number[]) => Math.max(...row.slice(1).map((v, i) => Math.abs(v - row[i])));
