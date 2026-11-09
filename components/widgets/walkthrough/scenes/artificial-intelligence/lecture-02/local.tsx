"use client";

import { vacuumState, type Board as Tiles } from "@/lib/widgets/ai-lecture-02";
import { Box, In, Text, type LineTone, type Pt, type Tone } from "../../../primitives";

/*
 * Drawing pieces shared by the Lecture 2 scenes (problem solving): a two-square vacuum world
 * in one of its 8 states, an n-puzzle board, and plain strokes and dots for custom shapes.
 */

export const FILL: Record<LineTone, string> = {
  gold: "var(--gold)",
  navy: "var(--heading)",
  slate: "var(--slate)",
  danger: "var(--danger)",
  success: "var(--success)",
  muted: "var(--muted)",
  faint: "var(--border-strong)",
};

/**
 * A vacuum world: squares A and B (each `cw` × `ch`), the robot as a disc in its square and
 * dirt as specks. `goal` draws it in the success tone; `unknownB` hides square B behind a "?"
 * (the agent only senses its own square).
 */
export function Vac({ x, y, n, cw = 36, ch = 28, goal, unknownB, d }: { x: number; y: number; n: number; cw?: number; ch?: number; goal?: boolean; unknownB?: boolean; d?: number }) {
  const s = vacuumState(n);
  const tone: Tone = goal ? "success" : "outline";
  const r = Math.max(2.6, ch * 0.24);
  const speck = Math.max(1.2, ch * 0.075);
  const dirt = (sx: number) =>
    [
      [0.64, 0.34],
      [0.8, 0.56],
      [0.6, 0.72],
    ].map(([fx, fy], i) => <circle key={i} cx={sx + cw * fx} cy={y + ch * fy} r={speck} style={{ fill: "var(--gold-text)" }} />);
  const rx = (s.robot === "A" ? x : x + cw) + cw * 0.3;
  const g = (
    <>
      <Box x={x} y={y} w={cw} h={ch} r={3} tone={tone} />
      <Box x={x + cw} y={y} w={cw} h={ch} r={3} tone={unknownB ? "muted" : tone} />
      {s.dirtA ? dirt(x) : null}
      {unknownB ? <Text x={x + cw * (s.robot === "B" ? 1.7 : 1.5)} y={y + ch / 2} text="?" size={Math.max(11, ch * 0.5)} tone="muted" /> : s.dirtB ? dirt(x + cw) : null}
      <circle cx={rx} cy={y + ch / 2} r={r} style={{ fill: "var(--slate)", stroke: "var(--surface)", strokeWidth: 1.2 }} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** An n-puzzle board, row by row (0 is the blank). `tone` picks a tile's tone by its number. */
export function Board({ x, y, tiles, size = 3, cell = 40, tone, d }: { x: number; y: number; tiles: Tiles; size?: number; cell?: number; tone?: (tile: number) => Tone | undefined; d?: number }) {
  const g = (
    <>
      {tiles.map((t, i) => (
        <Box
          key={i}
          x={x + (i % size) * cell}
          y={y + Math.floor(i / size) * cell}
          w={cell}
          h={cell}
          r={Math.min(4, cell / 6)}
          label={t ? String(t) : undefined}
          tone={t === 0 ? "muted" : (tone?.(t) ?? "outline")}
          size={Math.max(8, cell * 0.42)}
          mono
        />
      ))}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** The centre of cell `i` on a board drawn at (x, y). */
export const cellCentre = (x: number, y: number, i: number, size = 3, cell = 40): Pt => [x + (i % size) * cell + cell / 2, y + Math.floor(i / size) * cell + cell / 2];

/** A plain stroke along `pts` (no draw-in animation), e.g. a robot link. */
export function Stroke({ pts, tone = "slate", width = 2, dashed, round, d }: { pts: readonly Pt[]; tone?: LineTone; width?: number; dashed?: boolean; round?: boolean; d?: number }) {
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const g = (
    <path
      d={path}
      style={{ fill: "none", stroke: FILL[tone], strokeWidth: width, strokeLinecap: round ? "round" : "butt", strokeLinejoin: "round", strokeDasharray: dashed ? "4 4" : undefined }}
    />
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A filled dot, e.g. one real state or a joint. */
export function Dot({ at, r = 5, tone = "slate", ring, d }: { at: Pt; r?: number; tone?: LineTone; ring?: boolean; d?: number }) {
  const g = (
    <circle
      cx={at[0]}
      cy={at[1]}
      r={r}
      style={ring ? { fill: "var(--surface)", stroke: FILL[tone], strokeWidth: 2.4 } : { fill: FILL[tone], stroke: "var(--surface)", strokeWidth: 1.2 }}
    />
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A point at `len` from `from`, at `deg` degrees above the horizontal (SVG y grows downwards). */
export const polar = (from: Pt, len: number, deg: number): Pt => [from[0] + len * Math.cos((deg * Math.PI) / 180), from[1] - len * Math.sin((deg * Math.PI) / 180)];

/** Points of an arc around `c` from `a0` to `a1` degrees. */
export const arcPts = (c: Pt, r: number, a0: number, a1: number, n = 24): Pt[] => Array.from({ length: n + 1 }, (_, i) => polar(c, r, a0 + ((a1 - a0) * i) / n));
