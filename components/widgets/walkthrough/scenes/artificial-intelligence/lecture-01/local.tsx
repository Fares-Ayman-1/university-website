"use client";

import { useContext, useEffect, useRef } from "react";
import { EASE_CSS } from "@/lib/motion";
import { Box, In, StageContext, Text, type L, type Pt, type Tone } from "../../../primitives";
import w from "../../../../Walkthrough.module.css";

/*
 * Pieces shared by the scenes of Artificial Intelligence · Lecture 1: the vacuum robot, its
 * dirt, the two squares, and motion helpers (Glide moves a group between stops, Vanish fades
 * one out at a given time).
 */

/**
 * Moves its children (drawn at stops[0]) to each later stop in turn: the move to stops[i]
 * starts `at[i - 1]` ms after the panel appears and takes `move` ms. It waits for the stage
 * to be on screen, and with reduced motion it just sits at the last stop.
 */
export function Glide({ stops, at, move = 500, children }: { stops: readonly Pt[]; at: readonly number[]; move?: number; children: React.ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const { live, reduced } = useContext(StageContext);
  const key = `${stops.map((p) => p.join(",")).join(" ")}|${at.join(",")}|${move}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const [stopText, atText] = key.split("|");
    const pts = stopText.split(" ").map((p) => p.split(",").map(Number) as [number, number]);
    const times = atText ? atText.split(",").map(Number) : [];
    const [x0, y0] = pts[0];
    const shift = (p: [number, number]) => `translate(${p[0] - x0}px, ${p[1] - y0}px)`;
    if (reduced || times.length === 0) {
      el.style.transform = shift(pts[pts.length - 1]);
      return;
    }
    el.style.transform = "";
    if (!live) return;
    const total = times[times.length - 1] + move;
    const frames: Keyframe[] = [{ transform: shift(pts[0]), offset: 0 }];
    times.forEach((t, i) => {
      frames.push({ transform: shift(pts[i]), offset: t / total, easing: EASE_CSS.inOutSmooth });
      frames.push({ transform: shift(pts[i + 1]), offset: (t + move) / total });
    });
    const anim = el.animate(frames, { duration: total, fill: "both" });
    return () => anim.cancel();
  }, [key, move, live, reduced]);

  return <g ref={ref}>{children}</g>;
}

/** Shows its children, then fades them out `at` ms after the panel appears (gone at once with reduced motion). */
export function Vanish({ at, dur = 400, children }: { at: number; dur?: number; children: React.ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const { live, reduced } = useContext(StageContext);

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

/** The vacuum robot, centred on (x, y). */
export function Robot({ x, y, r = 15, tone = "navy", d }: { x: number; y: number; r?: number; tone?: Tone; d?: number }) {
  const g = (
    <>
      <circle cx={x} cy={y} r={r} className={w.under} />
      <circle cx={x} cy={y} r={r} className={`${w.shape} ${w[tone]}`} />
      <circle cx={x} cy={y - r * 0.38} r={r * 0.26} className={`${w.shape} ${w.gold}`} />
      <path d={`M${x - r * 0.55},${y + r * 0.35} h${r * 1.1}`} className={`${w.line} ${w.gold}`} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

const SPECKS: readonly (readonly [number, number, number])[] = [
  [-14, -3, 3.4],
  [-5, 6, 4],
  [4, -6, 3],
  [12, 4, 3.6],
  [-1, -1, 2.4],
  [20, -4, 2.2],
];

/** A patch of dirt centred on (x, y). */
export function Dirt({ x, y, d }: { x: number; y: number; d?: number }) {
  const g = (
    <>
      {SPECKS.map(([dx, dy, r], i) => (
        <circle key={i} cx={x + dx} cy={y + dy} r={r} style={{ fill: "var(--warning)", opacity: 0.85 }} />
      ))}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** One square of the vacuum world, with its name in the top-left corner. */
export function Square({ x, y, w: sw, h, name, tone = "outline", d }: { x: number; y: number; w: number; h: number; name: string; tone?: Tone; d?: number }) {
  const g = (
    <>
      <Box x={x} y={y} w={sw} h={h} r={8} tone={tone} />
      <Text x={x + 14} y={y + 16} text={name} anchor="start" mono size={14} tone="muted" />
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
  rh = 24,
  headH = 40,
  d = 0,
  stagger = 110,
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
          <Box key={i} x={xs[i]} y={y} w={cw[i]} h={headH} r={0} label={c} tone="navy" size={size} />
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

/** A small caption in the top-left of a frame: a navy chip sitting on its border. */
export function FrameLabel({ x, y, text, d }: { x: number; y: number; text: L; d?: number }) {
  return <Box x={x} y={y - 18} w={96} h={36} r={18} label={text} tone="navy" size={11.5} d={d} />;
}
