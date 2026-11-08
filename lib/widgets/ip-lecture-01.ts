/*
 * Image Processing · Lecture 1: the pixel values and numbers its walkthrough scenes draw.
 * Pure, so the page's `expect` can check them against the worked examples in the text, and
 * the scenes draw exactly the values the server checked.
 */

export type Grid = readonly (readonly number[])[];

const map2 = (g: Grid, f: (v: number, r: number, c: number) => number): number[][] => g.map((row, r) => row.map((v, c) => f(v, r, c)));
const clamp = (v: number, lo = 0, hi = 255) => Math.min(hi, Math.max(lo, v));
/** The value at (r, c), repeating the border pixel outside the image. */
const at = (g: Grid, r: number, c: number) => g[clamp(r, 0, g.length - 1)][clamp(c, 0, g[0].length - 1)];
const round1 = (v: number) => Math.round(v * 10) / 10;

/** Slide 43 ("Image representation"): the small face, 15 rows × 12 columns, 0 = black, 255 = white. */
export const FACE: Grid = [
  [157, 153, 174, 168, 150, 152, 129, 151, 172, 161, 155, 156],
  [155, 182, 163, 74, 75, 62, 33, 17, 110, 210, 180, 154],
  [180, 180, 50, 14, 34, 6, 10, 33, 48, 106, 159, 181],
  [206, 109, 5, 124, 131, 111, 120, 204, 166, 15, 56, 180],
  [194, 68, 137, 251, 237, 239, 239, 228, 227, 87, 71, 201],
  [172, 106, 207, 233, 233, 214, 220, 239, 228, 98, 74, 206],
  [188, 88, 179, 209, 185, 215, 211, 158, 139, 75, 20, 169],
  [189, 97, 165, 84, 10, 168, 134, 11, 31, 62, 22, 148],
  [199, 168, 191, 193, 158, 227, 178, 143, 182, 106, 36, 190],
  [205, 174, 155, 252, 236, 231, 149, 178, 228, 43, 95, 234],
  [190, 216, 116, 149, 236, 187, 86, 150, 79, 38, 218, 241],
  [190, 224, 147, 108, 227, 210, 127, 102, 36, 101, 255, 224],
  [190, 214, 173, 66, 103, 143, 95, 50, 2, 109, 249, 215],
  [187, 196, 235, 75, 1, 81, 47, 0, 6, 217, 255, 211],
  [183, 202, 237, 145, 0, 0, 12, 108, 200, 138, 243, 236],
];

/** A rectangle of a grid: `rows` × `cols` starting at 0-based (r0, c0). */
export const crop = (g: Grid, r0: number, c0: number, rows: number, cols: number): number[][] => g.slice(r0, r0 + rows).map((row) => row.slice(c0, c0 + cols));

/** The zoomed patch of the face (1-based rows 3–6, columns 3–6) and the pixel picked out in it. */
export const FACE_PATCH = { r0: 2, c0: 2, rows: 4, cols: 4 } as const;
export const PICKED = { r: 3, c: 2 } as const; // 0-based in FACE: MATLAB f(4,3), NumPy f[3, 2]
export const pickedValue = FACE[PICKED.r][PICKED.c];

/** A deterministic "random blur": the same pixels every time the page renders. */
export function noiseGrid(rows: number, cols: number, seed = 7): number[][] {
  let s = seed;
  const next = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.round(next() * 255)));
}

/* ---------- Image processing operations used as examples ---------- */

/** 3 × 3 median filter (border pixels repeated): removes isolated noise spikes. */
export function median3(g: Grid): number[][] {
  return map2(g, (_, r, c) => {
    const win: number[] = [];
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) win.push(at(g, r + dr, c + dc));
    return win.sort((a, b) => a - b)[4];
  });
}

/** 3 × 3 mean filter, rounded: blurs away fine detail. */
export function mean3(g: Grid): number[][] {
  return map2(g, (_, r, c) => {
    let sum = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) sum += at(g, r + dr, c + dc);
    return Math.round(sum / 9);
  });
}

