/*
 * Image Processing · Lecture 5 (the Fourier transform): the maths its walkthroughs draw.
 * Pure and client-safe, so the scenes and the page's `expect` facts use the same numbers.
 *
 * The lecture's convention (McAndrew): the forward DFT carries the 1/N and a minus sign,
 * the inverse has no 1/N and a plus sign. MATLAB's fft has no 1/N; its ifft divides by N.
 */

/* ---------- Complex numbers ---------- */

export type C = { re: number; im: number };
export type Convention = "lecture" | "matlab";

const clean = (n: number) => (Math.abs(n) < 1e-9 ? 0 : n);
export const cx = (re: number, im = 0): C => ({ re: clean(re), im: clean(im) });
export const add = (a: C, b: C): C => cx(a.re + b.re, a.im + b.im);
export const mul = (a: C, b: C): C => cx(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const scale = (a: C, k: number): C => cx(a.re * k, a.im * k);
export const conj = (a: C): C => cx(a.re, -a.im);
export const abs = (a: C) => Math.hypot(a.re, a.im);
/** The phase in radians by the four-quadrant arctangent, as MATLAB's angle (atan2) computes it. */
export const arg = (a: C) => Math.atan2(a.im, a.re);
/** The phase in degrees, rounded: 135 for −0.5 + 0.5i. */
export const argDeg = (a: C) => Math.round((arg(a) * 180) / Math.PI);
/** tan⁻¹(imag / real) taken literally (one-quadrant): wrong whenever the real part is negative. */
export const naiveArgDeg = (a: C) => (a.re === 0 ? (a.im >= 0 ? 90 : -90) : Math.round((Math.atan(a.im / a.re) * 180) / Math.PI));
export const sum = (cs: readonly C[]) => cs.reduce(add, cx(0));
const toC = (f: readonly (number | C)[]): C[] => f.map((v) => (typeof v === "number" ? cx(v) : v));

/** ω^k with ω = exp(sign · 2πi / N); quarter turns come out exact (ω = −i for N = 4). */
export function omegaPow(N: number, k: number, sign: 1 | -1 = -1): C {
  const m = ((k % N) + N) % N;
  const t = (sign * 2 * Math.PI * m) / N;
  return cx(Math.cos(t), Math.sin(t));
}

/* ---------- 1-D DFT ---------- */

/** Row u of the DFT matrix times f, term by term: f_x · ω^(xu), before the 1/N. */
export function dftTerms(f: readonly (number | C)[], u: number): C[] {
  return toC(f).map((v, x) => mul(v, omegaPow(f.length, x * u)));
}

/** F_u = (1/N) Σ f_x exp(−2πi xu/N) in the lecture's convention; without the 1/N for MATLAB's fft. */
export function dft(f: readonly (number | C)[], convention: Convention = "lecture"): C[] {
  const k = convention === "lecture" ? 1 / f.length : 1;
  return f.map((_, u) => scale(sum(dftTerms(f, u)), k));
}

/** The terms F_u · exp(+2πi xu/N) of the inverse DFT at sample x (lecture convention: no 1/N). */
export function idftTerms(F: readonly C[], x: number): C[] {
  return F.map((v, u) => mul(v, omegaPow(F.length, x * u, 1)));
}

/** f_x = Σ F_u exp(2πi xu/N) (lecture convention); MATLAB's ifft divides by N. */
export function idft(F: readonly C[], convention: Convention = "lecture"): C[] {
  const k = convention === "lecture" ? 1 : 1 / F.length;
  return F.map((_, x) => scale(sum(idftTerms(F, x)), k));
}

/** Multiply x_n by (−1)^n: change the sign of every second element. */
export const alternate = (x: readonly number[]) => x.map((v, n) => (n % 2 ? -v : v));

/** MATLAB's fftshift: rotate by ⌊N/2⌋ so index 0 (the DC term) lands in the middle. */
export function fftshift<T>(a: readonly T[]): T[] {
  const h = Math.floor(a.length / 2);
  return a.map((_, i) => a[(i - h + a.length) % a.length]);
}

/** f(x + a), circularly: [1, 2, 3, 4] moved by 1 is [2, 3, 4, 1]. */
export const circShift = <T>(a: readonly T[], by: number): T[] => a.map((_, i) => a[(i + by) % a.length]);

/** Only the coefficients at ±u kept, then inverted: the real sinusoid at frequency u inside f. */
export function component(f: readonly number[], u: number): number[] {
  const F = dft(f);
  const N = f.length;
  const kept = F.map((v, k) => (k === u || k === N - u ? v : cx(0)));
  return idft(kept).map((v) => v.re);
}

/* ---------- Convolution ---------- */

export function linConv(x: readonly number[], y: readonly number[]): number[] {
  const out = new Array(x.length + y.length - 1).fill(0);
  x.forEach((a, i) => y.forEach((b, j) => (out[i + j] += a * b)));
  return out;
}

/** Fold a linear convolution onto N samples: the tail wraps round and adds onto the start. */
export function wrap(lin: readonly number[], N: number): number[] {
  const out = new Array(N).fill(0);
  lin.forEach((v, i) => (out[i % N] += v));
  return out;
}

/** z_k = Σ x_n y_(k−n), indices taken mod N (unscaled, as MATLAB's cconv(x, y, N)). */
export const circConv = (x: readonly number[], y: readonly number[]) => wrap(linConv(x, y), x.length);

/** The products x_n · y_((k−n) mod N) that make z_k. */
export const circTerms = (x: readonly number[], y: readonly number[], k: number) => x.map((v, n) => ({ n, m: (k - n + x.length) % x.length, value: v * y[(k - n + x.length) % x.length] }));

/** The coefficients of p(u) q(u) (1 + u^N): the slide's polynomial method. */
export function polyMethod(x: readonly number[], y: readonly number[]): number[] {
  return linConv(linConv(x, y), [1, ...new Array(x.length - 1).fill(0), 1]);
}

/* ---------- 2-D ---------- */

export type Grid<T> = T[][];

const transpose = <T>(g: readonly (readonly T[])[]): T[][] => g[0].map((_, c) => g.map((row) => row[c]));

/** The 1-D DFT of every row. */
export const dftRows = (g: readonly (readonly (number | C)[])[], convention: Convention = "lecture") => g.map((row) => dft(row, convention));

/** The 2-D DFT, separably: every row, then every column of the result. */
export function dft2(g: readonly (readonly (number | C)[])[], convention: Convention = "lecture"): Grid<C> {
  return transpose(transpose(dftRows(g, convention)).map((col) => dft(col, convention)));
}

/** The 2-D inverse, separably. */
export function idft2(G: readonly (readonly C[])[], convention: Convention = "lecture"): Grid<C> {
  return transpose(transpose(G.map((row) => idft(row, convention))).map((col) => idft(col, convention)));
}

/** fftshift in 2-D: swap the quadrants diagonally, so F(0, 0) sits in the middle. */
export const fftshift2 = <T>(g: readonly (readonly T[])[]): T[][] => fftshift(g.map((row) => fftshift(row)));

export const mapGrid = <T, U>(g: readonly (readonly T[])[], fn: (v: T, r: number, c: number) => U): U[][] => g.map((row, r) => row.map((v, c) => fn(v, r, c)));

/** log(1 + |F|), the way spectra are displayed. */
export const logMag = (G: readonly (readonly C[])[]) => mapGrid(G, (v) => Math.log(1 + abs(v)));

export const gridMax = (g: readonly (readonly number[])[]) => Math.max(...g.flat());

/* ---------- Formatting (the page prints these) ---------- */

/** A number rounded to `digits` decimals, trailing zeros dropped, −0 printed as 0. */
export function fmtNum(n: number, digits = 4): string {
  const r = Number(n.toFixed(digits));
  return String(Object.is(r, -0) ? 0 : r);
}

/** "-0.5+0.5i", "-8i", "260": the way the page's tables and MATLAB comments write them. `fixed` keeps every decimal ("-4.50+12.36i"). */
export function fmtC(c: C, digits = 4, fixed = false): string {
  const f = (n: number) => (fixed ? Math.abs(Number(n.toFixed(digits))).toFixed(digits) : fmtNum(Math.abs(n), digits));
  const re = Number(c.re.toFixed(digits));
  const im = Number(c.im.toFixed(digits));
  const sign = (n: number) => (n < 0 ? "-" : "");
  if (im === 0) return sign(re) + f(re);
  const imPart = Math.abs(im) === 1 && !fixed ? "i" : `${f(im)}i`;
  if (re === 0) return sign(im) + imPart;
  return `${sign(re)}${f(re)}${im < 0 ? "-" : "+"}${imPart}`;
}

/** "[66, 68, 66, 60]" */
export const fmtList = (xs: readonly (number | C)[], digits = 4) => `[${xs.map((v) => (typeof v === "number" ? fmtNum(v, digits) : fmtC(v, digits))).join(", ")}]`;

/** For drawing: the same text with a true minus sign. */
export const pretty = (s: string) => s.replace(/-/g, "−");

/** For reading: "−0.5 + 0.5i" (spaces round the inner sign, true minus signs). */
export const showC = (c: C, digits = 4) => pretty(fmtC(c, digits).replace(/(?<=[\di])([+-])/g, " $1 "));

/** For reading, compact: "−0.5+0.5i" (fits a narrow cell). */
export const tightC = (c: C, digits = 4) => pretty(fmtC(c, digits));

/** A sum written out: [1, −2i, −3, 4i] → "1 − 2i − 3 + 4i"; terms with two parts get brackets. */
export function sumText(terms: readonly C[], digits = 4): string {
  return terms
    .map((t, i) => {
      const both = t.re !== 0 && t.im !== 0;
      const s = fmtC(t, digits);
      if (both) return `${i ? "+ " : ""}(${showC(t, digits)})`;
      if (i === 0) return pretty(s);
      return s.startsWith("-") ? `− ${s.slice(1)}` : `+ ${s}`;
    })
    .join(" ");
}

/** The average of cos(2π·a·x)·cos(2π·b·x) over one unit of x: 0.5 when a = b ≠ 0, otherwise 0. */
export function productAverage(a: number, b: number, samples = 2000): number {
  let s = 0;
  for (let i = 0; i < samples; i++) {
    const x = i / samples;
    s += Math.cos(2 * Math.PI * a * x) * Math.cos(2 * Math.PI * b * x);
  }
  return Number((s / samples).toFixed(6));
}

/* ---------- The page's worked examples ---------- */

/** Worked example: the DFT of [1, 2, 3, 4]. */
export const WORKED = [1, 2, 3, 4] as const;
export const WORKED_F = dft(WORKED);
/** The row sums before the 1/4: 10, −2 + 2i, −2, −2 − 2i. */
export const WORKED_SUMS = WORKED.map((_, u) => sum(dftTerms(WORKED, u)));

/** MATLAB: b = fft(1:9). */
export const MATLAB_A = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
export const MATLAB_B = dft(MATLAB_A, "matlab");

/** The discrete square wave of slide 7 and its two sinusoids (one cycle and three cycles). */
export const SQUARE8 = [1, 1, 1, 1, -1, -1, -1, -1] as const;
export const SQUARE8_PARTS = [component(SQUARE8, 1), component(SQUARE8, 3)] as const;

/** Shifting: x = [2 3 4 5 6 7 8 1] and x1 = (−1)^n x, both through MATLAB's fft. */
export const SHIFT_X = [2, 3, 4, 5, 6, 7, 8, 1] as const;
export const SHIFT_X1 = alternate(SHIFT_X);
export const SHIFT_XF = dft(SHIFT_X, "matlab");
export const SHIFT_X1F = dft(SHIFT_X1, "matlab");

/** Circular convolution and the convolution theorem: x = [1, 2, 3, 4], y = [5, 6, 7, 8]. */
export const CONV_X = [1, 2, 3, 4] as const;
export const CONV_Y = [5, 6, 7, 8] as const;
export const CONV_LIN = linConv(CONV_X, CONV_Y);
export const CONV_Z = circConv(CONV_X, CONV_Y);
export const CONV_POLY = polyMethod(CONV_X, CONV_Y);
export const THEOREM_X = dft(CONV_X, "matlab");
export const THEOREM_Y = dft(CONV_Y, "matlab");
export const THEOREM_XY = THEOREM_X.map((v, k) => mul(v, THEOREM_Y[k]));
export const THEOREM_Z = dft(CONV_Z, "matlab");

/** Linearity: h = 2f + g with f = [1, 2, 3, 4] and the constant g = [1, 1, 1, 1]. */
export const LIN_P = 2;
export const LIN_Q = 1;
export const LIN_G = [1, 1, 1, 1] as const;
export const LIN_H = WORKED.map((v, i) => LIN_P * v + LIN_Q * LIN_G[i]);
export const LIN_HF = dft(LIN_H);
export const LIN_COMBINED = WORKED_F.map((v, k) => add(scale(v, LIN_P), scale(dft(LIN_G)[k], LIN_Q)));

/** Transform pairs with N = 4: an impulse at the origin and a constant. */
export const IMPULSE = [1, 0, 0, 0] as const;
export const CONSTANT = [1, 1, 1, 1] as const;

/* ---------- Curves and signals drawn by the scenes ---------- */

export const threeSines = (x: number) => Math.sin(x) + Math.sin(2 * x) / 3 + Math.sin(4 * x) / 5;
/** Its frequencies and amplitudes: the three spikes of its spectrum. */
export const THREE_SINES = [
  { u: 1, amp: 1 },
  { u: 2, amp: 1 / 3 },
  { u: 4, amp: 1 / 5 },
] as const;

/** A signal with two slow waves and two fast ripples, for low-pass versus high-pass. */
export const MIXED = [
  { u: 1, amp: 1 },
  { u: 2, amp: 0.45 },
  { u: 9, amp: 0.28 },
  { u: 12, amp: 0.2 },
] as const;
/** The cutoff between "low" and "high" for MIXED. */
export const MIXED_CUTOFF = 5;
export const mixed = (keep: "all" | "low" | "high") => (x: number) =>
  MIXED.filter((p) => keep === "all" || (keep === "low" ? p.u < MIXED_CUTOFF : p.u >= MIXED_CUTOFF)).reduce((s, p) => s + p.amp * Math.sin(p.u * x), 0);

/** The first `terms` odd harmonics of the slide's square-wave series: sin x + sin 3x / 3 + … */
export const squareSum = (terms: number) => (x: number) => {
  let s = 0;
  for (let k = 0; k < terms; k++) s += Math.sin((2 * k + 1) * x) / (2 * k + 1);
  return s;
};

/** The series as written levels off at ±π/4 (multiply by 4/π for a square wave of height 1). */
export const SQUARE_LEVEL = Math.PI / 4;

/** The peak of the partial sum next to the jump, as a share of the jump (2 · π/4): ≈ 0.09 once there are many terms (Gibbs). */
export function overshoot(terms: number): number {
  const s = squareSum(terms);
  let peak = 0;
  for (let i = 1; i < 4000; i++) peak = Math.max(peak, s((Math.PI * i) / 4000));
  return (peak - SQUARE_LEVEL) / (2 * SQUARE_LEVEL);
}

/** Circular distance from sample 0, so even signals have a real DFT. */
const dist = (x: number, N: number) => Math.min(x, N - x);

/** A sampled Gaussian centred on sample 0 of N (circularly). */
export const gaussian = (N: number, sigma: number) => Array.from({ length: N }, (_, x) => Math.exp(-(dist(x, N) ** 2) / (2 * sigma * sigma)));

/** A box of half-width w centred on sample 0 of N (2w + 1 ones). */
export const box = (N: number, w: number) => Array.from({ length: N }, (_, x) => (dist(x, N) <= w ? 1 : 0));

/** The real part of the DFT, centred, as [frequency, value] points from −N/2 to N/2 − 1, scaled so the peak is 1. */
export function centredSpectrum(f: readonly number[]): [number, number][] {
  const F = fftshift(dft(f).map((v) => v.re));
  const peak = Math.max(...F.map(Math.abs));
  return F.map((v, i) => [i - Math.floor(f.length / 2), v / peak]);
}

/** The signal itself, centred, as [x, value] points. */
export const centredSignal = (f: readonly number[]): [number, number][] => fftshift(f).map((v, i) => [i - Math.floor(f.length / 2), v]);

/** Where the centred spectrum first crosses zero: the half-width of the main lobe, in frequency samples. */
export function firstZero(f: readonly number[]): number {
  const pts = centredSpectrum(f).filter(([u]) => u >= 0);
  const hit = pts.find(([, v]) => v <= 0.0001);
  return hit ? hit[0] : pts[pts.length - 1][0];
}

/** The width (in frequency samples) where the centred spectrum is above half its peak. */
export const halfWidth = (f: readonly number[]) => centredSpectrum(f).filter(([, v]) => v >= 0.5).length;

/* ---------- 2-D images drawn by the scenes ---------- */

/** Every row is [1, 2, 3, 4]: the worked example as a 4 × 4 image. */
export const RAMP4: Grid<number> = Array.from({ length: 4 }, () => [...WORKED]);

/** 8 × 8 vertical stripes, `cycles` cycles across: 128 + 127 cos(2π · cycles · y / 8). */
export const stripes = (cycles: number): Grid<number> =>
  Array.from({ length: 8 }, () => Array.from({ length: 8 }, (_, y) => Math.round(128 + 127 * Math.cos((2 * Math.PI * cycles * y) / 8))));

/** A bright square on a dark background, its top-left corner at (top, left). */
export const squareImage = (n: number, size: number, top: number, left: number, on = 255, off = 0): Grid<number> =>
  Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r >= top && r < top + size && c >= left && c < left + size ? on : off)));

