/**
 * The worked numbers of robotics lecture 4 (Sensors II): encoder resolution and Gray code,
 * sonar and laser time of flight, infrared triangulation, speed from encoder pulses, and the
 * small geometry the walkthrough scenes draw (a laser scan of a room). Pure and client-safe;
 * the walkthrough facts computed here are checked by the page's `expect`.
 *
 * Sources: book Ch 6 (pp. 118–141) and the lecture 4 slides. Encoder code reuses encoder.ts,
 * the module behind the page's EncoderSim, so both widgets agree.
 */

import { binaryToGray, bitString, popcount, skewCrossing } from "./encoder";

export { binaryToGray, bitString };

/** Round to `dp` decimal places (as a number). */
export const round = (x: number, dp = 2) => Math.round(x * 10 ** dp) / 10 ** dp;
/** A number with a fixed number of decimals, as the page prints it ("2.0"). */
export const fixed = (x: number, dp: number) => x.toFixed(dp);

/* ---------- Incremental encoders ---------- */

/** One slot pitch: 360° / N (60 slots → 6°). */
export const slotPitch = (slots: number) => 360 / slots;

/** Counting modes: ×1 rising edges of A, ×2 both edges of A, ×4 both edges of A and B. */
export type CountMode = 1 | 2 | 4;

/** Counts per revolution of an N-slot disc read in a counting mode. */
export const countsPerRev = (slots: number, mode: CountMode) => slots * mode;

/** Angle per count: 360° / (mode × N). 500 slots: 0.72°, 0.36°, 0.18°. */
export const countResolution = (slots: number, mode: CountMode) => 360 / countsPerRev(slots, mode);

/** The quadrature states turning clockwise (slide 12, and the page's decoder +1 direction), as "AB". */
export const CW = ["00", "01", "11", "10"] as const;
/** The same states turning counter-clockwise, from 00: the clockwise loop run backwards. */
export const CCW = ["00", "10", "11", "01"] as const;

/** A and B levels for `quarters` quarter-slot steps in one direction, starting at 00. */
export function quadratureRun(dir: "cw" | "ccw", quarters: number): { a: number[]; b: number[] } {
  const seq = dir === "cw" ? CW : CCW;
  const states = Array.from({ length: quarters }, (_, i) => seq[i % 4]);
  return { a: states.map((s) => Number(s[0])), b: states.map((s) => Number(s[1])) };
}

/**
 * The edges each counting mode counts in a run of A/B levels: the index of the step where
 * the level changes (between quarter i − 1 and i), and which channel.
 */
export function countedEdges(a: readonly number[], b: readonly number[], mode: CountMode): { at: number; ch: "A" | "B" }[] {
  const out: { at: number; ch: "A" | "B" }[] = [];
  for (let i = 1; i < a.length; i++) {
    const aRise = a[i] > a[i - 1];
    const aFall = a[i] < a[i - 1];
    const bEdge = b[i] !== b[i - 1];
    if (aRise || (aFall && mode >= 2)) out.push({ at: i, ch: "A" });
    if (bEdge && mode === 4) out.push({ at: i, ch: "B" });
  }
  return out;
}

/* ---------- Absolute encoders and Gray code ---------- */

/** n tracks → 2^n positions. */
export const positions = (tracks: number) => 2 ** tracks;
/** 360° / 2^n (3 tracks → 45°, 4 → 22.5°, 10 → ≈ 0.35°, 12 → ≈ 0.088°). */
export const trackResolution = (tracks: number) => 360 / positions(tracks);
/** Fewest tracks whose 2^n positions reach `counts` (2000 counts → 11 tracks). */
export const tracksFor = (counts: number) => Math.ceil(Math.log2(counts));

/** The sector under a shaft angle (degrees, 0 = sector 0's start), and that sector's span. */
export function sectorOf(angle: number, tracks: number) {
  const size = trackResolution(tracks);
  const sector = Math.floor((((angle % 360) + 360) % 360) / size);
  return { sector, from: sector * size, to: (sector + 1) * size, word: bitString(sector, tracks) };
}

/** The pointer angle the absolute-disc scene sweeps to: inside sector 4 of the 3-track disc (180°–225°, slide 17). */
export const READ_ANGLE = 200;

/** Neighbouring words of the 4-bit disc where plain binary flips every bit (the page: 0111 → 1000). */
export const GRAY_DEMO = { from: 7, to: 8, bits: 4 } as const;

/** Bits that change between neighbouring sectors, in binary and in Gray code. */
export const flips = (from: number, to: number) => ({ binary: popcount(from ^ to), gray: popcount(binaryToGray(from) ^ binaryToGray(to)) });

/** What skewed detectors read while crossing 7 → 8 (binary: 1111, a misread; Gray: one of the two neighbours). */
export const grayDemo = () => {
  const { from, to, bits } = GRAY_DEMO;
  const read = skewCrossing(from, to, bits);
  return {
    from: { binary: bitString(from, bits), gray: bitString(binaryToGray(from), bits) },
    to: { binary: bitString(to, bits), gray: bitString(binaryToGray(to), bits) },
    misread: { binary: bitString(read.binary, bits), gray: bitString(read.gray, bits), binaryValue: read.binary },
    flips: flips(from, to),
  };
};

