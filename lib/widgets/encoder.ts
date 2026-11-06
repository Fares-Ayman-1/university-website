/**
 * Rotary encoders, as in robotics lecture 4 (Sensors II): the ×4 quadrature decoder of the
 * page's quadrature_decoder.py, ×1 / ×2 / ×4 counting, and absolute discs in plain binary or
 * Gray code, including what slightly skewed detectors read while a code changes.
 *
 * Pure and client-safe. EncoderSim.tsx also runs it at build time against the page's own
 * numbers (`expect`). No "@/" imports, so it can be tested with node --experimental-strip-types.
 *
 * Angles are in degrees, SVG convention (0° = +x, increasing clockwise on screen). The disc
 * angle θ grows when the disc turns forward, which is clockwise as drawn.
 */

const mod = (x: number, m: number) => ((x % m) + m) % m;

/** The widget's two tabs */
export type EncoderMode = "incremental" | "absolute";

/** Slots drawn on the incremental disc (few enough to see); the angle uses `ppr` when given. */
export const DRAWN_SLOTS = 12;

// ============================================================ quadrature (incremental)

/** A quadrature state as in the page: (A << 1) | B, so 0b01 means A = 0, B = 1. */
export type AB = 0 | 1 | 2 | 3;
export type Step = -1 | 0 | 1;
export type Direction = 1 | -1;

/** quadrature_decoder.py's STEP table, entry for entry: (previous AB, current AB) → step. */
export const STEP: ReadonlyArray<readonly [prev: AB, cur: AB, step: Direction]> = [
  [0b00, 0b01, 1], [0b01, 0b11, 1], [0b11, 0b10, 1], [0b10, 0b00, 1],
  [0b00, 0b10, -1], [0b10, 0b11, -1], [0b11, 0b01, -1], [0b01, 0b00, -1],
];

/** STEP.get((prev, cur), 0): 0 = no change (or an invalid jump). */
export function stepOf(prev: AB, cur: AB): Step {
  for (const [p, c, s] of STEP) if (p === prev && c === cur) return s;
  return 0;
}

export const toAB = (a: number, b: number): AB => ((((a & 1) << 1) | (b & 1)) as AB);
export const abString = (ab: AB) => `${ab >> 1}${ab & 1}`;
export const channelA = (ab: AB) => (ab >> 1) as 0 | 1;
export const channelB = (ab: AB) => (ab & 1) as 0 | 1;

/** The loop of the page's decode(): the ×4 count of a list of (A, B) readings. */
export function countSamples(samples: ReadonlyArray<readonly [number, number]>): number {
  let count = 0;
  let prev = toAB(samples[0][0], samples[0][1]);
  for (const [a, b] of samples.slice(1)) {
    const cur = toAB(a, b);
    count += stepOf(prev, cur);
    prev = cur;
  }
  return count;
}

/** The page's decode(samples, slots_per_rev=500): the angle in degrees. */
export function decode(samples: ReadonlyArray<readonly [number, number]>, slotsPerRev = 500): number {
  return (countSamples(samples) * 360) / (4 * slotsPerRev);
}

/** Angle of a ×4 count, as decode() computes it. */
export const countToDegrees = (x4: number, slotsPerRev: number) => (x4 * 360) / (4 * slotsPerRev);

export type Counts = { x1: number; x2: number; x4: number };
export const ZERO_COUNTS: Counts = { x1: 0, x2: 0, x4: 0 };

/**
 * Which counting modes (the page's table) count one transition:
 * - ×4: every edge of A and B, i.e. every valid STEP.
 * - ×2: rising and falling edges of channel A only.
 * - ×1: one edge of A per slot: A rising when turning forward (01 → 11). Turning backward,
 *   that same slot edge passes the other way, as A falling (11 → 01), and is taken back, so
 *   the ×1 count stays tied to the position instead of drifting when the disc jitters.
 */
export function countedBy(prev: AB, cur: AB): { x1: boolean; x2: boolean; x4: boolean } {
  const step = stepOf(prev, cur);
  if (step === 0) return { x1: false, x2: false, x4: false };
  const aEdge = ((prev ^ cur) & 0b10) !== 0;
  return { x4: true, x2: aEdge, x1: aEdge && channelA(step > 0 ? cur : prev) === 1 };
}

export function countTransition(counts: Counts, prev: AB, cur: AB): Counts {
  const step = stepOf(prev, cur);
  if (step === 0) return counts;
  const by = countedBy(prev, cur);
  return {
    x1: counts.x1 + (by.x1 ? step : 0),
    x2: counts.x2 + (by.x2 ? step : 0),
    x4: counts.x4 + step,
  };
}