/** A grid rescaled so its largest value is `to` (for drawing a spectrum as grey levels). */
export const normalise = (g: readonly (readonly number[])[], to = 255) => {
  const m = gridMax(g) || 1;
  return mapGrid(g, (v) => Math.round((v / m) * to));
};

/** An ideal low-pass mask on a centred n × n spectrum: 1 within `radius` of the centre. */
export const lowPassMask = (n: number, radius: number): Grid<number> =>
  Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (Math.hypot(r - n / 2, c - n / 2) <= radius ? 1 : 0)));

/** Filter an image in the frequency domain: centre its DFT, multiply by the (centred) mask, undo the shift and invert. */
export function filterImage(img: readonly (readonly number[])[], mask: readonly (readonly number[])[]) {
  const F = fftshift2(dft2(img));
  const G = mapGrid(F, (v, r, c) => scale(v, mask[r][c]));
  const g = idft2(fftshift2inverse(G)).map((row) => row.map((v) => v.re));
  return { F, G, g };
}

/** Undo fftshift2 (the same as fftshift2 for even sizes). */
const fftshift2inverse = <T>(g: readonly (readonly T[])[]): T[][] => {
  const un = <U>(a: readonly U[]) => a.map((_, i) => a[(i + Math.floor(a.length / 2)) % a.length]);
  return un(g.map((row) => un(row)));
};

