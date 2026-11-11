"use client";

import { useContext, useEffect, useState } from "react";
import { Chip, In, StageContext, Text, type L, type LineTone, type Pt, type Tone } from "../../../primitives";
import w from "../../../../Walkthrough.module.css";

/*
 * Drawing pieces for Robotics · Lecture 2 that the shared primitives don't have: rigid links,
 * revolute pins, a pedestal and floor, a gripper, coordinate axes, and a motion clock that
 * drives joints (rotations, slides) from React state.
 *
 * Angles are in degrees, counter-clockwise with y up (the maths convention); `dir` turns
 * them into screen points, where y grows downwards.
 */

/** The point `len` from `p` in the direction `angle` (degrees, counter-clockwise, screen y down). */
export const dir = (p: Pt, len: number, angle: number): Pt => [r3(p[0] + len * Math.cos((angle * Math.PI) / 180)), r3(p[1] - len * Math.sin((angle * Math.PI) / 180))];

/** Rounded to 3 decimals, so server and browser trigonometry render the same attributes. */
export const r3 = (v: number) => Math.round(v * 1000) / 1000;

/** A point in the maths frame of `origin` (y up) as a screen point. */
export const screen = (origin: Pt, p: Pt): Pt => [r3(origin[0] + p[0]), r3(origin[1] - p[1])];

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * Eased progress, 0 → 1, of a motion that starts `d` ms after the panel appears and lasts
 * `dur` ms. Like the entrances, it waits until the stage is on screen; with reduced motion
 * it is 1 at once, so the scene shows its final state.
 */
export function useMotion(d: number, dur: number, ease = true): number {
  const { live, reduced } = useContext(StageContext);
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduced || !live) return;
    let raf = 0;
    let start: number | undefined;
    const tick = (now: number) => {
      start ??= now;
      const p = Math.min(1, Math.max(0, (now - start - d) / dur));
      setT(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [live, reduced, d, dur]);
  const p = reduced ? 1 : t;
  return ease ? easeInOut(p) : p;
}

/** The value at progress `p` of evenly spaced keyframes, linearly between them. */
export function track(frames: readonly number[], p: number): number {
  if (frames.length === 1) return frames[0];
  const x = Math.min(Math.max(p, 0), 1) * (frames.length - 1);
  const i = Math.min(Math.floor(x), frames.length - 2);
  return frames[i] + (frames[i + 1] - frames[i]) * (x - i);
}

/** Keyframes of several values at once (joint angles, a point), at progress `p`. */
export function trackAll<T extends readonly number[]>(frames: readonly T[], p: number): number[] {
  return frames[0].map((_, k) => track(frames.map((f) => f[k]), p));
}

/** Progress of a sub-stage that runs from `a` to `b` of an overall progress `p`. */
export const stage = (p: number, a: number, b: number) => Math.min(Math.max((p - a) / (b - a), 0), 1);

