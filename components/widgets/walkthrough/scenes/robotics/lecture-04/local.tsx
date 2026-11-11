"use client";

import { useContext, useEffect, useId, useRef } from "react";
import { EASE_CSS } from "@/lib/motion";
import { Box, In, StageContext, Text, Fade, type L, type LineTone, type Pt, type Tone } from "../../../primitives";
import w from "../../../../Walkthrough.module.css";

/*
 * Drawing pieces for Robotics · Lecture 4 that the shared primitives don't have: motion
 * (Spin turns a disc, Travel carries a wavefront, Later hides a state until its moment),
 * plain strokes and dots, square waves, disc sectors, a hatched "unknown" region and a
 * table with bilingual headers.
 */

/** CSS colour of a line tone, for strokes and fills drawn by hand. */
export const INK: Record<LineTone, string> = {
  muted: "var(--muted)",
  gold: "var(--gold)",
  navy: "var(--heading)",
  slate: "var(--slate)",
  danger: "var(--danger)",
  success: "var(--success)",
  faint: "var(--border-strong)",
};

const useMotion = () => useContext(StageContext);

/**
 * Turns its children about (cx, cy) by `deg` degrees (clockwise on screen), starting `d` ms
 * after the panel appears and taking `dur` ms. With reduced motion it is simply at the end.
 */
export function Spin({ cx, cy, deg, d = 0, dur = 1600, linear, children }: { cx: number; cy: number; deg: number; d?: number; dur?: number; linear?: boolean; children: React.ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const { live, reduced } = useMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const end = `rotate(${deg}deg)`;
    if (reduced) {
      el.style.transform = end;
      return;
    }
    el.style.transform = "";
    if (!live) return;
    const anim = el.animate([{ transform: "rotate(0deg)" }, { transform: end }], { duration: dur, delay: d, easing: linear ? "linear" : EASE_CSS.inOutSmooth, fill: "both" });
    return () => anim.cancel();
  }, [deg, d, dur, linear, live, reduced]);

  return (
    <g ref={ref} style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: "view-box" }}>
      {children}
    </g>
  );
}

/**
 * Carries its children (drawn around 0,0) along `pts`, `d` ms after the panel appears.
 * `vanish` fades it out on arrival; with reduced motion it then isn't drawn at all, otherwise
 * it sits at the last point.
 */
export function Travel({ pts, d = 0, dur = 1200, vanish, linear, children }: { pts: readonly Pt[]; d?: number; dur?: number; vanish?: boolean; linear?: boolean; children: React.ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const { live, reduced } = useMotion();
  const key = pts.map((p) => p.join(",")).join(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const points = key.split(" ").map((p) => p.split(",").map(Number) as [number, number]);
    const end = points[points.length - 1];
    if (reduced) {
      el.style.transform = `translate(${end[0]}px, ${end[1]}px)`;
      el.style.opacity = vanish ? "0" : "1";
      return;
    }
    if (!live) return;
    const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
    const total = lengths.reduce((s, l) => s + l, 0) || 1;
    let run = 0;
    const frames = points.map((p, i) => {
      if (i > 0) run += lengths[i - 1];
      return { transform: `translate(${p[0]}px, ${p[1]}px)`, offset: run / total };
    });
    const move = el.animate(frames, { duration: dur, delay: d, easing: linear ? "linear" : EASE_CSS.inOutSmooth, fill: "both" });
    const show = el.animate(
      vanish ? [{ opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1, offset: 0.9 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1 }],
      { duration: dur, delay: d, fill: "both" },
    );
    return () => {
      move.cancel();
      show.cancel();
    };
  }, [key, d, dur, vanish, linear, live, reduced]);

  return (
    <g ref={ref} style={{ opacity: 0, transform: `translate(${pts[0][0]}px, ${pts[0][1]}px)` }} aria-hidden="true">
      {children}
    </g>
  );
}

/** Shows its children until `at` ms, then fades them out (an earlier state). Reduced motion: not drawn. */
export function Until({ at, dur = 400, children }: { at: number; dur?: number; children: React.ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const { live, reduced } = useMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.style.opacity = "0";
      return;
    }
    el.style.opacity = "";
    if (!live) return;
    const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, delay: at, fill: "both" });
    return () => anim.cancel();
  }, [at, dur, live, reduced]);

  return <g ref={ref}>{children}</g>;
}