/* ---------- The examples the scenes use (shared with the walkthrough text) ---------- */

/** Stripes for "each point is one frequency": cycles across an 8-pixel row. */
export const STRIPE_CYCLES = { wide: 1, narrow: 3 } as const;

/** Transform pairs: N = 64 samples, Gaussians of two widths and boxes of two widths. */
export const PAIR_N = 64;
export const GAUSS_SIGMA = { narrow: 2, wide: 6 } as const;
export const BOX_HALF = { narrow: 2, wide: 6 } as const;
export const boxWidth = (half: number) => 2 * half + 1;

/** Filtering: a 16 × 16 image with a bright 6 × 6 square, and an ideal mask of radius 3. */
export const FILTER_IMG = squareImage(16, 6, 4, 5, 230, 20);
export const FILTER_RADIUS = 3;

/** A 16 × 16 image on a mid-grey background, for the log-scale panel: its DC term dwarfs the rest. */
export const LOG_IMG = squareImage(16, 6, 3, 6, 200, 120);

/** Magnitude versus phase: the same 3 × 3 square at two places in an 8 × 8 image. */
export const MOVED_SQUARE = { left: squareImage(8, 3, 1, 1), right: squareImage(8, 3, 4, 4) } as const;

/** Wrap-around: a row whose bright end touches the right border, blurred with a 3-tap mean. */
export const WRAP_ROW = [0, 0, 0, 0, 0, 0, 90, 90] as const;
export const WRAP_KERNEL = [1 / 3, 1 / 3, 1 / 3] as const;

