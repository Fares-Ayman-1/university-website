/**
 * Spatial filtering, step by step: slide a k×k mask over an image (correlation, or
 * convolution = the mask rotated by 180° first), with the border methods of
 * image-processing lecture 3. Pure and client-safe; also checked at build time.
 */

export type Padding = "none" | "zero" | "replicate" | "symmetric" | "wrap";
export type FilterMode = "correlation" | "convolution";
export type KernelPreset = "mean" | "identity" | "laplacian" | "shift";

export type Kernel = { weights: number[][]; divisor: number };

export const KERNEL_PRESETS: Record<KernelPreset, Kernel> = {
  mean: { weights: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], divisor: 9 },
  identity: { weights: [[0, 0, 0], [0, 1, 0], [0, 0, 0]], divisor: 1 },
  laplacian: { weights: [[0, 1, 0], [1, -4, 1], [0, 1, 0]], divisor: 1 },
  // A single 1 left of centre (lecture 3, slide 9): correlation copies the left neighbour,
  // convolution (mask flipped) the right one.
  shift: { weights: [[0, 0, 0], [1, 0, 0], [0, 0, 0]], divisor: 1 },
};

/** "3 3 2; 0 0 1" → [[3,3,2],[0,0,1]] (rows split by ";" or newlines, values by spaces or commas) */
export function parseMatrix(source: string): number[][] {
  const rows = source
    .trim()
    .split(/\s*[;\n]\s*/)
    .filter(Boolean)
    .map((row) => row.split(/[\s,]+/).map(Number));
  if (rows.length === 0 || rows.some((row) => row.length !== rows[0].length || row.some(Number.isNaN))) {
    throw new Error(`Not a rectangular matrix of numbers: "${source}"`);
  }
  return rows;
}

export function resolveKernel(kernel: string): Kernel {
  if (kernel in KERNEL_PRESETS) return KERNEL_PRESETS[kernel as KernelPreset];
  const weights = parseMatrix(kernel);
  if (weights.length !== weights[0].length || weights.length % 2 === 0) {
    throw new Error(`The mask must be square with an odd size (3×3, 5×5…): "${kernel}"`);
  }
  return { weights, divisor: 1 };
}

const rotate180 = (m: number[][]) => m.map((row) => [...row].reverse()).reverse();

/** Index into 0..n-1 for a position that may fall outside the image. */
function borderIndex(i: number, n: number, padding: Exclude<Padding, "none" | "zero">): number {
  if (padding === "replicate") return Math.min(Math.max(i, 0), n - 1);
  if (padding === "wrap") return ((i % n) + n) % n;
  // symmetric (MATLAB 'symmetric'): mirror including the edge pixel, so [a b c] → b a | a b c | c b
  let j = i;
  while (j < 0 || j >= n) j = j < 0 ? -j - 1 : 2 * n - j - 1;
  return j;
}

export type PaddedCell = { value: number; pad: boolean };

export type ConvolutionStep = {
  /** Output row/column (0-based) = top-left of the window in the padded grid */
  row: number;
  col: number;
  /** f under each mask position and the weight applied to it, row by row */
  terms: { f: number; w: number }[];
  sum: number;
  value: number;
};

export type ConvolutionResult = {
  k: number;
  /** The weights actually laid on the image (rotated by 180° for convolution) */
  applied: number[][];
  divisor: number;
  padded: PaddedCell[][];
  steps: ConvolutionStep[];
  output: number[][];
};

const round = (x: number) => Math.round(x * 1000) / 1000;

export function filterImage(image: number[][], kernel: Kernel, mode: FilterMode, padding: Padding): ConvolutionResult {
  const k = kernel.weights.length;
  const p = padding === "none" ? 0 : (k - 1) / 2;
  const rows = image.length;
  const cols = image[0].length;
  if (padding === "none" && (rows < k || cols < k)) throw new Error("The image is smaller than the mask.");
  const applied = mode === "convolution" ? rotate180(kernel.weights) : kernel.weights;

  const padded: PaddedCell[][] = [];
  for (let r = -p; r < rows + p; r++) {
    const line: PaddedCell[] = [];
    for (let c = -p; c < cols + p; c++) {
      const inside = r >= 0 && r < rows && c >= 0 && c < cols;
      if (inside) line.push({ value: image[r][c], pad: false });
      else if (padding === "zero") line.push({ value: 0, pad: true });
      else {
        const mode2 = padding as Exclude<Padding, "none" | "zero">;
        line.push({ value: image[borderIndex(r, rows, mode2)][borderIndex(c, cols, mode2)], pad: true });
      }
    }
    padded.push(line);
  }

  const outRows = padded.length - k + 1;
  const outCols = padded[0].length - k + 1;
  const steps: ConvolutionStep[] = [];
  const output: number[][] = [];
  for (let r = 0; r < outRows; r++) {
    const line: number[] = [];
    for (let c = 0; c < outCols; c++) {
      const terms: ConvolutionStep["terms"] = [];
      let sum = 0;
      for (let i = 0; i < k; i++) {
        for (let j = 0; j < k; j++) {
          const f = padded[r + i][c + j].value;
          const w = applied[i][j];
          terms.push({ f, w });
          sum += f * w;
        }
      }
      const value = round(sum / kernel.divisor);
      steps.push({ row: r, col: c, terms, sum, value });
      line.push(value);
    }
    output.push(line);
  }

  return { k, applied, divisor: kernel.divisor, padded, steps, output };
}

/** Throws (failing the build) when the computed output differs from the page's own answer. */
export function assertOutput(output: number[][], expected: number[][], where: string) {
  const same =
    output.length === expected.length &&
    output.every((row, r) => row.length === expected[r].length && row.every((v, c) => Math.abs(v - expected[r][c]) < 1e-6));
  if (!same) {
    throw new Error(`${where}: computed output ${JSON.stringify(output)} differs from expect=${JSON.stringify(expected)}`);
  }
}

export const formatNumber = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""));
