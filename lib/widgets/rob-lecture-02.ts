/*
 * Robotics · Lecture 2 (the industrial robotic arm): the numbers and the geometry its
 * walkthrough scenes draw. Pure, so the page's `expect` can check the facts against the
 * worked values in the text, and the scenes draw exactly what was checked.
 */

export type Pt = readonly [number, number];

/* ---------- Resolution (slide 8; book §2.2.3, pp. 46–47) ---------- */

/** An n-bit encoder tells apart 2ⁿ positions. */
export const states = (bits: number) => 2 ** bits;

/** Resolution = total distance travelled ÷ 2ⁿ. */
export const resolution = (distance: number, bits: number) => distance / states(bits);

/** A value rounded to `dp` decimals, without trailing zeros ("0.244", "3.9"), as the page prints it. */
export const fixed = (v: number, dp: number) => String(Number(v.toFixed(dp)));

/** The page's worked example: a 1,000 mm prismatic axis. */
export const AXIS_MM = 1000;

/** The three encoders compared: 8 bits (the quiz), 12 and 16 bits (the worked example). */
export const ENCODERS = [
  { id: "b8", bits: 8, dp: 1 },
  { id: "b12", bits: 12, dp: 3 },
  { id: "b16", bits: 16, dp: 3 },
] as const;

export type EncoderId = (typeof ENCODERS)[number]["id"];

export const encoder = (id: string) => {
  const e = ENCODERS.find((x) => x.id === id) ?? ENCODERS[1];
  const step = resolution(AXIS_MM, e.bits);
  return { ...e, states: states(e.bits), step, label: fixed(step, e.dp) };
};

/**
 * What the controller senses over the first `window` mm of true travel: a staircase that
 * only rises in steps of one resolution. Returns [true mm, sensed mm] corner points.
 */
export function staircase(step: number, window = 1): [number, number][] {
  const pts: [number, number][] = [[0, 0]];
  for (let k = 1; k * step <= window + 1e-9; k++) {
    pts.push([k * step, (k - 1) * step], [k * step, k * step]);
  }
  const last = pts[pts.length - 1][1];
  pts.push([window, last]);
  return pts;
}

/** Book p. 45: a machine quoted at ±0.05 mm repeatability may be accurate only to ±1 mm. */
export const DATASHEET = { repeatability: 0.05, accuracy: 1 } as const;

/* ---------- Linear against rotary resolution (book Example 2.2, §3.4.3) ---------- */

/** Both axes get the same 12-bit encoder; the revolute joint turns through 300°. */
export const REVOLUTE = { sweep: 300, bits: 12, near: 500, far: 1200 } as const;

const revStepDeg = REVOLUTE.sweep / states(REVOLUTE.bits);
const revStepRad = (revStepDeg * Math.PI) / 180;

/** Arc length s = rθ at the tool, in mm, for a reach r in mm. */
export const arcAt = (reachMm: number) => reachMm * revStepRad;

export const linearVsRotary = {
  linear: fixed(resolution(AXIS_MM, REVOLUTE.bits), 3),
  angle: fixed(revStepDeg, 3),
  near: fixed(arcAt(REVOLUTE.near), 2),
  far: fixed(arcAt(REVOLUTE.far), 2),
};

/* ---------- Accuracy and repeatability: where ten landings fall ---------- */

/** A small deterministic generator, so the darts land in the same places every render. */
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

export type Landing = { id: string; centre: Pt; spread: number; seed: number };

/** Four robots, in mm about the target: the mean offset is accuracy, the spread repeatability. */
export const LANDINGS: readonly Landing[] = [
  { id: "tight-off", centre: [1.7, -1.1], spread: 0.32, seed: 11 },
  { id: "wide-on", centre: [0, 0], spread: 1.55, seed: 5 },
  { id: "tight-on", centre: [0, 0], spread: 0.32, seed: 11 },
  { id: "wide-off", centre: [1.5, -1.0], spread: 1.55, seed: 5 },
];