/** Cost per pixel is drawn for a 512 × 512 image. */
export const COST_SIZE = 512;

/* ---------- Costs ---------- */

/** Multiplications per pixel: m² for an m × m kernel slid over the image. */
export const directPerPixel = (m: number) => m * m;
/** The FFT route, per pixel: on the order of log₂(MN), whatever the kernel size. */
export const fftPerPixel = (M: number, N: number) => Math.round(Math.log2(M * N));
/** Operations for a length-N DFT: N² directly, about N log₂ N by the FFT. */
export const dftOps = (N: number) => ({ direct: N * N, fft: Math.round(N * Math.log2(N)) });

/** A 1-D blur done through the DFT (circular) or on a zero-padded copy (no wrap-around). */
export function blurRow(row: readonly number[], kernel: readonly number[], padded: boolean): number[] {
  const half = Math.floor(kernel.length / 2);
  if (!padded) {
    // Circular: ifft(fft(row) .* fft(kernel placed with its centre at index 0)).
    const h = new Array(row.length).fill(0);
    kernel.forEach((k, i) => (h[(i - half + row.length) % row.length] = k));
    const R = dft(row, "matlab");
    const H = dft(h, "matlab");
    return idft(
      R.map((v, k) => mul(v, H[k])),
      "matlab",
    ).map((v) => Number(v.re.toFixed(6)));
  }
  const n = row.length + kernel.length - 1;
  const z = [...row, ...new Array(n - row.length).fill(0)];
  const h = new Array(n).fill(0);
  kernel.forEach((k, i) => (h[(i - half + n) % n] = k));
  const R = dft(z, "matlab");
  const H = dft(h, "matlab");
  return idft(
    R.map((v, k) => mul(v, H[k])),
    "matlab",
  )
    .slice(0, row.length)
    .map((v) => Number(v.re.toFixed(6)));
}
