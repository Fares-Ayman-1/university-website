/**
 * The worked numbers of robotics lecture 3 (sensors I): Ohm's law and the voltage divider
 * (the page's LDR exercise and the book's Example 5.1), the potentiometer's wiper voltage
 * and its 10-bit reading, the sensing ranges the page quotes, the light-on / dark-on logic of
 * photoelectric switches and the GuideCane's choice of direction. Pure and client-safe; the
 * walkthrough facts computed here are checked by the page's `expect`.
 */

export const round2 = (x: number) => Math.round(x * 100) / 100;

/** A number as the page prints it: up to 2 decimals, no trailing zeros. */
export const show = (x: number, places = 2) => {
  const f = 10 ** places;
  return String(Math.round(x * f) / f);
};

/* ---------- Ohm's law and the voltage divider ---------- */

/** Ohm's law, V = I·R. Units must match: V, mA and kΩ work together. */
export const ohmV = (i: number, r: number) => i * r;
export const ohmI = (v: number, r: number) => v / r;

/** Vin across R1 and R2 in series; the output is taken across R2. */
export const divider = (vin: number, r1: number, r2: number) => (vin * r2) / (r1 + r2);

/** The page's exercise: 5 V, a fixed 10 kΩ (R1) and the LDR (R2). Resistances in kΩ. */
export const SUPPLY = 5;
export const R_FIXED = 10;
export const LDR_K = { bright: 1, dim: 10, dark: 100 } as const;
export type Light = keyof typeof LDR_K;
export const LIGHTS: readonly Light[] = ["bright", "dim", "dark"];

/** The output across the LDR (the page's exercise) or across the fixed resistor (the book's Example 5.1). */
export type Across = "ldr" | "fixed";
export const ldrOut = (light: Light, across: Across = "ldr") =>
  across === "ldr" ? divider(SUPPLY, R_FIXED, LDR_K[light]) : divider(SUPPLY, LDR_K[light], R_FIXED);

/** The series current in mA (5 V over kΩ). */
export const ldrCurrent = (light: Light) => ohmI(SUPPLY, R_FIXED + LDR_K[light]);

/** Book Example 5.1 (p. 98): 2 kΩ bright, 200 kΩ dark, read across the fixed 10 kΩ. */
export const BOOK_LDR_K = { bright: 2, dark: 200 } as const;
export const bookLdrOut = (light: "bright" | "dark") => divider(SUPPLY, BOOK_LDR_K[light], R_FIXED);

/** A 10-bit converter as on an Arduino: analogRead gives 0–1023 for 0–5 V. */
export const ADC_MAX = 1023;
export const adc = (v: number, vref = SUPPLY) => Math.max(0, Math.min(ADC_MAX, Math.floor((v / vref) * (ADC_MAX + 1))));

/* ---------- Switch levels ---------- */

/** Slide 5: a switch read by a 5 V controller. Slide 8: an industrial 24 V DC input. */
export const SWITCH_V = { open: 0, closed: 5, industrial: 24 } as const;

/* ---------- Potentiometer ---------- */

/** The page's sketch reads a 270° pot. */
export const THETA_MAX = 270;
export const potV = (theta: number) => (SUPPLY * theta) / THETA_MAX;
/** The page's sketch: angle = analogRead × 270 / 1023. */
export const angleOf = (count: number) => (count * THETA_MAX) / ADC_MAX;
/** Degrees per count, the resolution the converter allows. */
export const POT_STEP = THETA_MAX / ADC_MAX;
export const POT_ANGLES = [0, 90, 180, 270] as const;

/* ---------- Sensing ranges (mm) ---------- */

export const RANGE_MM = {
  inductive: [2, 15],
  capacitive: [4, 60],
  /** Slide 15's figure for proximity switches in general (see the page's callout) */
  slide15: [0.5, 20],
  /** Slide 37: "from less than 10 cm up to 1500 cm" */
  photoelectric: [100, 15000],
} as const;
export const rangeText = (r: readonly [number, number]) => `${r[0]}–${r[1]}`;

/** Position of a length (mm) on a log axis from `lo` to `hi` mm, `w` pixels wide. */
export const logX = (mm: number, x0: number, w: number, lo = 1, hi = 20000) => round2(x0 + ((Math.log10(mm) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * w);

/* ---------- Capacitance: the smaller the gap, the higher C (slides 17–18, book p. 102). The drawing just scales C with 1/gap. ---------- */

export const capacitance = (epsA: number, d: number) => epsA / d;

/* ---------- Photoelectric switches ---------- */

export type PhotoType = "through" | "retro" | "diffuse";
export const PHOTO_TYPES: readonly PhotoType[] = ["through", "retro", "diffuse"];
export type Operation = "light" | "dark";

/** Does light reach the receiver? An object breaks a through or retro beam, and returns a diffuse one. */
export const receiverLit = (type: PhotoType, object: boolean) => (type === "diffuse" ? object : !object);
/** Light-on energises the output when the receiver is lit; dark-on when it is not. */
export const outputOn = (op: Operation, lit: boolean) => (op === "light" ? lit : !lit);

/* ---------- GuideCane: a fan of sonars ---------- */

/** Beam directions in degrees, negative to the left. */
export const SONAR_DEG = [-60, -30, 0, 30, 60] as const;
/** An echo closer than this (m) counts as blocked. */
export const CLEAR_M = 1.5;
export const MAX_M = 3;
export type Scenario = "clear" | "left" | "right";
export const SONAR_READINGS: Record<Scenario, readonly number[]> = {
  clear: [3, 3, 3, 3, 3],
  left: [3, 0.9, 1.2, 3, 3],
  right: [3, 3, 1.2, 0.9, 3],
};

/** Keep the user's direction (0°) if it is clear, else the clear beam nearest to it (right first on a tie). */
export function steer(readings: readonly number[], wanted = 0): number {
  const clear = SONAR_DEG.filter((_, i) => readings[i] >= CLEAR_M);
  if (clear.length === 0) return wanted;
  return [...clear].sort((a, b) => Math.abs(a - wanted) - Math.abs(b - wanted) || b - a)[0];
}