/** The +1 direction of STEP: 00 → 01 → 11 → 10 → 00. B changes first, so B leads A. */
export const FORWARD: readonly AB[] = [0b00, 0b01, 0b11, 0b10];

export const slotPeriod = (slots: number) => 360 / slots;

/** Quarter-period index p of disc angle θ: state FORWARD[p mod 4], 00 spanning [0, P/4). */
export const quarterIndex = (theta: number, slots: number) => Math.floor((theta * slots * 4) / 360);

/** The quadrature state at disc angle θ. */
export const abAt = (theta: number, slots: number): AB => FORWARD[mod(quarterIndex(theta, slots), 4)];

/** Disc angle at the middle of quarter-period p (where the step buttons stop). */
export const quarterCentre = (p: number, slots: number) => ((p + 0.5) * 360) / (4 * slots);

/**
 * Where the detectors sit on screen: a quarter of a slot period apart around `top`, A on the
 * clockwise side. Slot openings, in the disc's own frame, span (a + kP, a + kP + P/2].
 */
export function detectorAngles(slots: number, top = -90) {
  const quarter = slotPeriod(slots) / 4;
  return { a: top + quarter / 2, b: top - quarter / 2 };
}

/** Whether the detector at screen angle φ sees light through the disc turned by θ. */
export function lightAt(theta: number, slots: number, phi: number, top = -90): 0 | 1 {
  const P = slotPeriod(slots);
  return mod(theta - (phi - detectorAngles(slots, top).a), P) >= P / 2 ? 1 : 0;
}

/** What the drawn detectors A and B read (equals abAt; checked by the tests). */
export function detectorsRead(theta: number, slots: number, top = -90): AB {
  const { a, b } = detectorAngles(slots, top);
  return toAB(lightAt(theta, slots, a, top), lightAt(theta, slots, b, top));
}

export type Transition = { prev: AB; cur: AB; step: Step };

export type IncrementalState = {
  /** Disc angle in degrees (unbounded), + = forward */
  theta: number;
  counts: Counts;
  /** Recent states, oldest first, one per transition (the pulse-train plot) */
  history: AB[];
  last: Transition | null;
};

export function initialIncremental(slots: number, historyLength: number): IncrementalState {
  return {
    theta: quarterCentre(0, slots),
    counts: ZERO_COUNTS,
    history: Array.from({ length: historyLength }, () => FORWARD[0]),
    last: null,
  };
}

/**
 * Turn the disc to θ. Every quarter period crossed is fed to the decoder in order, as a
 * decoder sampling fast enough would see it, so no transition is skipped.
 */
export function turnTo(state: IncrementalState, theta: number, slots: number, historyLength: number): IncrementalState {
  const from = quarterIndex(state.theta, slots);
  const to = quarterIndex(theta, slots);
  if (from === to) return { ...state, theta };
  const dir = to > from ? 1 : -1;
  let { counts, last } = state;
  const history = [...state.history];
  for (let p = from; p !== to; p += dir) {
    const prev = FORWARD[mod(p, 4)];
    const cur = FORWARD[mod(p + dir, 4)];
    counts = countTransition(counts, prev, cur);
    history.push(cur);
    last = { prev, cur, step: stepOf(prev, cur) };
  }
  return { theta, counts, history: history.slice(-historyLength), last };
}

/** One quadrature state forward or backward, stopping in the middle of the new state. */
export function stepBy(state: IncrementalState, dir: Direction, slots: number, historyLength: number): IncrementalState {
  const p = quarterIndex(state.theta, slots);
  return turnTo(state, quarterCentre(p + dir, slots), slots, historyLength);
}

// ============================================================ absolute (binary / Gray)

export type Code = "binary" | "gray";

/** gray_code.py */
export const binaryToGray = (n: number) => n ^ (n >> 1);
export function grayToBinary(g: number): number {
  let n = 0;
  while (g) {
    n ^= g;
    g >>= 1;
  }
  return n;
}

export const encodeSector = (sector: number, code: Code) => (code === "gray" ? binaryToGray(sector) : sector);
export const decodeWord = (word: number, code: Code) => (code === "gray" ? grayToBinary(word) : word);
export const bitString = (word: number, bits: number) => word.toString(2).padStart(bits, "0");
export const popcount = (x: number) => x.toString(2).replace(/0/g, "").length;

/** 360° / 2^n, as in the page */
export const sectorAngle = (bits: number) => 360 / 2 ** bits;

