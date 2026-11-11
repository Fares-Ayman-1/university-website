"use client";

import { useContext, useEffect, useRef } from "react";
import { EASE_CSS } from "@/lib/motion";
import { bi as biText, type Bi } from "../../../../types";
import { Arrow, Box, Fade, In, StageContext, Text, type L, type LineTone, type Pt, type TextTone, type Tone } from "../../../primitives";
import w from "../../../../Walkthrough.module.css";

/*
 * SVG text gets no <bdi>, so inside an Arabic line an English stretch with spaces or neutral
 * characters ("5 V", "0 / 1", "R₂ = 1 kΩ") would be reordered. This `bi` isolates each
 * English stretch of the Arabic with U+2066 … U+2069 (as AI lecture 4's scenes do), the same
 * stretches components/mdx/Arabic.tsx wraps in <bdi> for HTML text.
 */
const ARABIC_STRETCH = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿«»]+(?:\s+[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿«»]+)*/g;
const LRI = "⁦";
const PDI = "⁩";

function isolateRuns(text: string): string {
  let out = "";
  let last = 0;
  const latin = (segment: string) => {
    // Spaces, sentence punctuation, arrows and · at either end stay outside, so they follow the Arabic order.
    const [, lead, core, trail] = /^([\s.,:;!?·←→]*)(.*?)([\s.,:;!?·←→]*)$/s.exec(segment)!;
    return /[A-Za-z0-9]/.test(core) ? `${lead}${LRI}${core}${PDI}${trail}` : segment;
  };
  for (const m of text.matchAll(ARABIC_STRETCH)) {
    if (m.index > last) out += latin(text.slice(last, m.index));
    out += m[0];
    last = m.index + m[0].length;
  }
  if (last < text.length) out += latin(text.slice(last));
  return out;
}

/** A Bi for SVG scenes: the Arabic's English stretches are isolated left-to-right. */
export const bi = (en: string, ar: string): Bi => biText(en, isolateRuns(ar));

/*
 * Drawing pieces for Robotics · Lecture 3 (sensors I) that the shared primitives don't have:
 * motion helpers (Glide moves a group between stops, Turn rotates one), circuit symbols
 * (wire, resistor, ground, node, supply), light (rays, a lamp) and a vertical meter.
 */

/**
 * Moves its children (drawn at stops[0]) to each later stop in turn: the move to stops[i]
 * starts `at[i - 1]` ms after the panel appears and takes `move` ms. It waits for the stage
 * to be on screen, and with reduced motion it just sits at the last stop.
 */
export function Glide({ stops, at, move = 600, children }: { stops: readonly Pt[]; at: readonly number[]; move?: number; children: React.ReactNode }) {
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

/**
 * Rotates its children about (cx, cy) from `from` to `to` degrees (clockwise positive),
 * starting `at` ms after the panel appears and taking `dur` ms. Reduced motion shows `to`.
 */
export function Turn({ cx, cy, from, to, at = 0, dur = 700, children }: { cx: number; cy: number; from: number; to: number; at?: number; dur?: number; children: React.ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const { live, reduced } = useContext(StageContext);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rot = (a: number) => `rotate(${a}deg)`;
    if (reduced || from === to) {
      el.style.transform = rot(to);
      return;
    }
    el.style.transform = rot(from);
    if (!live) return;
    const anim = el.animate([{ transform: rot(from) }, { transform: rot(to) }], { duration: dur, delay: at, easing: EASE_CSS.inOutSmooth, fill: "both" });
    return () => anim.cancel();
  }, [from, to, at, dur, live, reduced]);

  return (
    <g ref={ref} style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: "view-box" }}>
      {children}
    </g>
  );
}

/** Two decimals: trig results differ in the last digits between the server and the browser, which breaks hydration. */
const r2 = (v: number) => Math.round(v * 100) / 100;