/** Laplacian sharpening, 5f − (up + down + left + right), clipped to 0…255. */
export function sharpen(g: Grid): number[][] {
  return map2(g, (v, r, c) => clamp(5 * v - at(g, r - 1, c) - at(g, r + 1, c) - at(g, r, c - 1) - at(g, r, c + 1)));
}

/** A binary edge map: 1 where a pixel is brighter than one of its 4 neighbours by at least `t` (the object's boundary). */
export function edges(g: Grid, t = 60): number[][] {
  return map2(g, (v, r, c) => (v - Math.min(at(g, r - 1, c), at(g, r + 1, c), at(g, r, c - 1), at(g, r, c + 1)) >= t ? 1 : 0));
}

/** Linear contrast stretch of the grid's own range onto 0…255. */
export function stretch(g: Grid): number[][] {
  const flat = g.flat();
  const lo = Math.min(...flat);
  const hi = Math.max(...flat);
  return map2(g, (v) => Math.round(((v - lo) * 255) / (hi - lo || 1)));
}

/** A smooth patch (brightness rising to the right), the same patch with noise spikes, and the median filter's result. */
export const SMOOTH_PATCH: Grid = Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => 100 + 20 * c + 4 * r));
const SPIKES: Record<string, number> = { "0,3": 255, "1,1": 0, "2,3": 255, "3,0": 255, "4,2": 0 };
export const NOISY_PATCH = map2(SMOOTH_PATCH, (v, r, c) => SPIKES[`${r},${c}`] ?? v);
export const DENOISED_PATCH = median3(NOISY_PATCH);

/** A soft (blurred) vertical edge, and the same edge after sharpening. */
export const SOFT_EDGE: Grid = Array.from({ length: 4 }, () => [60, 60, 80, 120, 160, 180, 180]);
export const SHARP_EDGE = sharpen(SOFT_EDGE);

/** A bright block on a dark background, and its binary edge map (what a program measures). */
export const BLOCK: Grid = [
  [40, 40, 40, 40, 40, 40],
  [40, 200, 200, 200, 200, 40],
  [40, 200, 200, 200, 200, 40],
  [40, 200, 200, 200, 200, 40],
  [40, 200, 200, 200, 200, 40],
  [40, 40, 40, 40, 40, 40],
];
export const BLOCK_EDGES = edges(BLOCK);

/** Fine texture, and the blurred version with the distracting detail removed. */
export const TEXTURE = crop(FACE, 6, 2, 6, 6);
export const TEXTURE_BLURRED = mean3(TEXTURE);

/* ---------- Acquisition: sampling, quantization, Nyquist, aliasing ---------- */

/** The slides' function y = sin(x) + (1/3) sin(3x). */
export const signal = (x: number) => Math.sin(x) + Math.sin(3 * x) / 3;

/** Its fastest component is sin(3x): one cycle every 2π/3, so two samples per cycle means a spacing of π/3. */
export const FASTEST = 3;
export const NYQUIST_SPACING = Math.PI / FASTEST;
export const nyquistSpacing = NYQUIST_SPACING.toFixed(2); // "1.05"

/** Sample points x = 0, h, 2h, … up to `end` (inclusive, within rounding). */
export function samples(h: number, end = 2 * Math.PI, f: (x: number) => number = signal): [number, number][] {
  const n = Math.round(end / h);
  return Array.from({ length: n + 1 }, (_, k) => [k * h, f(k * h)] as [number, number]);
}

/** A brightness profile along one row of a scene (continuous), sampled at 8 pixel centres. */
export const profile = (x: number) => 128 + 95 * Math.sin(0.9 * x - 0.6) + 20 * Math.sin(2.1 * x);
export const PROFILE_SAMPLES = Array.from({ length: 8 }, (_, k) => k + 0.5);
export const SAMPLED = PROFILE_SAMPLES.map((x) => round1(profile(x)));

/** Round 0…255 to `levels` evenly spaced grey levels (0 and 255 included). */
export function quantizeTo(v: number, levels: number): number {
  const step = 255 / (levels - 1);
  return Math.round(Math.round(v / step) * step);
}
export const QUANT_LEVELS = 4;
export const QUANTIZED = SAMPLED.map((v) => quantizeTo(v, QUANT_LEVELS));