/** True sector under the (unskewed) read line; sector s spans [s·S, (s+1)·S). */
export const sectorAt = (theta: number, bits: number) => mod(Math.floor(theta / sectorAngle(bits)), 2 ** bits);
export const sectorCentre = (index: number, bits: number) => (index + 0.5) * sectorAngle(bits);

/** Gap between neighbouring skewed detectors (deg): exaggerated so it can be seen. */
export const skewSpacing = (bits: number) => (0.5 * sectorAngle(bits)) / (bits - 1);

/**
 * Angular offset of each bit's detector (index = bit) when skewed: a slightly tilted row of
 * detectors, so turning forward the MSB detector meets a boundary first and the LSB last.
 * The largest offset is a quarter of a sector, so inside a sector all detectors still agree.
 */
export function skewOffsets(bits: number): number[] {
  const d = skewSpacing(bits);
  return Array.from({ length: bits }, (_, k) => ((bits - 1) / 2 - k) * d);
}

/**
 * The word the detectors read at disc angle θ: detector k reads track k (bit k) of the
 * sector under it, floor((θ − δk) / S).
 */
export function readWord(theta: number, code: Code, bits: number, skew: boolean): number {
  const S = sectorAngle(bits);
  const offsets = skew ? skewOffsets(bits) : null;
  let word = 0;
  for (let k = 0; k < bits; k++) {
    const sector = mod(Math.floor((theta - (offsets ? offsets[k] : 0)) / S), 2 ** bits);
    word |= ((encodeSector(sector, code) >> k) & 1) << k;
  }
  return word;
}

/**
 * Half-width of the band around a boundary that counts as "crossing" when detectors are
 * skewed: the detectors (± S/4) plus most of one gap, so every crossing stop is inside it
 * and every sector centre (S/2 away) outside.
 */
export const crossingZone = (bits: number) => sectorAngle(bits) / 4 + 0.75 * skewSpacing(bits);

/**
 * Where the step buttons stop while crossing boundary b (between sectors b − 1 and b) with
 * skewed detectors: just after the first detector whose binary bit changes has switched,
 * before the next detector does. Forward that is the highest changing bit, backward the lowest.
 */
export function crossingStop(boundary: number, dir: Direction, bits: number): number {
  const N = 2 ** bits;
  const changed = mod(boundary - 1, N) ^ mod(boundary, N);
  const bit = dir > 0 ? Math.floor(Math.log2(changed)) : Math.log2(changed & -changed);
  const d = skewSpacing(bits);
  return boundary * sectorAngle(bits) + skewOffsets(bits)[bit] + (dir > 0 ? d / 2 : -d / 2);
}

/** Next stop for the step buttons: sector centres, plus a stop inside each crossing when skewed. */
export function absoluteStep(theta: number, dir: Direction, bits: number, skew: boolean): number {
  const S = sectorAngle(bits);
  if (skew) {
    const boundary = Math.round(theta / S);
    if (Math.abs(theta - boundary * S) < crossingZone(bits)) {
      return sectorCentre(dir > 0 ? boundary : boundary - 1, bits);
    }
  }
  const index = Math.floor(theta / S);
  if (!skew) return sectorCentre(index + dir, bits);
  return crossingStop(dir > 0 ? index + 1 : index, dir, bits);
}

/** The boundary (unbounded index) whose crossing band θ is in, if detectors are skewed. */
export function crossingAt(theta: number, bits: number): number | null {
  const S = sectorAngle(bits);
  const boundary = Math.round(theta / S);
  return Math.abs(theta - boundary * S) < crossingZone(bits) ? boundary : null;
}

/** The sectors the detectors are over at θ: one without skew, at most two while crossing. */
export function sectorsUnder(theta: number, bits: number, skew: boolean): number[] {
  const S = sectorAngle(bits);
  const offsets = skew ? skewOffsets(bits) : [0];
  return [...new Set(offsets.map((d) => mod(Math.floor((theta - d) / S), 2 ** bits)))];
}

/** A reading is a misread when it names a sector no detector is over. */
export const isMisread = (theta: number, word: number, code: Code, bits: number, skew: boolean) =>
  !sectorsUnder(theta, bits, skew).includes(decodeWord(word, code));

/** Cyclic distance between two sectors */
export function sectorDistance(a: number, b: number, bits: number): number {
  const N = 2 ** bits;
  const d = mod(a - b, N);
  return Math.min(d, N - d);
}

/**
 * What skewed detectors momentarily read on the binary disc when the shaft crosses from
 * sector `from` to the neighbouring sector `to` (the page: 0111 → 1000 can read 1111), and
 * what the Gray disc reads at the same instant.
 */