/** A rigid link: a rounded bar from `a` to `b`, `t` thick, on an opaque base. */
export function Bar({ a, b, t = 14, tone = "slate", d }: { a: Pt; b: Pt; t?: number; tone?: Tone; d?: number }) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const ux = (b[0] - a[0]) / len;
  const uy = (b[1] - a[1]) / len;
  const h = t / 2;
  const nx = -uy * h;
  const ny = ux * h;
  const f = (v: number) => v.toFixed(1);
  const path = `M${f(a[0] + nx)},${f(a[1] + ny)} L${f(b[0] + nx)},${f(b[1] + ny)} A${h},${h} 0 0 0 ${f(b[0] - nx)},${f(b[1] - ny)} L${f(a[0] - nx)},${f(a[1] - ny)} A${h},${h} 0 0 0 ${f(a[0] + nx)},${f(a[1] + ny)} Z`;
  const g = (
    <>
      <path d={path} className={w.under} />
      <path d={path} className={`${w.shape} ${w[tone]}`} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A revolute joint seen along its axis: a pin with a dot. */
export function Pin({ at, r = 7, tone = "outline", d }: { at: Pt; r?: number; tone?: Tone; d?: number }) {
  const g = (
    <>
      <circle cx={at[0]} cy={at[1]} r={r} className={w.under} />
      <circle cx={at[0]} cy={at[1]} r={r} className={`${w.shape} ${w[tone]}`} />
      <circle cx={at[0]} cy={at[1]} r={Math.max(1.8, r * 0.28)} style={{ fill: "var(--heading)" }} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A filled polygon on an opaque base. */
export function Poly({ pts, tone = "outline", dashed, d, opacity }: { pts: readonly Pt[]; tone?: Tone; dashed?: boolean; d?: number; opacity?: number }) {
  const points = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const g = (
    <>
      {opacity === undefined ? <polygon points={points} className={w.under} /> : null}
      <polygon points={points} className={`${w.shape} ${w[tone]} ${dashed ? w.dashed : ""}`} style={opacity === undefined ? undefined : { fillOpacity: opacity }} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A plain path in a shape tone (fill + stroke), for outlines that aren't polygons. */
export function Shape({ path, tone = "outline", dashed, opacity, d }: { path: string; tone?: Tone; dashed?: boolean; opacity?: number; d?: number }) {
  const g = <path d={path} className={`${w.shape} ${w[tone]} ${dashed ? w.dashed : ""}`} style={opacity === undefined ? undefined : { fillOpacity: opacity }} />;
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A stroke-only line through `pts`, drawn at once (no draw-in), for things that move. */
export function Line({ pts, tone = "muted", width, dashed }: { pts: readonly Pt[]; tone?: LineTone; width?: number; dashed?: boolean }) {
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return <path d={path} className={`${w.line} ${w[tone]} ${dashed ? w.dashed : ""}`} style={width ? { strokeWidth: width } : undefined} />;
}

/** A small dot (a landing, a reachable point). */
export function Dot({ at, r = 3.2, tone = "navy" }: { at: Pt; r?: number; tone?: "navy" | "gold" | "danger" | "success" | "muted" }) {
  const fill = { navy: "var(--heading)", gold: "var(--gold)", danger: "var(--danger)", success: "var(--success)", muted: "var(--border-strong)" }[tone];
  return <circle cx={r3(at[0])} cy={r3(at[1])} r={r} style={{ fill }} />;
}

/** The floor: a line with hatching under it, from x to x + w. */
export function Floor({ x, y, w: fw, d }: { x: number; y: number; w: number; d?: number }) {
  const ticks = Array.from({ length: Math.floor(fw / 14) }, (_, i) => x + 7 + i * 14);
  const g = (
    <>
      <path d={`M${x},${y} H${x + fw}`} className={`${w.line} ${w.faint}`} />
      {ticks.map((tx) => (
        <path key={tx} d={`M${tx},${y + 1} l-6,7`} className={`${w.line} ${w.faint}`} style={{ strokeWidth: 1.2 }} />
      ))}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A robot pedestal standing on the floor at `floor`, centred on x, up to `top`. */
export function Pedestal({ x, top, floor, wTop = 34, wBottom = 64, tone = "slate", d }: { x: number; top: number; floor: number; wTop?: number; wBottom?: number; tone?: Tone; d?: number }) {
  return (
    <Poly
      pts={[
        [x - wBottom / 2, floor],
        [x - wTop / 2, top],
        [x + wTop / 2, top],
        [x + wBottom / 2, floor],
      ]}
      tone={tone}
      d={d}
    />
  );
}

/**
 * A two-finger gripper on the end of a link: the palm sits at `at`, the fingers point along
 * `angle`. `open` runs from 0 (closed on a part `grip` wide) to 1 (wide open).
 */
export function Claw({ at, angle, open = 1, size = 1, grip = 12, tone = "navy" }: { at: Pt; angle: number; open?: number; size?: number; grip?: number; tone?: Tone }) {
  const half = (grip / 2 + open * 7) * size;
  const palmHalf = half + 3 * size;
  const side = (s: number) => dir(at, s, angle + 90);
  const p1 = side(palmHalf);
  const p2 = side(-palmHalf);
  const f1 = side(half);
  const f2 = side(-half);
  const len = 16 * size;
  return (
    <>
      <Bar a={p1} b={p2} t={5 * size} tone={tone} />
      <Bar a={f1} b={dir(f1, len, angle)} t={4.5 * size} tone={tone} />
      <Bar a={f2} b={dir(f2, len, angle)} t={4.5 * size} tone={tone} />
    </>
  );
}

/** Where a claw's fingertips meet: the tool centre point of a gripper. */
export const clawTip = (at: Pt, angle: number, size = 1): Pt => dir(at, 16 * size, angle);

/**
 * Coordinate axes at `at`: x along `angle`, the second axis 90° counter-clockwise from it.
 * `out` draws a third axis coming out of the page (a dot in a ring) with that label.
 */
export function Axes({
  at,
  angle = 0,
  len = 40,
  labels = ["x", "y"],
  out,
  tone = "navy",
  d = 0,
  size = 11.5,
}: {
  at: Pt;
  angle?: number;
  len?: number;
  labels?: readonly [string, string];
  out?: string;
  tone?: LineTone;
  d?: number;
  size?: number;
}) {
  const ex = dir(at, len, angle);
  const ey = dir(at, len, angle + 90);
  const lx = dir(at, len + 11, angle);
  const ly = dir(at, len + 11, angle + 90);
  const ink = tone === "gold" ? "gold" : tone === "danger" ? "danger" : tone === "success" ? "success" : "heading";
  return (
    <>
      <Arrow2 a={at} b={ex} tone={tone} d={d} />
      <Arrow2 a={at} b={ey} tone={tone} d={d} />
      <Text x={lx[0]} y={lx[1]} text={labels[0]} size={size} mono tone={ink} d={d + 300} />
      <Text x={ly[0]} y={ly[1]} text={labels[1]} size={size} mono tone={ink} d={d + 300} />
      {out ? (
        <In d={d + 200}>
          <circle cx={at[0]} cy={at[1]} r={5} className={w.under} />
          <circle cx={at[0]} cy={at[1]} r={5} className={`${w.line} ${w[tone]}`} />
          <circle cx={at[0]} cy={at[1]} r={1.8} style={{ fill: `var(--${ink === "heading" ? "heading" : ink})` }} />
          <Text x={at[0] - 11} y={at[1] + 11} text={out} size={size} mono tone={ink} anchor="end" />
        </In>
      ) : null}
    </>
  );
}

/** A straight arrow drawn at once (for axes that move with a part); fades in at `d`. */
export function Arrow2({ a, b, tone = "navy", d, width }: { a: Pt; b: Pt; tone?: LineTone; d?: number; width?: number }) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const l = 8;
  const s = 0.45;
  const p1 = [b[0] - l * Math.cos(ang - s), b[1] - l * Math.sin(ang - s)];
  const p2 = [b[0] - l * Math.cos(ang + s), b[1] - l * Math.sin(ang + s)];
  const g = (
    <>
      <path d={`M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}`} className={`${w.line} ${w[tone]}`} style={width ? { strokeWidth: width } : undefined} />
      <polygon points={`${b[0].toFixed(1)},${b[1].toFixed(1)} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`} className={`${w.head} ${w[tone]}`} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** Points along a circular arc around `c` (degrees, counter-clockwise, screen y down). */
export function arcPts(c: Pt, r: number, from: number, to: number, n = 16): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => dir(c, r, from + ((to - from) * i) / n));
}

/** Points along an ellipse arc (for a rotation seen at an angle). */
export function ellipsePts(c: Pt, rx: number, ry: number, from: number, to: number, n = 18): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
    return [r3(c[0] + rx * Math.cos(a)), r3(c[1] - ry * Math.sin(a))] as Pt;
  });
}

/** A numbered marker that lights up on a joint as it is counted. */
export function Count({ at, n, tone = "gold", d, r = 10 }: { at: Pt; n: number | string; tone?: Tone; d?: number; r?: number }) {
  const g = (
    <>
      <circle cx={at[0]} cy={at[1]} r={r} className={w.under} />
      <circle cx={at[0]} cy={at[1]} r={r} className={`${w.shape} ${w[tone]}`} />
      <text x={at[0]} y={at[1]} textAnchor="middle" dominantBaseline="central" fontSize={r * 1.1} fontWeight={700} className={`${w.bt} ${w[tone]} ${w.mono}`}>
        {n}
      </text>
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/**
 * A label chip centred on `at` with a thin leader line to the part at `to`. The chip is
 * opaque and drawn after the line, so the line seems to start at its edge.
 */
export function Tag({ at, to, text, tone = "slate", d = 0, w: cw, size = 11 }: { at: Pt; to: Pt; text: L; tone?: Tone; d?: number; w?: number; size?: number }) {
  return (
    <>
      <In d={d}>
        <path d={`M${at[0]},${at[1]} L${to[0]},${to[1]}`} className={`${w.line} ${w.faint}`} style={{ strokeWidth: 1.3 }} />
        <circle cx={to[0]} cy={to[1]} r={2.4} style={{ fill: "var(--border-strong)" }} />
      </In>
      <Chip x={at[0]} y={at[1]} text={text} tone={tone} d={d} w={cw} size={size} center />
    </>
  );
}

/**
 * A serial arm through screen points: one bar per link, thinner towards the tip, and a pin
 * on every joint. The last point is the tip, which has no joint.
 */
export function Chain({ pts, t = [16, 13, 9], tone = "slate", pinTone = "outline", pinR = 7 }: { pts: readonly Pt[]; t?: readonly number[]; tone?: Tone; pinTone?: Tone; pinR?: number }) {
  return (
    <>
      {pts.slice(1).map((p, i) => (
        <Bar key={`l${i}`} a={pts[i]} b={p} t={t[Math.min(i, t.length - 1)]} tone={tone} />
      ))}
      {pts.slice(0, -1).map((p, i) => (
        <Pin key={`j${i}`} at={p} r={Math.max(4, pinR - i)} tone={pinTone} />
      ))}
    </>
  );
}