/** Vertical stripes s(u) = 127.5 + 127.5 cos(2π · 7u), 7 cycles across the width, sampled at pixel centres. */
export const STRIPE_CYCLES = 7;
export const stripe = (u: number) => 127.5 + 127.5 * Math.cos(2 * Math.PI * STRIPE_CYCLES * u);
export const sampleStripes = (n: number) => Array.from({ length: n }, (_, k) => Math.round(stripe((k + 0.5) / n)));

/* ---------- Bit depth and image types ---------- */

/** Grey levels for a bit depth k: L = 2^k. */
export const levels = (k: number) => 2 ** k;

/** Re-quantize an 8-bit grey value to k bits, shown back on the 0…255 scale. */
export function requantize(v: number, k: number): number {
  if (k >= 8) return v;
  const L = levels(k);
  const level = Math.floor((v * L) / 256);
  return Math.round((level * 255) / (L - 1));
}

/** A binary image: the edge map of a block, 1 = white edge, 0 = black background. */
export const BINARY_EDGES: Grid = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 1, 0, 0, 0, 1, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

/** Slide 59: the top-left 3 × 3 patch of the flower image, per channel. */
export const FLOWER = {
  R: [
    [49, 55, 56],
    [58, 60, 60],
    [58, 58, 54],
  ],
  G: [
    [64, 76, 82],
    [93, 93, 91],
    [88, 82, 88],
  ],
  B: [
    [66, 80, 77],
    [81, 93, 96],
    [83, 83, 91],
  ],
} as const satisfies Record<"R" | "G" | "B", Grid>;

export const TRUE_COLOR_BITS = 3 * 8;
export const TRUE_COLORS = 2 ** TRUE_COLOR_BITS; // 16,777,216

/** Slide 60: the first two rows of the emu's index matrix, and the first 8 rows of its color map. */
export const EMU_INDICES: Grid = [
  [4, 5, 5, 5, 5, 5],
  [5, 4, 5, 5, 6, 6],
];
export const EMU_MAP: readonly (readonly [number, number, number])[] = [
  [0.1211, 0.1211, 0.1416],
  [0.1807, 0.2549, 0.1729],
  [0.2197, 0.3447, 0.1807],
  [0.1611, 0.1768, 0.1924],
  [0.2432, 0.2471, 0.1924],
  [0.2119, 0.1963, 0.2002],
  [0.2627, 0.2588, 0.2549],
  [0.2197, 0.2432, 0.2588],
];
/** The boxed pixel on the slide, and the map row it picks: a uint8 index starts at 0, so row = index + 1. */
export const BOXED_INDEX = 6;
export const mapRow = (index: number) => index + 1;
export const mapColor = (index: number) => {
  const [r, g, b] = EMU_MAP[index];
  return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
};

/* ---------- Storage ---------- */

/** Size of an M × N image with b bits per pixel. */
export const sizeBits = (pixels: number, bitsPerPixel: number) => pixels * bitsPerPixel;
export const sizeBytes = (pixels: number, bitsPerPixel: number) => sizeBits(pixels, bitsPerPixel) / 8;

/** The page's camera example: almost three million pixels for a 3 × 5 inch photo. */
export const CAMERA_PIXELS = 3_000_000;
export const STORAGE = {
  trueColor: { bpp: 24, bits: sizeBits(CAMERA_PIXELS, 24), bytes: sizeBytes(CAMERA_PIXELS, 24) },
  indexed: { bpp: 8, bits: sizeBits(CAMERA_PIXELS, 8), bytes: sizeBytes(CAMERA_PIXELS, 8) },
} as const;

/** Raster file size grows with the pixel count: a 100 × 100 True-Color image enlarged 2× and 4×. */
export const RASTER_SCALES = [1, 2, 4].map((s) => ({ scale: s, side: 100 * s, bytes: sizeBytes(100 * s * 100 * s, 24) }));

