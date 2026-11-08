"use client";

import type { Bi } from "../../../../types";
import { Arrow, Box, Curve, Fade, In, plotAt, Text, type L, type LineTone, type PlotBox, type Pt, type TextTone, type Tone } from "../../../primitives";

/*
 * Drawing pieces only this lecture needs: a complex plane, stem plots, grids of complex
 * numbers, signed bars and phase dials. Built from the shared primitives, so they follow the
 * theme and the build-up delays like every other scene.
 */

/** Points of a circle (or an arc from a0 to a1, in radians) in data coordinates. */
export function arc(cx: number, cy: number, r: number, a0 = 0, a1 = 2 * Math.PI, n = 48): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = a0 + ((a1 - a0) * i) / n;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  });
}

/** A square plot box that fits data spanning [x0, x1] × [y0, y1] into the area, with equal scales. */
export function fitBox(area: { x: number; y: number; w: number; h: number }, x0: number, x1: number, y0: number, y1: number): PlotBox {
  const s = Math.min(area.w / (x1 - x0), area.h / (y1 - y0));
  const cxd = (x0 + x1) / 2;
  const cyd = (y0 + y1) / 2;
  const hw = area.w / s / 2;
  const hh = area.h / s / 2;
  return { ...area, domain: [cxd - hw, cxd + hw], range: [cyd - hh, cyd + hh] };
}

/** The real and imaginary axes of a complex plane, crossing at 0, with "Re" and "Im" labels. */
export function Plane({ box, d = 0, unit }: { box: PlotBox; d?: number; unit?: boolean }) {
  const [x0, x1] = box.domain ?? [0, 1];
  const [y0, y1] = box.range ?? [0, 1];
  const re0 = plotAt(box, x0, 0);
  const re1 = plotAt(box, x1, 0);
  const im0 = plotAt(box, 0, y0);
  const im1 = plotAt(box, 0, y1);
  return (
    <>
      <Arrow pts={[re0, re1]} tone="faint" d={d} dur={300} />
      <Arrow pts={[im0, im1]} tone="faint" d={d} dur={300} />
      <Text x={re1[0] - 2} y={re1[1] + 13} text="Re" anchor="end" size={10.5} tone="muted" mono d={d + 200} />
      <Text x={im1[0] + 8} y={im1[1] + 6} text="Im" anchor="start" size={10.5} tone="muted" mono d={d + 200} />
      {unit ? <Curve box={box} points={arc(0, 0, 1)} tone="faint" width={1.4} d={d + 100} dur={500} /> : null}
    </>
  );
}

/** A filled dot centred on (x, y). */
export function Dot({ x, y, r = 4, tone = "gold", d }: { x: number; y: number; r?: number; tone?: Tone; d?: number }) {
  return <Box x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} tone={tone} d={d} />;
}

/** A line from data point a to data point b of a plot box (an arrow unless head is false). */
export function Seg({ box, a, b, tone = "gold", head = true, dashed, d = 0, dur = 380, width }: { box: PlotBox; a: readonly [number, number]; b: readonly [number, number]; tone?: LineTone; head?: boolean; dashed?: boolean; d?: number; dur?: number; width?: number }) {
  const p = plotAt(box, a[0], a[1]);
  const q = plotAt(box, b[0], b[1]);
  if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 1) return null;
  return <Arrow pts={[p, q]} tone={tone} head={head} dashed={dashed} d={d} dur={dur} width={width} />;
}

/** The horizontal zero line of a plot box. */
export function ZeroLine({ box, d = 0, tone = "faint" }: { box: PlotBox; d?: number; tone?: LineTone }) {
  const [x0, x1] = box.domain ?? [0, 1];
  return <Arrow pts={[plotAt(box, x0, 0), plotAt(box, x1, 0)]} tone={tone} head={false} d={d} dur={300} />;
}

/**
 * A stem plot of signed samples: a zero line, then one stem and dot per sample. Sample i sits
 * at data x = i, so give the box a domain like [−0.5, N − 0.5].
 */
export function Stems({ box, values, tone = "gold", line = "gold", d = 0, stagger = 60, r = 3.6 }: { box: PlotBox; values: readonly number[]; tone?: Tone; line?: LineTone; d?: number; stagger?: number; r?: number }) {
  return (
    <>
      <ZeroLine box={box} d={d} />
      {values.map((v, i) => {
        const base = plotAt(box, i, 0);
        const top = plotAt(box, i, v);
        return (
          <In key={i} d={d + 150 + i * stagger}>
            {Math.abs(top[1] - base[1]) > 1 ? <Arrow pts={[base, top]} tone={line} head={false} d={0} dur={1} /> : null}
            <Dot x={top[0]} y={top[1]} r={r} tone={tone} />
          </In>
        );
      })}
    </>
  );
}

