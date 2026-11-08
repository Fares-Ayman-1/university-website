"use client";

import { Arrow, Box, Fade, In, type L, type LineTone, type Tone, Text } from "../../../primitives";

/*
 * Small drawing pieces only Image Processing · Lecture 1 needs: a numbered grid (indices,
 * not grey levels), a frame around part of a drawing, flat colour swatches, a continuous
 * stripe pattern and a softly lit ball (the "continuous scene" before sampling).
 */

/** A grid of numbers in plain cells (an index matrix, a binary mask in outline), with optional tones per cell. */
export function NumGrid({
  x,
  y,
  values,
  cell = 30,
  tone,
  size = 12,
  d = 0,
  stagger = 0,
}: {
  x: number;
  y: number;
  values: readonly (readonly (number | string)[])[];
  cell?: number;
  tone?: (r: number, c: number) => Tone | undefined;
  size?: number;
  d?: number;
  stagger?: number;
}) {
  return (
    <>
      {values.map((row, r) => (
        <In key={r} d={d + r * stagger}>
          {row.map((v, c) => (
            <Box key={c} x={x + c * cell} y={y + r * cell} w={cell} h={cell} r={0} label={String(v)} tone={tone?.(r, c) ?? "outline"} size={size} mono />
          ))}
        </In>
      ))}
    </>
  );
}

/** A rectangle outline that draws itself in (around part of a grid or a drawing). */
export function Frame({ x, y, w, h, tone = "gold", d = 0, width = 2.4, dashed }: { x: number; y: number; w: number; h: number; tone?: LineTone; d?: number; width?: number; dashed?: boolean }) {
  return (
    <Arrow
      pts={[
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
        [x, y],
      ]}
      tone={tone}
      head={false}
      d={d}
      dur={500}
      width={width}
      dashed={dashed}
    />
  );
}

/** A flat colour square with an outline. */
export function Swatch({ x, y, size = 28, fill, d = 0 }: { x: number; y: number; size?: number; fill: string; d?: number }) {
  return (
    <In d={d}>
      <rect x={x} y={y} width={size} height={size} rx={3} style={{ fill, stroke: "var(--border-strong)", strokeWidth: 1 }} />
    </In>
  );
}

/** Vertical stripes drawn from a brightness function of u ∈ [0, 1], fine enough to look continuous. */
export function Stripes({ x, y, w, h, f, slices = 240, d = 0 }: { x: number; y: number; w: number; h: number; f: (u: number) => number; slices?: number; d?: number }) {
  const sw = w / slices;
  return (
    <Fade d={d}>
      {Array.from({ length: slices }, (_, i) => {
        const g = Math.round(Math.min(255, Math.max(0, f((i + 0.5) / slices))));
        return <rect key={i} x={x + i * sw} y={y} width={sw + 0.4} height={h} style={{ fill: `rgb(${g},${g},${g})` }} />;
      })}
      <rect x={x} y={y} width={w} height={h} style={{ fill: "none", stroke: "var(--border-strong)", strokeWidth: 1 }} />
    </Fade>
  );
}

/** A fixed id (not useId): the scene is loaded lazily, so a generated id differs between server and client. Every Ball draws the same gradient. */
const BALL_ID = "ip1-ball-light";

/** A ball lit from the top left on a dark square: a continuous scene, before any sampling. */
export function Ball({ x, y, size, d = 0, label }: { x: number; y: number; size: number; d?: number; label?: L }) {
  return (
    <>
      <In d={d}>
        <defs>
          <radialGradient id={BALL_ID} cx="0.36" cy="0.36" r="0.7">
            <stop offset="0" stopColor="rgb(245,245,245)" />
            <stop offset="1" stopColor="rgb(60,60,60)" />
          </radialGradient>
        </defs>
        <rect x={x} y={y} width={size} height={size} style={{ fill: "rgb(30,30,30)", stroke: "var(--border-strong)", strokeWidth: 1 }} />
        <circle cx={x + size / 2} cy={y + size / 2} r={size * 0.4} style={{ fill: `url(#${BALL_ID})` }} />
      </In>
      {label !== undefined ? <Text x={x + size / 2} y={y + size + 14} text={label} size={11.5} tone="muted" d={d} /> : null}
    </>
  );
}

const DOT_FILL = { gold: "var(--gold)", slate: "var(--slate)", danger: "var(--danger)", success: "var(--success)", muted: "var(--muted)" } as const;

/** Sample dots (or any points), fading in one after another. */
export function Dots({ pts, r = 4.5, tone = "gold", d = 0, stagger = 60 }: { pts: readonly (readonly [number, number])[]; r?: number; tone?: keyof typeof DOT_FILL; d?: number; stagger?: number }) {
  return (
    <>
      {pts.map(([x, y], i) => (
        <Fade key={i} d={d + i * stagger}>
          <circle cx={x} cy={y} r={r} style={{ fill: DOT_FILL[tone], stroke: "var(--surface)", strokeWidth: 1.5 }} />
        </Fade>
      ))}
    </>
  );
}

/** A translucent cover that dims the part of a drawing that doesn't take part. */
export function Veil({ x, y, w, h, d = 0 }: { x: number; y: number; w: number; h: number; d?: number }) {
  return (
    <Fade d={d}>
      <rect x={x} y={y} width={w} height={h} style={{ fill: "var(--surface)", opacity: 0.72 }} />
    </Fade>
  );
}

/** A filled rectangle or ellipse in any CSS colour (a scan, a road, a bottle). */
export function Shape({ x, y, w, h, fill, rx = 4, ellipse, stroke = "var(--border-strong)", d = 0 }: { x: number; y: number; w: number; h: number; fill: string; rx?: number; ellipse?: boolean; stroke?: string; d?: number }) {
  return (
    <In d={d}>
      {ellipse ? (
        <ellipse cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} style={{ fill, stroke, strokeWidth: 1 }} />
      ) : (
        <rect x={x} y={y} width={w} height={h} rx={rx} style={{ fill, stroke, strokeWidth: 1 }} />
      )}
    </In>
  );
}

/** A smooth ring drawn as a vector shape on a light square (the "vector" side of a zoom). */
export function VectorRing({ x, y, size, r, width, d = 0 }: { x: number; y: number; size: number; r: number; width: number; d?: number }) {
  return (
    <In d={d}>
      <rect x={x} y={y} width={size} height={size} style={{ fill: "rgb(242,242,242)", stroke: "var(--border-strong)", strokeWidth: 0.6 }} />
      <circle cx={x + size / 2} cy={y + size / 2} r={r} style={{ fill: "none", stroke: "rgb(38,38,38)", strokeWidth: width }} />
    </In>
  );
}