/** peppers.png in image_types.m: 384 × 512 RGB. MATLAB stores uint8 and logical in 1 byte, double in 8. */
export const PEPPERS = { rows: 384, cols: 512 } as const;
const peppersPixels = PEPPERS.rows * PEPPERS.cols;
export const PEPPERS_BYTES = {
  rgb: peppersPixels * 3 * 1,
  gray: peppersPixels * 1,
  binary: peppersPixels * 1,
  double: peppersPixels * 3 * 8,
} as const;

/* ---------- Conversions ---------- */

export const RGB2GRAY_WEIGHTS = [0.2989, 0.587, 0.114] as const;
export type GrayMethod = "average" | "red" | "weighted";

/** One pixel's grey value by each of the page's methods, rounded like a uint8 result. */
export function grayOf(r: number, g: number, b: number, method: GrayMethod): number {
  if (method === "red") return r;
  if (method === "weighted") return Math.round(RGB2GRAY_WEIGHTS[0] * r + RGB2GRAY_WEIGHTS[1] * g + RGB2GRAY_WEIGHTS[2] * b);
  return Math.round((r + g + b) / 3);
}

export const toGray = (method: GrayMethod): number[][] => map2(FLOWER.R, (r, i, j) => grayOf(r, FLOWER.G[i][j], FLOWER.B[i][j], method));
export const flowerSum = (i: number, j: number) => FLOWER.R[i][j] + FLOWER.G[i][j] + FLOWER.B[i][j];

/** Binary(i, j) = 1 if Gray(i, j) ≥ T, else 0. */
export const threshold = (g: Grid, t: number): number[][] => map2(g, (v) => (v >= t ? 1 : 0));
/** Rows of a binary grid written "000/111/101", as the page's table lists them. */
export const binaryRows = (g: Grid) => g.map((row) => row.join("")).join("/");

/* ---------- Pixels, neighbourhoods, point and neighbourhood operations ---------- */

/** McAndrew's 3 × 5 neighbourhood; the current pixel (113) is in the middle. */
export const NEIGHBOURHOOD: Grid = [
  [127, 87, 139, 44, 228],
  [229, 136, 113, 250, 51],
  [210, 185, 177, 69, 76],
];
export const CENTRE = { r: 1, c: 2 } as const;
export const centreValue = NEIGHBOURHOOD[CENTRE.r][CENTRE.c];

/** The 3 × 3 mean around the current pixel: a neighbourhood operation. */
export const neighbourhoodMean = Math.round(crop(NEIGHBOURHOOD, 0, 1, 3, 3).flat().reduce((s, v) => s + v, 0) / 9);
/** Adding 50 to the current pixel alone: a point operation. */
export const POINT_ADD = 50;
export const pointResult = clamp(centreValue + POINT_ADD);

/* ---------- Aspects: enhancement, restoration, segmentation ---------- */

/** A dull, low-contrast patch, and its contrast stretch. */
export const DULL: Grid = [
  [112, 118, 125, 131],
  [115, 121, 134, 140],
  [109, 120, 138, 143],
  [104, 113, 127, 136],
];
export const STRETCHED = stretch(DULL);

/**
 * Motion blur with a known cause: the camera slid one pixel, so every pixel is the mean of
 * itself and its left neighbour. Knowing that model, the original can be solved for exactly;
 * a generic sharpen only makes the blur look crisper.
 */
export const SCENE_ROW = [20, 20, 20, 220, 220, 220, 20, 20] as const;
export const blurRight = (f: readonly number[]) => f.map((v, i) => (v + f[Math.max(i - 1, 0)]) / 2);
export const BLURRED_ROW = blurRight(SCENE_ROW);
export function undoBlurRight(b: readonly number[]): number[] {
  const f: number[] = [];
  b.forEach((v, i) => f.push(i === 0 ? v : 2 * v - f[i - 1]));
  return f;
}
export const RESTORED_ROW = undoBlurRight(BLURRED_ROW);
export const SHARPENED_ROW = sharpen([BLURRED_ROW])[0];