/** A point on a circle of radius r about (cx, cy), `deg` clockwise from straight up. */
export const polar = (cx: number, cy: number, r: number, deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return [r2(cx + r * Math.sin(a)), r2(cy - r * Math.cos(a))];
};

/** A wire: a polyline with no arrowhead. */
export function Wire({ pts, tone = "navy", d = 0, dur = 400, dashed, width }: { pts: readonly Pt[]; tone?: LineTone; d?: number; dur?: number; dashed?: boolean; width?: number }) {
  return <Arrow pts={pts} tone={tone} head={false} d={d} dur={dur} dashed={dashed} width={width} />;
}

/** A filled junction dot. */
export function Node({ x, y, tone = "navy", r = 3.5, d }: { x: number; y: number; tone?: "navy" | "gold" | "success" | "danger"; r?: number; d?: number }) {
  const fill = { navy: "var(--heading)", gold: "var(--gold)", success: "var(--success)", danger: "var(--danger)" }[tone];
  const g = <circle cx={x} cy={y} r={r} style={{ fill }} />;
  return d === undefined ? g : <Fade d={d}>{g}</Fade>;
}

/** A resistor zigzag from (x, y1) down to (x, y2), or across from (x1, y) to (x2, y) with `horizontal`. */
export function Resistor({
  x,
  y,
  len = 50,
  horizontal,
  tone = "navy",
  label,
  labelSide = "right",
  labelTone = "heading",
  size = 11.5,
  arrows,
  wiper,
  d = 0,
}: {
  x: number;
  y: number;
  len?: number;
  horizontal?: boolean;
  tone?: LineTone;
  label?: L;
  labelSide?: "left" | "right" | "above" | "below";
  labelTone?: TextTone;
  size?: number;
  /** Two light arrows pointing at it (an LDR) */
  arrows?: boolean;
  /** A wiper arrow pointing at it at this fraction of its length (a potentiometer) */
  wiper?: number;
  d?: number;
}) {
  const zig = 6;
  const amp = 7;
  const lead = len * 0.18;
  const body = len - 2 * lead;
  const step = body / zig;
  const pts: Pt[] = [[0, 0], [0, lead]];
  for (let i = 0; i < zig; i++) pts.push([i % 2 ? -amp : amp, lead + step * (i + 0.5)]);
  pts.push([0, lead + body], [0, len]);
  const at = (p: Pt): Pt => (horizontal ? [x + p[1], y + p[0]] : [x + p[0], y + p[1]]);
  const path = pts.map(at);
  const mid = at([0, len / 2]);
  const labelAt: Pt =
    labelSide === "right" ? [mid[0] + (horizontal ? 0 : 16), mid[1]] : labelSide === "left" ? [mid[0] - (horizontal ? 0 : 16), mid[1]] : labelSide === "above" ? [mid[0], mid[1] - 22] : [mid[0], mid[1] + 22];
  const anchor = labelSide === "right" && !horizontal ? "start" : labelSide === "left" && !horizontal ? "end" : "middle";
  return (
    <>
      <Arrow pts={path} tone={tone} head={false} d={d} dur={500} width={2} />
      {arrows ? (
        <>
          <Arrow pts={[at([-30, len * 0.25]), at([-13, len * 0.4])]} tone="gold" d={d + 300} dur={250} />
          <Arrow pts={[at([-30, len * 0.45]), at([-13, len * 0.6])]} tone="gold" d={d + 400} dur={250} />
        </>
      ) : null}
      {wiper !== undefined ? <Arrow pts={[at([24, len * wiper]), at([10, len * wiper])]} tone="gold" d={d + 300} dur={250} width={2.2} /> : null}
      {label !== undefined ? <Text x={labelAt[0]} y={labelAt[1]} text={label} anchor={anchor} size={size} tone={labelTone} d={d + 200} /> : null}
    </>
  );
}