/** A plain polyline in a line tone (no draw-in), optionally entering at `d`. */
export function Stroke({ pts, tone = "slate", width = 2, dashed, opacity, cap = "round", d }: { pts: readonly Pt[]; tone?: LineTone; width?: number; dashed?: boolean; opacity?: number; cap?: "round" | "butt"; d?: number }) {
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const g = <path d={path} style={{ fill: "none", stroke: INK[tone], strokeWidth: width, strokeLinecap: cap, strokeLinejoin: "round", strokeDasharray: dashed ? "5 4" : undefined, opacity }} />;
  return d === undefined ? g : <Fade d={d}>{g}</Fade>;
}

/** A filled dot (or a ring) in a line tone. */
export function Dot({ at, r = 4.5, tone = "gold", ring, opacity, d }: { at: Pt; r?: number; tone?: LineTone; ring?: boolean; opacity?: number; d?: number }) {
  const g = (
    <circle
      cx={at[0]}
      cy={at[1]}
      r={r}
      style={ring ? { fill: "var(--surface)", stroke: INK[tone], strokeWidth: 2.2, opacity } : { fill: INK[tone], stroke: "var(--surface)", strokeWidth: 1, opacity }}
    />
  );
  return d === undefined ? g : <Fade d={d}>{g}</Fade>;
}

/**
 * Points of a square wave: one level per step, high at yHigh and low at yLow. The first and
 * last steps can be shorter (a trace that starts or ends in the middle of a state).
 */
export function squareWave(levels: readonly number[], x0: number, step: number, yLow: number, yHigh: number, edgeStep = step): Pt[] {
  const y = (v: number) => (v ? yHigh : yLow);
  const pts: Pt[] = [[x0, y(levels[0])]];
  let x = x0;
  levels.forEach((v, i) => {
    x += i === 0 || i === levels.length - 1 ? edgeStep : step;
    pts.push([x, y(v)]);
    if (i + 1 < levels.length && levels[i + 1] !== v) pts.push([x, y(levels[i + 1])]);
  });
  return pts;
}

const rad = (deg: number) => (deg * Math.PI) / 180;

/** A point at `deg` (SVG convention: 0° = +x, clockwise on screen) and radius r. */
export const polar = (cx: number, cy: number, r: number, deg: number): Pt => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

/** Points along an arc, for Arrow and Stroke. */
export function arc(cx: number, cy: number, r: number, from: number, to: number, n = 14): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => polar(cx, cy, r, from + ((to - from) * i) / n));
}