/** An aerial view as grey levels, and the class of every pixel (semantic segmentation). */
export type SegClass = "road" | "tree" | "building" | "car";
const SEG_KEY: Record<string, SegClass> = { r: "road", t: "tree", b: "building", c: "car" };
const SEG_LAYOUT = ["ttrrbbbb", "ttrrbbbb", "ttrrtttt", "rrrrrrrr", "rcrrrrcr", "ttrrbbtt"];
export const SEGMENTS: readonly (readonly SegClass[])[] = SEG_LAYOUT.map((row) => [...row].map((ch) => SEG_KEY[ch]));
const SEG_GREY: Record<SegClass, number> = { road: 128, tree: 62, building: 205, car: 240 };
export const AERIAL: Grid = SEGMENTS.map((row, r) => row.map((cls, c) => clamp(SEG_GREY[cls] + (((r * 7 + c * 5) % 9) - 4) * 2)));

/* ---------- Counting coins ---------- */

/** Dark coins (4 × 4 disks) on a light background, 10 rows × 11 columns: B and C touch. */
const COIN_ROWS = [
  "...........",
  ".XX....XX..",
  "XXXX..XXXX.",
  "XXXX..XXXX.",
  ".XX....XX..",
  ".......XX..",
  "......XXXX.",
  "......XXXX.",
  ".......XX..",
  "...........",
];
const COIN_MASK = COIN_ROWS.map((row) => [...row].map((ch) => (ch === "X" ? 1 : 0)));
export const COINS: Grid = COIN_MASK.map((row, r) => row.map((m, c) => (m ? 70 + ((r * 5 + c * 3) % 11) * 2 : 196 + ((r * 7 + c * 13) % 9) * 3)));
export const COIN_T = 128;
/** Segment: threshold, then invert so the dark coins are 1 (MATLAB ~imbinarize). */
export const COINS_BW = map2(COINS, (v) => (v < COIN_T ? 1 : 0));

/** Erosion with a 3 × 3 cross: a pixel stays 1 only if it and its 4 neighbours are all 1. */
export function erodeCross(g: Grid): number[][] {
  const v = (r: number, c: number) => (r < 0 || c < 0 || r >= g.length || c >= g[0].length ? 0 : g[r][c]);
  return map2(g, (x, r, c) => (x && v(r - 1, c) && v(r + 1, c) && v(r, c - 1) && v(r, c + 1) ? 1 : 0));
}
export const COINS_ERODED = erodeCross(COINS_BW);

/** Connected components with 8-connectivity (as bwlabel): labels 1…n, 0 for background. */
export function label(g: Grid): { labels: number[][]; n: number } {
  const labels = g.map((row) => row.map(() => 0));
  let n = 0;
  for (let r = 0; r < g.length; r++)
    for (let c = 0; c < g[0].length; c++) {
      if (!g[r][c] || labels[r][c]) continue;
      n++;
      const stack: [number, number][] = [[r, c]];
      labels[r][c] = n;
      while (stack.length) {
        const [y, x] = stack.pop()!;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const yy = y + dy;
            const xx = x + dx;
            if (yy >= 0 && xx >= 0 && yy < g.length && xx < g[0].length && g[yy][xx] && !labels[yy][xx]) {
              labels[yy][xx] = n;
              stack.push([yy, xx]);
            }
          }
      }
    }
  return { labels, n };
}
export const COINS_BEFORE = label(COINS_BW);
export const COINS_AFTER = label(COINS_ERODED);

/* ---------- Resolution ---------- */

/** A smooth scene (a ball lit from the top left on a dark background) sampled at n × n pixel centres. */
export function sampleDisc(n: number): number[][] {
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => {
      const x = (c + 0.5) / n - 0.5;
      const y = (r + 0.5) / n - 0.5;
      if (Math.hypot(x, y) > 0.4) return 30;
      return Math.round(clamp(245 - 300 * Math.hypot(x + 0.14, y + 0.14), 60, 245));
    }),
  );
}

/* ---------- Raster vs vector ---------- */

/** A ring rasterized on an n × n grid: 0.15 (dark) where a pixel centre falls on the ring, 0.95 elsewhere (max 1). */
export function ringMask(n: number, radius = 0.35, thickness = 0.13): number[][] {
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => {
      const d = Math.hypot((c + 0.5) / n - 0.5, (r + 0.5) / n - 0.5);
      return Math.abs(d - radius) <= thickness / 2 ? 0.15 : 0.95;
    }),
  );
}
