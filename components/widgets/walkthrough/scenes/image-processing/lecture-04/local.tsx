"use client";

import { Arrow, Box, Curve, Fade, In, Text, type LineTone, type PlotBox, type Pt, type Tone } from "../../../primitives";

/*
 * Drawing pieces only this lecture needs: grids of printed numbers, bars that go below zero,
 * and circles drawn in pixel coordinates. Built from the shared primitives, so they follow
 * the theme and the build-up delays like every other scene.
 */

/** A grid of labelled cells (numbers or short text), built up row by row. */
export function NumGrid({
  x,
  y,
  cells,
  cw,
  ch = 28,
  tone,
  size = 11,
  d = 0,
  stagger = 90,
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
}) {
  return (
    <>
      {cells.map((row, r) =>
        row.map((v, c) => <Box key={`${r}-${c}`} x={x + c * cw} y={y + r * ch} w={cw} h={ch} r={0} label={v} tone={tone?.(r, c) ?? "outline"} size={size} mono d={d + r * stagger} />),
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
  barTone?: (i: number) => Tone | undefined;
  d?: number;
  stagger?: number;
}) {
  const slot = bw / values.length;
  const barW = slot * 0.56;
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
            {len > 0.5 ? <Box x={bx} y={top} w={barW} h={len} r={Math.min(3, len / 2)} tone={barTone?.(i) ?? "gold"} /> : null}
            {texts?.[i] ? <Text x={bx + barW / 2} y={v >= 0 ? mid - len - 9 : mid + len + 9} text={texts[i]} size={10.5} mono tone="heading" /> : null}
            {labels?.[i] ? <Text x={bx + barW / 2} y={v >= 0 ? mid + 12 : mid - 12} text={labels[i]} size={10} mono tone="muted" /> : null}
          </In>
        );
      })}
    </>
  );
}

/** Points of a circle of radius r around (cx, cy), in SVG units. */
export function circle(cx: number, cy: number, r: number, n = 64): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((2 * Math.PI * i) / n), cy + r * Math.sin((2 * Math.PI * i) / n)] as const);
}

/** A circle drawn in SVG units (a Curve over an identity plot box). */
export function Circle({ cx, cy, r, tone = "gold", dashed, d = 0, width = 1.8 }: { cx: number; cy: number; r: number; tone?: LineTone; dashed?: boolean; d?: number; width?: number }) {
  const box: PlotBox = { x: 0, y: 0, w: 560, h: 280, domain: [0, 560], range: [280, 0] };
  return <Curve box={box} points={circle(cx, cy, r)} tone={tone} dashed={dashed} width={width} d={d} dur={500} />;
}

/** A dashed frame around a region (fades in on top). */
export function Ring({ x, y, w, h, d = 0, r = 4 }: { x: number; y: number; w: number; h: number; d?: number; r?: number }) {
  return (
    <Fade d={d}>
      <Box x={x} y={y} w={w} h={h} r={r} tone="ghost" dashed />
    </Fade>
  );
}

/** A filled dot centred on (x, y). */
export function Dot({ x, y, r = 4, tone = "gold", d }: { x: number; y: number; r?: number; tone?: Tone; d?: number }) {
  return <Box x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} tone={tone} d={d} />;
}

/**
 * An image drawn as seamless grey squares, without the cell borders Pixels draws: for pictures
 * and spectra with small pixels (2–5 px), where the borders would turn the image into a mesh.
 */
export function Raster({ x, y, values, cell, max = 255, d = 0 }: { x: number; y: number; values: readonly (readonly number[])[]; cell: number; max?: number; d?: number }) {
  const rows = values.length;
  const cols = values[0]?.length ?? 0;
  return (
    <In d={d}>
      {values.map((row, r) =>
        row.map((v, c) => {
          const g = Math.round(Math.min(Math.max(v / max, 0), 1) * 255);
          return <rect key={`${r}-${c}`} x={x + c * cell} y={y + r * cell} width={cell + 0.4} height={cell + 0.4} style={{ fill: `rgb(${g},${g},${g})` }} />;
        }),
      )}
      <rect x={x} y={y} width={cols * cell} height={rows * cell} style={{ fill: "none", stroke: "var(--border-strong)", strokeWidth: 0.8 }} />
    </In>
  );
}