/** The path of an annular wedge between radii r0 < r1, from angle a0 to a1 (SVG convention). */
export function wedge(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const [x0, y0] = polar(cx, cy, r1, a0);
  const [x1, y1] = polar(cx, cy, r1, a1);
  const [x2, y2] = polar(cx, cy, r0, a1);
  const [x3, y3] = polar(cx, cy, r0, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(2);
  return `M${f(x0)},${f(y0)} A${r1},${r1} 0 ${large} 1 ${f(x1)},${f(y1)} L${f(x2)},${f(y2)} A${r0},${r0} 0 ${large} 0 ${f(x3)},${f(y3)} Z`;
}

/** A filled wedge (disc sector, sonar cone) in a CSS fill, with an optional outline. */
export function Wedge({ cx, cy, r0, r1, a0, a1, fill, stroke = "var(--border-strong)", opacity, width = 1, d }: { cx: number; cy: number; r0: number; r1: number; a0: number; a1: number; fill: string; stroke?: string; opacity?: number; width?: number; d?: number }) {
  const g = <path d={wedge(cx, cy, r0, r1, a0, a1)} style={{ fill, stroke, strokeWidth: width, fillOpacity: opacity }} />;
  return d === undefined ? g : <Fade d={d}>{g}</Fade>;
}

/** A filled polygon in a CSS fill (cones, shadows, plates). */
export function Poly({ pts, fill, stroke = "none", opacity, width = 1.2, dashed, d }: { pts: readonly Pt[]; fill: string; stroke?: string; opacity?: number; width?: number; dashed?: boolean; d?: number }) {
  const g = <polygon points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")} style={{ fill, stroke, strokeWidth: width, fillOpacity: opacity, strokeDasharray: dashed ? "5 4" : undefined }} />;
  return d === undefined ? g : <Fade d={d}>{g}</Fade>;
}

/** A region hatched with diagonal lines: territory a sensor cannot see. */
export function Hatch({ pts, d }: { pts: readonly Pt[]; d?: number }) {
  const raw = useId();
  const id = `hatch-${raw.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const g = (
    <>
      <defs>
        <pattern id={id} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1={0} y1={0} x2={0} y2={7} style={{ stroke: "var(--muted)", strokeWidth: 1.6, opacity: 0.7 }} />
        </pattern>
      </defs>
      <polygon points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")} style={{ fill: `url(#${id})`, stroke: "var(--muted)", strokeWidth: 1, strokeDasharray: "4 3" }} />
    </>
  );
  return d === undefined ? g : <Fade d={d}>{g}</Fade>;
}

/** A wall seen from above or the side: a solid slate bar. */
export function Wall({ x, y, w: ww, h, d }: { x: number; y: number; w: number; h: number; d?: number }) {
  return <Box x={x} y={y} w={ww} h={h} r={2} tone="slate" d={d} />;
}

/** A sensor head: a navy block with a short label beside or under it. */
export function Sensor({ x, y, w: sw = 30, h = 34, label, labelAt, d }: { x: number; y: number; w?: number; h?: number; label?: L; labelAt?: Pt; d?: number }) {
  const g = (
    <>
      <Box x={x} y={y} w={sw} h={h} r={5} tone="navy" />
      {label !== undefined ? <Text x={labelAt?.[0] ?? x + sw / 2} y={labelAt?.[1] ?? y + h + 14} text={label} size={11} tone="heading" /> : null}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/**
 * A table whose header cells can be bilingual (Table's header takes plain strings only):
 * a header row `headH` tall, then rows of mono cells appearing `stagger` ms apart.
 */
export function BiTable({
  x,
  y,
  cols,
  rows,
  cw,
  rh = 22,
  headH = 38,
  d = 0,
  stagger = 90,
  size = 11.5,
  cell,
}: {
  x: number;
  y: number;
  cols: readonly L[];
  rows: readonly (readonly string[])[];
  cw: readonly number[];
  rh?: number;
  headH?: number;
  d?: number;
  stagger?: number;
  size?: number;
  cell?: (r: number, c: number) => Tone | undefined;
}) {
  const xs = cw.map((_, i) => x + cw.slice(0, i).reduce((s, v) => s + v, 0));
  return (
    <>
      <In d={d}>
        {cols.map((c, i) => (
          <Box key={i} x={xs[i]} y={y} w={cw[i]} h={headH} r={0} label={c} tone="navy" size={size - 0.5} />
        ))}
      </In>
      {rows.map((row, r) => (
        <In key={r} d={d + (r + 1) * stagger}>
          {row.map((v, c) => (
            <Box key={c} x={xs[c]} y={y + headH + rh * r} w={cw[c]} h={rh} r={0} label={v} tone={cell?.(r, c) ?? "outline"} size={size} mono />
          ))}
        </In>
      ))}
    </>
  );
}

/** A small "where" label with a leader line from (x1, y1) to the text at (x2, y2). */
export function Callout({ from, to, text, anchor = "start", tone = "muted", size = 11, d }: { from: Pt; to: Pt; text: L; anchor?: "start" | "middle" | "end"; tone?: "muted" | "heading" | "gold" | "danger" | "success"; size?: number; d?: number }) {
  const g = (
    <>
      <path d={`M${from[0]},${from[1]} L${to[0]},${to[1]}`} className={`${w.line} ${w.faint}`} style={{ strokeWidth: 1.2 }} />
      <Text x={to[0] + (anchor === "start" ? 4 : anchor === "end" ? -4 : 0)} y={to[1]} text={text} anchor={anchor} size={size} tone={tone} />
    </>
  );
  return d === undefined ? g : <Fade d={d}>{g}</Fade>;
}
