"use client";

import { Arrow, Box, In, Text, fmt, type LineTone, type Tone } from "../../../primitives";

/*
 * Drawing pieces for Image Processing · Lecture 3 that the shared primitives don't have:
 * a coefficient matrix (mask entries are not pixels), a frame around a window, signed bars
 * for derivatives, and an operator sign between grids.
 */

/** A number with a real minus sign ("−60"), as the page prints it. */
export const num = (v: number | string) => (typeof v === "string" ? v : fmt(v).replace(/^-/, "−"));

/**
 * A matrix of numbers in outlined cells (mask coefficients, or signed filter outputs).
 * `tone` picks a cell's tone; rows appear `stagger` ms apart.
 */
export function Matrix({
  x,
  y,
  values,
  cell = 30,
  ch,
  tone,
  size = 12,
  d = 0,
  stagger = 0,
}: {
  x: number;
  y: number;
  values: readonly (readonly (number | string)[])[];
  cell?: number;
  /** Cell height, if different from the width */
  ch?: number;
  tone?: (r: number, c: number, v: number | string) => Tone | undefined;
  size?: number;
  d?: number;
  stagger?: number;
}) {
  const h = ch ?? cell;
  return (
    <>
      {values.map((row, r) => (
        <In key={r} d={d + r * stagger}>
          {row.map((v, c) => (
            <Box key={c} x={x + c * cell} y={y + r * h} w={cell} h={h} r={2} label={num(v)} tone={tone?.(r, c, v) ?? "outline"} size={size} mono />
          ))}
        </In>
      ))}
    </>
  );
}

/** Tones for a signed result: positive gold, negative red, zero muted. */
export const signTone = (_r: number, _c: number, v: number | string): Tone => (typeof v === "string" ? "outline" : v > 0 ? "gold" : v < 0 ? "danger" : "muted");

/** A rectangle outline (a mask window, an image border). */
export function Frame({ x, y, w, h, tone = "gold", dashed, d = 0, width = 2.6 }: { x: number; y: number; w: number; h: number; tone?: LineTone; dashed?: boolean; d?: number; width?: number }) {
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
      dashed={dashed}
      d={d}
      dur={500}
      width={width}
    />
  );
}

/** Bars above (positive) and below (negative) a zero line, one per centre x. */
export function SignedBars({
  xs,
  zeroY,
  values,
  scale,
  barW = 22,
  showValues = true,
  d = 0,
  stagger = 60,
}: {
  xs: readonly number[];
  zeroY: number;
  values: readonly number[];
  /** Pixels per unit */
  scale: number;
  barW?: number;
  showValues?: boolean;
  d?: number;
  stagger?: number;
}) {
  return (
    <>
      <Arrow pts={[[xs[0] - barW, zeroY], [xs[xs.length - 1] + barW, zeroY]]} tone="faint" head={false} d={d} dur={300} />
      {values.map((v, i) => {
        const h = Math.abs(v) * scale;
        const top = v > 0 ? zeroY - h : zeroY;
        return (
          <In key={i} d={d + 150 + i * stagger}>
            {h > 0.5 ? <Box x={xs[i] - barW / 2} y={top} w={barW} h={h} r={2} tone={v > 0 ? "gold" : "danger"} /> : null}
            {showValues ? <Text x={xs[i]} y={v > 0 ? top - 9 : v < 0 ? top + h + 9 : zeroY - 9} text={num(Math.round(v * 10) / 10)} size={10.5} mono tone={v > 0 ? "gold" : v < 0 ? "danger" : "muted"} /> : null}
          </In>
        );
      })}
    </>
  );
}

/** A large operator sign between two grids: ∗, =, +, −, ×. */
export function Op({ x, y, sign, d = 0 }: { x: number; y: number; sign: string; d?: number }) {
  return <Text x={x} y={y} text={sign} size={22} tone="muted" weight={500} d={d} />;
}