/** A grid of labelled cells (numbers, complex numbers, ω powers). */
export function CGrid({
  x,
  y,
  cells,
  cw,
  ch = 28,
  tone,
  size = 11,
  d = 0,
  stagger = 90,
  byColumn,
}: {
  x: number;
  y: number;
  cells: readonly (readonly string[])[];
  cw: number;
  ch?: number;
  tone?: (r: number, c: number) => Tone | undefined;
  size?: number;
  d?: number;
  stagger?: number;
  /** Build up column by column instead of row by row */
  byColumn?: boolean;
}) {
  return (
    <>
      {cells.map((row, r) =>
        row.map((v, c) => <Box key={`${r}-${c}`} x={x + c * cw} y={y + r * ch} w={cw} h={ch} r={0} label={v} tone={tone?.(r, c) ?? "outline"} size={size} mono d={d + (byColumn ? c : r) * stagger} />),
      )}
    </>
  );
}

/** Bars that go up for positive values and down for negative ones, from a middle zero line. */
export function SignedBars({
  x,
  y,
  w: bw,
  h,
  values,
  max,
  labels,
  texts,
  tone = "gold",
  barTone,
  d = 0,
  stagger = 90,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  values: readonly number[];
  max: number;
  labels?: readonly string[];
  /** Printed beside each bar's end (above a positive bar, below a negative one) */
  texts?: readonly string[];
  tone?: Tone;
  barTone?: (i: number) => Tone | undefined;
  d?: number;
  stagger?: number;
}) {
  const slot = bw / values.length;
  const barW = slot * 0.62;
  const mid = y + h / 2;
  return (
    <>
      <Arrow pts={[[x - 4, mid], [x + bw + 4, mid]]} tone="faint" head={false} d={d} dur={300} />
      {values.map((v, i) => {
        const len = (Math.abs(v) / max) * (h / 2);
        const bx = x + i * slot + (slot - barW) / 2;
        const top = v >= 0 ? mid - len : mid;
        return (
          <In key={i} d={d + 150 + i * stagger}>
            {len > 0.5 ? <Box x={bx} y={top} w={barW} h={len} r={Math.min(3, len / 2)} tone={barTone?.(i) ?? tone} /> : null}
            {texts?.[i] ? <Text x={bx + barW / 2} y={v >= 0 ? mid - len - 9 : mid + len + 9} text={texts[i]} size={10.5} mono tone="heading" /> : null}
            {labels?.[i] ? <Text x={bx + barW / 2} y={v >= 0 ? mid + 12 : mid - 12} text={labels[i]} size={10} mono tone="muted" /> : null}
          </In>
        );
      })}
    </>
  );
}

/** A phase dial: a faint circle with an arrow at `deg` degrees (counter-clockwise from +Re). */
export function Dial({ x, y, r = 18, deg, tone = "gold", label, d = 0, off }: { x: number; y: number; r?: number; deg: number; tone?: LineTone; label?: L; d?: number; off?: boolean }) {
  const box: PlotBox = { x: x - r, y: y - r, w: 2 * r, h: 2 * r, domain: [-1, 1], range: [-1, 1] };
  const a = (deg * Math.PI) / 180;
  return (
    <>
      <Curve box={box} points={arc(0, 0, 1)} tone="faint" width={1.3} d={d} dur={400} />
      {off ? null : <Seg box={box} a={[0, 0]} b={[0.86 * Math.cos(a), 0.86 * Math.sin(a)]} tone={tone} d={d + 250} dur={300} />}
      {label !== undefined ? <Text x={x} y={y + r + 12} text={label} size={10.5} mono tone="heading" d={d + 300} /> : null}
    </>
  );
}

/** A small caption under or over something, English with Arabic beneath. */
export function Caption({ x, y, text, tone = "muted", size = 11, d, anchor = "middle" }: { x: number; y: number; text: Bi | string; tone?: TextTone; size?: number; d?: number; anchor?: "start" | "middle" | "end" }) {
  return <Text x={x} y={y} text={text} tone={tone} size={size} d={d} anchor={anchor} />;
}

/** A dashed bracket-free highlight around a region (fades in on top). */
export function Ring({ x, y, w, h, d = 0, r = 6 }: { x: number; y: number; w: number; h: number; d?: number; r?: number }) {
  return (
    <Fade d={d}>
      <Box x={x} y={y} w={w} h={h} r={r} tone="ghost" dashed />
    </Fade>
  );
}