/** A ground symbol hanging from (x, y). */
export function Ground({ x, y, d = 0 }: { x: number; y: number; d?: number }) {
  return (
    <In d={d}>
      <path d={`M${x},${y} v8 M${x - 11},${y + 8} h22 M${x - 7},${y + 13} h14 M${x - 3},${y + 18} h6`} className={`${w.line} ${w.navy}`} />
    </In>
  );
}

/** Light rays from (x, y) toward `deg` (clockwise from up), `n` of them fanned over `spread` degrees. */
export function Rays({ x, y, deg, n, spread = 50, r0 = 14, r1 = 40, d = 0, stagger = 60 }: { x: number; y: number; deg: number; n: number; spread?: number; r0?: number; r1?: number; d?: number; stagger?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = n === 1 ? deg : deg - spread / 2 + (spread * i) / (n - 1);
        return <Arrow key={i} pts={[polar(x, y, r0, a), polar(x, y, r1, a)]} tone="gold" d={d + i * stagger} dur={250} />;
      })}
    </>
  );
}

/** A lamp: a gold disc, dimmed when `off`. */
export function Lamp({ x, y, r = 12, off, d }: { x: number; y: number; r?: number; off?: boolean; d?: number }) {
  const g = (
    <>
      <circle cx={x} cy={y} r={r} className={w.under} />
      <circle cx={x} cy={y} r={r} className={`${w.shape} ${off ? w.muted : w.gold}`} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/**
 * A vertical meter: a track `h` tall with a filled bar for value/max and the value printed
 * above it. `ticks` are values to mark on the left.
 */
export function Meter({
  x,
  y,
  h,
  value,
  max,
  w: mw = 26,
  tone = "gold",
  text,
  ticks = [],
  tickText = (t: number) => String(t),
  d = 0,
}: {
  x: number;
  y: number;
  h: number;
  value: number;
  max: number;
  w?: number;
  tone?: Tone;
  text?: string;
  ticks?: readonly number[];
  tickText?: (t: number) => string;
  d?: number;
}) {
  const bh = Math.max(0, Math.min(1, value / max)) * h;
  return (
    <>
      <Box x={x} y={y} w={mw} h={h} r={4} tone="muted" d={d} />
      {ticks.map((t) => (
        <Text key={t} x={x - 6} y={y + h - (t / max) * h} text={tickText(t)} anchor="end" size={9.5} mono tone="muted" d={d} />
      ))}
      <In d={d + 250}>{bh > 0.5 ? <rect x={x + 3} y={y + h - bh + (bh > 6 ? 3 : 0)} width={mw - 6} height={Math.max(bh - (bh > 6 ? 6 : 0), 1)} rx={3} className={`${w.shape} ${w[tone]}`} /> : null}</In>
      {text ? <Text x={x + mw / 2} y={y - 12} text={text} size={12} mono tone="heading" weight={700} d={d + 400} /> : null}
    </>
  );
}

/** A plain filled rectangle in a CSS colour (a metal plate, a strip of tape). */
export function Swatch({ x, y, w: sw, h, fill, stroke = "var(--border-strong)", r = 3, d }: { x: number; y: number; w: number; h: number; fill: string; stroke?: string; r?: number; d?: number }) {
  const g = <rect x={x} y={y} width={sw} height={h} rx={r} style={{ fill, stroke, strokeWidth: 1.2 }} />;
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** An arc (part of a circle) about (cx, cy) from `a0` to `a1` degrees clockwise from up. */
export function ArcPath({ cx, cy, r, a0, a1, tone = "navy", width = 2, dashed, d = 0, dur = 600 }: { cx: number; cy: number; r: number; a0: number; a1: number; tone?: LineTone; width?: number; dashed?: boolean; d?: number; dur?: number }) {
  const n = Math.max(8, Math.ceil(Math.abs(a1 - a0) / 6));
  const pts = Array.from({ length: n + 1 }, (_, i) => polar(cx, cy, r, a0 + ((a1 - a0) * i) / n));
  return <Arrow pts={pts} tone={tone} head={false} d={d} dur={dur} dashed={dashed} width={width} />;
}