/** The page's Gray sequence 0000 0001 0011 … for 0…count − 1. */
export const graySequence = (count: number, bits: number) => Array.from({ length: count }, (_, i) => bitString(binaryToGray(i), bits));

/* ---------- Sonar ---------- */

/** Speed of sound at 20 °C (book p. 126, lab p. 140). */
export const SOUND = 343;
/** About 0.6 m/s per °C (book p. 127). */
export const SOUND_PER_DEGREE = 0.6;
export const soundSpeed = (celsius: number) => SOUND + SOUND_PER_DEGREE * (celsius - 20);

/** d = v·t / 2 (t in seconds). */
export const echoDistance = (t: number, v = SOUND) => (v * t) / 2;
/** t = 2d / v. */
export const echoTime = (d: number, v = SOUND) => (2 * d) / v;

/** At `rate` pings per second the echo must be back before the next ping: v / (2·rate). */
export const unambiguousRange = (rate: number, v = SOUND) => v / rate / 2;

/** Sonar ring: 24 sensors of about 15° (slide 23); fired one after another at 20 Hz. */
export const RING = { sensors: 24, rate: 20 } as const;
export const ringCone = (sensors: number) => 360 / sensors;
export const sequentialScan = (sensors: number, rate: number) => sensors / rate;

/** What a sensor calibrated for 343 m/s reads for a wall `d` metres away when the air is at `celsius`. */
export const readingAt = (d: number, celsius: number) => echoDistance(echoTime(d, soundSpeed(celsius)));

/* ---------- Laser time of flight ---------- */

export const LIGHT = 3e8;
/** Round trip of light, in seconds. */
export const lightTime = (d: number) => (2 * d) / LIGHT;

/* ---------- Infrared triangulation ---------- */

/** Where the spot lands on the array, x = f·b / d (any consistent unit). */
export const spotOffset = (d: number, f: number, b: number) => (f * b) / d;

/* ---------- Speed from encoder pulses ---------- */

/** Rev/min from a count over a window: counts / (counts per rev) / window × 60. */
export const rpmFrom = (counts: number, cpr: number, windowSeconds: number) => (counts / cpr / windowSeconds) * 60;

/** The tachometer demo: the page's 500-slot encoder read ×4, at a steady 75 rpm, over 10 ms. */
export const SPEED_DEMO = { cpr: countsPerRev(500, 4), rpm: 75, span: 10, phase: 0.1 } as const;

/** Count edges in the demo span (times in ms): the shaft gives cpr·rpm/60 counts per second. */
export function demoEdges() {
  const { cpr, rpm, span, phase } = SPEED_DEMO;
  const perMs = (cpr * rpm) / 60 / 1000;
  const edges: number[] = [];
  for (let k = 0; ; k++) {
    const t = round((phase + k) / perMs, 6);
    if (t >= span) break;
    edges.push(t);
  }
  return { perMs, edges };
}

/** Counts in consecutive windows of `win` ms, and the speed each window reports. */
export function windowReadings(win: number) {
  const { cpr, span } = SPEED_DEMO;
  const { edges } = demoEdges();
  return Array.from({ length: Math.round(span / win) }, (_, i) => {
    const counts = edges.filter((t) => t >= i * win && t < (i + 1) * win).length;
    return { from: i * win, counts, rpm: round(rpmFrom(counts, cpr, win / 1000), 1) };
  });
}

/* ---------- A laser scan of a small room (scene geometry, SVG units) ---------- */

export type P = readonly [number, number];
type Seg = readonly [P, P];

/** The room the LiDAR scenes scan: four walls and one box. */
export const ROOM = { x: 20, y: 20, w: 300, h: 240 } as const;
export const BOX = { x: 200, y: 70, w: 50, h: 44 } as const;

const rectSegs = (r: { x: number; y: number; w: number; h: number }): Seg[] => {
  const a: P = [r.x, r.y];
  const b: P = [r.x + r.w, r.y];
  const c: P = [r.x + r.w, r.y + r.h];
  const d: P = [r.x, r.y + r.h];
  return [
    [a, b],
    [b, c],
    [c, d],
    [d, a],
  ];
};

const WALLS = rectSegs(ROOM);
const BOX_SEGS = rectSegs(BOX);

/** Distance along a ray (origin o, unit direction u) to a segment, or Infinity. */
function hit(o: P, u: P, [p, q]: Seg): number {
  const ex = q[0] - p[0];
  const ey = q[1] - p[1];
  const den = u[0] * ey - u[1] * ex;
  if (Math.abs(den) < 1e-9) return Infinity;
  const t = ((p[0] - o[0]) * ey - (p[1] - o[1]) * ex) / den;
  const s = ((p[0] - o[0]) * u[1] - (p[1] - o[1]) * u[0]) / den;
  return t > 1e-6 && s >= -1e-9 && s <= 1 + 1e-9 ? t : Infinity;
}