/** Ten landings of one robot (mm, y up), spread uniformly over a disc. */
export function landings(id: string, n = 10): Pt[] {
  const l = LANDINGS.find((x) => x.id === id) ?? LANDINGS[0];
  const next = lcg(l.seed);
  return Array.from({ length: n }, () => {
    const a = next() * 2 * Math.PI;
    const r = l.spread * Math.sqrt(0.15 + 0.85 * next());
    return [Math.round((l.centre[0] + r * Math.cos(a)) * 1e4) / 1e4, Math.round((l.centre[1] + r * Math.sin(a)) * 1e4) / 1e4] as Pt;
  });
}

export const meanOf = (pts: readonly Pt[]): Pt => [pts.reduce((s, p) => s + p[0], 0) / pts.length, pts.reduce((s, p) => s + p[1], 0) / pts.length];

/** The radius of the smallest circle about the mean that holds every landing. */
export const spreadOf = (pts: readonly Pt[]) => {
  const m = meanOf(pts);
  return Math.max(...pts.map((p) => Math.hypot(p[0] - m[0], p[1] - m[1])));
};

/* ---------- Degrees of freedom (slides 19–23; book ch. 3) ---------- */

export type JointType = "R" | "P" | "U";

/** DOF a joint contributes: one for revolute and prismatic, two for a universal joint. */
export const dofOfJoint = (j: JointType) => (j === "U" ? 2 : 1);

/** DOF of a serial chain whose joints all move independently. */
export const dofOf = (joints: readonly JointType[]) => joints.reduce((s, j) => s + dofOfJoint(j), 0);

/** A block on a rail: slide only, or slide and turn about the rail. */
export const RAIL = { slide: ["P"] as const, slideTurn: ["P", "R"] as const };

/** A free body: three translations and three rotations. */
export const FREE_BODY = [
  { kind: "t", axis: "x" },
  { kind: "t", axis: "y" },
  { kind: "t", axis: "z" },
  { kind: "r", axis: "x" },
  { kind: "r", axis: "y" },
  { kind: "r", axis: "z" },
] as const;

/** The standard six-axis arm: waist, shoulder, elbow (position), then roll, pitch, yaw (orientation). */
export const SIX_AXIS = ["R", "R", "R", "R", "R", "R"] as const;

/** The page's SCARA exercise: two revolute joints, a vertical slide and a wrist roll. */
export const SCARA_WRIST = ["R", "R", "P", "R"] as const;

/** Two joints geared so the second angle is always twice the first (book Example 3.1e). */
export const GEARED = { joints: 2, independent: 1, ratio: 2 } as const;

/* ---------- Planar arm geometry (frames, coupling, workspace) ---------- */

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** A point `len` along a direction of `angle` degrees (counter-clockwise, y up) from `p`. */
export const along = (p: Pt, len: number, angle: number): Pt => [round4(p[0] + len * Math.cos(rad(angle))), round4(p[1] + len * Math.sin(rad(angle)))];

/** Four decimals: enough for drawing, and the same on the server and in the browser. */
const round4 = (v: number) => Math.round(v * 10000) / 10000;

/**
 * Forward kinematics of a planar serial arm (y up): the base, then every joint and the tip.
 * `angles` are relative joint angles in degrees.
 */
export function chain(base: Pt, lengths: readonly number[], angles: readonly number[]): Pt[] {
  const pts: Pt[] = [base];
  let a = 0;
  lengths.forEach((l, i) => {
    a += angles[i] ?? 0;
    pts.push(along(pts[i], l, a));
  });
  return pts;
}

/** Inverse kinematics of a two-link arm (elbow up), for a target relative to the shoulder. */
export function ik2(l1: number, l2: number, target: Pt): [number, number] {
  const [x, y] = target;
  const c2 = Math.max(-1, Math.min(1, (x * x + y * y - l1 * l1 - l2 * l2) / (2 * l1 * l2)));
  const s2 = -Math.sqrt(1 - c2 * c2);
  const t2 = Math.atan2(s2, c2);
  const t1 = Math.atan2(y, x) - Math.atan2(l2 * s2, l1 + l2 * c2);
  return [deg(t1), deg(t2)];
}