export function skewCrossing(from: number, to: number, bits: number): { binary: number; gray: number } {
  const N = 2 ** bits;
  const dir: Direction | 0 = mod(to - from, N) === 1 ? 1 : mod(from - to, N) === 1 ? -1 : 0;
  if (dir === 0) throw new Error(`Sectors ${from} and ${to} are not neighbours on a ${bits}-bit disc.`);
  const boundary = dir > 0 ? from + 1 : from;
  const theta = crossingStop(boundary, dir, bits);
  return { binary: readWord(theta, "binary", bits, true), gray: readWord(theta, "gray", bits, true) };
}

// ============================================================ build-time check (`expect`)

const parseBits = (word: string, where: string) => {
  if (!/^[01]+$/.test(word)) throw new Error(`${where}: "${word}" is not a binary word.`);
  return parseInt(word, 2);
};

/**
 * `expect` is a list of clauses separated by ";", each one copied from the page:
 *
 *   decode 00 01 11 10 00 = 0.72 forward
 *     The AB samples (A then B, as `(a << 1) | b` in quadrature_decoder.py) given to the
 *     page's decode() with slots_per_rev = ppr return this angle (± 1e-9); the optional
 *     word (forward | backward | none) is the sign of the count.
 *   gray 0000 0001 0011 0010 0110 …
 *     binary_to_gray(0), binary_to_gray(1), … are exactly these `bits`-digit words.
 *   skew 0111 1000 = 1111
 *     Crossing between these neighbouring sectors (binary words) with skewed detectors, the
 *     binary disc momentarily reads this word, and the Gray disc reads one of the two sectors.
 *
 * Throws (failing the build) on any mismatch.
 */
export function assertEncoderExpect(expect: string, { ppr, bits }: { ppr: number; bits: number }, where: string) {
  for (const clause of expect.split(";").map((c) => c.trim()).filter(Boolean)) {
    const [kind, ...rest] = clause.split(/\s+/);
    const body = rest.join(" ");
    if (kind === "decode") {
      const m = /^((?:[01]{2}\s+)*[01]{2})\s*=\s*(-?[\d.]+)\s*°?\s*(forward|backward|none)?$/.exec(body);
      if (!m) throw new Error(`${where}: can't read expect clause "${clause}" (decode 00 01 … = degrees [forward|backward|none]).`);
      const samples = m[1].split(/\s+/).map((ab) => [Number(ab[0]), Number(ab[1])] as const);
      const angle = decode(samples, ppr);
      const count = countSamples(samples);
      if (Math.abs(angle - Number(m[2])) > 1e-9) {
        throw new Error(`${where}: decode(${m[1]}, slots_per_rev=${ppr}) = ${angle}°, but expect says ${m[2]}°.`);
      }
      const direction = count > 0 ? "forward" : count < 0 ? "backward" : "none";
      if (m[3] && m[3] !== direction) {
        throw new Error(`${where}: decode(${m[1]}) counts ${count} (${direction}), but expect says ${m[3]}.`);
      }
    } else if (kind === "gray") {
      rest.forEach((word, i) => {
        if (word.length !== bits) throw new Error(`${where}: Gray word "${word}" should have ${bits} digits (bits=${bits}).`);
        const gray = binaryToGray(i);
        if (parseBits(word, where) !== gray) {
          throw new Error(`${where}: binary_to_gray(${i}) = ${bitString(gray, bits)}, but expect says ${word}.`);
        }
      });
    } else if (kind === "skew") {
      const m = /^([01]+)\s+([01]+)\s*=\s*([01]+)$/.exec(body);
      if (!m) throw new Error(`${where}: can't read expect clause "${clause}" (skew <from> <to> = <word>).`);
      if ([m[1], m[2], m[3]].some((w) => w.length !== bits)) {
        throw new Error(`${where}: the words in "${clause}" should have ${bits} digits (bits=${bits}).`);
      }
      const from = parseBits(m[1], where);
      const to = parseBits(m[2], where);
      const read = skewCrossing(from, to, bits);
      if (read.binary !== parseBits(m[3], where)) {
        throw new Error(`${where}: crossing ${m[1]} → ${m[2]} with skewed detectors reads ${bitString(read.binary, bits)}, but expect says ${m[3]}.`);
      }
      const grayValue = grayToBinary(read.gray);
      if (grayValue !== from && grayValue !== to) {
        throw new Error(`${where}: the Gray disc misreads ${bitString(read.gray, bits)} while crossing ${m[1]} → ${m[2]}.`);
      }
    } else {
      throw new Error(`${where}: unknown expect clause "${clause}" (use decode, gray or skew).`);
    }
  }
}