/** Cast `n` rays from `o` between `from` and `to` degrees (SVG convention: 0° = +x, clockwise). */
export function scan(o: P, n: number, from = 0, to = 360): { at: P; onBox: boolean; angle: number }[] {
  const step = to - from === 360 ? 360 / n : (to - from) / (n - 1);
  return Array.from({ length: n }, (_, i) => {
    const angle = from + i * step;
    const r = (angle * Math.PI) / 180;
    const u: P = [Math.cos(r), Math.sin(r)];
    const wall = Math.min(...WALLS.map((s) => hit(o, u, s)));
    const box = Math.min(...BOX_SEGS.map((s) => hit(o, u, s)));
    const t = Math.min(wall, box);
    return { at: [round(o[0] + u[0] * t, 1), round(o[1] + u[1] * t, 1)] as P, onBox: box <= wall, angle };
  });
}

/** The occluded region behind the box seen from `o`: wall hits along the box's angular span, then back along the box. */
export function shadowOf(o: P, steps = 60): P[] {
  const corners: P[] = [
    [BOX.x, BOX.y],
    [BOX.x + BOX.w, BOX.y],
    [BOX.x + BOX.w, BOX.y + BOX.h],
    [BOX.x, BOX.y + BOX.h],
  ];
  const angles = corners.map((c) => (Math.atan2(c[1] - o[1], c[0] - o[0]) * 180) / Math.PI);
  const lo = Math.min(...angles) + 0.05;
  const hi = Math.max(...angles) - 0.05;
  const far: P[] = [];
  const near: P[] = [];
  for (let i = 0; i <= steps; i++) {
    const r = ((lo + ((hi - lo) * i) / steps) * Math.PI) / 180;
    const u: P = [Math.cos(r), Math.sin(r)];
    const tw = Math.min(...WALLS.map((s) => hit(o, u, s)));
    const tb = Math.min(...BOX_SEGS.map((s) => hit(o, u, s)));
    const at = (t: number): P => [round(o[0] + u[0] * t, 1), round(o[1] + u[1] * t, 1)];
    far.push(at(tw));
    near.push(at(Number.isFinite(tb) ? tb : tw));
  }
  return [...far, ...near.reverse()];
}

/** Where the scanner sits in the scan scenes, before and after the robot moves. */
export const SCANNER = { first: [95, 190] as P, moved: [270, 225] as P };

/* ---------- Tactile array ---------- */

/** A pressure map on an n×n taxel grid: a soft bump of `peak` at (cr, cc) with spread `s` (cells). */
export function pressureMap(n: number, cr: number, cc: number, s: number, peak: number): number[][] {
  return Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => {
      const v = peak * Math.exp(-((r - cr) ** 2 + (c - cc) ** 2) / (2 * s * s));
      return v < 0.06 * peak ? 0 : Math.round(v);
    }),
  );
}

/** The centre of pressure of a map (row, column), and the total load. */
export function centreOfPressure(m: readonly (readonly number[])[]) {
  let sum = 0;
  let r = 0;
  let c = 0;
  m.forEach((row, i) =>
    row.forEach((v, j) => {
      sum += v;
      r += v * i;
      c += v * j;
    }),
  );
  return { row: sum ? r / sum : 0, col: sum ? c / sum : 0, total: sum, active: m.flat().filter((v) => v > 0).length };
}

/* ---------- Facts the page quotes ---------- */

const demo = grayDemo();
const speedOneMs = windowReadings(1);

export const ENCODER_FACTS = {
  slot60: slotPitch(60),
  slot500: round(slotPitch(500), 2),
  x2: round(countResolution(500, 2), 2),
  x4: round(countResolution(500, 4), 2),
  res3: trackResolution(3),
  res4: trackResolution(4),
  res10: round(trackResolution(10), 2),
  res12: round(trackResolution(12), 3),
  tracks: tracksFor(countsPerRev(500, 4)),
  glitch: demo.misread.binary,
} as const;

export const SONAR_FACTS = {
  v: SOUND,
  echo: 11.7,
  range: fixed(echoDistance(0.0117), 1),
  sensors: RING.sensors,
  cone: ringCone(RING.sensors),
  rate: RING.rate,
  maxRange: round(unambiguousRange(RING.rate), 1),
  scan: round(sequentialScan(RING.sensors, RING.rate), 1),
} as const;

export const LIDAR_FACTS = {
  ns10: Math.round(lightTime(10) * 1e9),
  ms10: Math.round(echoTime(10) * 1e3),
  ps1mm: round(lightTime(0.001) * 1e12, 1),
} as const;

export const TACHO_FACTS = {
  /** ±1 count in a 1 ms sample is ±1000 counts/s (the page's exercise) */
  noise: 1 / 0.001,
  cpr: SPEED_DEMO.cpr,
  rpmPerCount: round(rpmFrom(1, SPEED_DEMO.cpr, 0.001), 1),
  low: Math.min(...speedOneMs.map((w) => w.rpm)),
  high: Math.max(...speedOneMs.map((w) => w.rpm)),
  true: SPEED_DEMO.rpm,
} as const;