/** Three-joint planar arm: the wrist angle keeps the tool pointing along `phi` degrees. */
export function ik3(l: readonly [number, number, number], tip: Pt, phi: number): [number, number, number] {
  const wrist = along(tip, -l[2], phi);
  const [t1, t2] = ik2(l[0], l[1], wrist);
  return [t1, t2, phi - t1 - t2];
}

/** The arm the frames walkthrough jogs: shoulder to elbow, elbow to wrist, wrist to tool tip (scene units). */
export const ARM = { lengths: [90, 75, 34] as const, start: { tip: [70, 0] as Pt, phi: -90 } } as const;

const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Joint angles sampled along a straight tool path with fixed orientation, `n` + 1 frames. */
function straightPath(from: Pt, to: Pt, phi: number, n = 12): [number, number, number][] {
  return Array.from({ length: n + 1 }, (_, i) => ik3(ARM.lengths, lerp(from, to, i / n), phi));
}

export type JogMode = "world" | "joint" | "tool";

/** The tool frame's jog starts from a tilted tool and advances along its own axis. */
const TOOL_START = { tip: [100, 8] as Pt, phi: -45, advance: 40 };

/** Joint-angle frames for one press of "+" in each frame (world +x, joint J2 +, tool +z′). */
export function jog(mode: JogMode): [number, number, number][] {
  if (mode === "world") return straightPath(ARM.start.tip, [ARM.start.tip[0] + 60, ARM.start.tip[1]], ARM.start.phi);
  if (mode === "tool") return straightPath(TOOL_START.tip, along(TOOL_START.tip, TOOL_START.advance, TOOL_START.phi), TOOL_START.phi);
  const a = ik3(ARM.lengths, ARM.start.tip, ARM.start.phi);
  return Array.from({ length: 13 }, (_, i) => [a[0], a[1] + (35 * i) / 12, a[2]]);
}

/** How much each joint turns during a jog, rounded to whole degrees. */
export const jogDeltas = (mode: JogMode) => {
  const f = jog(mode);
  return f[0].map((a, i) => Math.round(f[f.length - 1][i] - a));
};

/** The number of joints that move during a jog. */
export const movingJoints = (mode: JogMode) => jogDeltas(mode).filter((d) => d !== 0).length;

/** The tool centre point experiment (book Lab 4): the TCP set 40 mm short of the real tip. */
export const TCP = { shortBy: 40 } as const;

/* ---------- Workspace of a planar two-link arm seen from above (book §4.2) ---------- */

/**
 * The two revolute links of the book's Laboratory 3 arm (about 150 mm and 100 mm, p. 73).
 * The scene sweeps the elbow all the way round (±180°), so the reach runs from the
 * difference of the link lengths to their sum, the comparison the lab asks for.
 */
export const PLANAR = { l1: 150, l2: 100, elbow: 180 } as const;

/** The farthest and nearest reach of the planar arm, in mm: the sum and the difference of the links. */
export const reach = {
  outer: PLANAR.l1 + PLANAR.l2,
  inner: Math.abs(PLANAR.l1 - PLANAR.l2),
};

/* ---------- Configurations (slides 40–49; book §4.3) ---------- */

export const CONFIGS = [
  { id: "cartesian", code: "PPP", joints: ["P", "P", "P"] },
  { id: "cylindrical", code: "RPP", joints: ["R", "P", "P"] },
  { id: "spherical", code: "RRP", joints: ["R", "R", "P"] },
  { id: "articulated", code: "RRR", joints: ["R", "R", "R"] },
  { id: "scara", code: "RRP", joints: ["R", "R", "P"] },
] as const satisfies readonly { id: string; code: string; joints: readonly JointType[] }[];

export type ConfigId = (typeof CONFIGS)[number]["id"];

export const configOf = (id: string) => CONFIGS.find((c) => c.id === id) ?? CONFIGS[0];

/** The code is the joint types read from the base, so it can be checked against the joints. */
export const codeOf = (joints: readonly JointType[]) => joints.join("");
