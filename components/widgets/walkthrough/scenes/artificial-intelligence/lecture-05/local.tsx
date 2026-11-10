"use client";

import type { Inner } from "@/lib/widgets/ai-lecture-05";
import { isLeaf } from "@/lib/widgets/ai-lecture-05";
import { Arrow, Box, In, Mark, Text, type LineTone, type Pt, type Tone } from "../../../primitives";
import w from "../../../../Walkthrough.module.css";

/*
 * Game-tree pieces for Lecture 5: MAX nodes are triangles pointing up (▲), MIN nodes point
 * down (▽), chance nodes are circles, terminal states are small boxes with their utility.
 */

function NodeText({ x, y, label, tone, size }: { x: number; y: number; label: string; tone: Tone; size: number }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight={700} className={`${w.bt} ${w[tone]} ${w.mono}`}>
      {label}
    </text>
  );
}

/** A MAX node (▲) centred on (x, y). Edges leave from (x, y + 0.85s) and arrive at (x, y − s). */
export function MaxNode({ x, y, s = 20, label, tone = "outline", dashed, size = 12, d }: { x: number; y: number; s?: number; label?: string; tone?: Tone; dashed?: boolean; size?: number; d?: number }) {
  const pts = `${x},${y - s} ${x - 1.15 * s},${y + 0.85 * s} ${x + 1.15 * s},${y + 0.85 * s}`;
  const g = (
    <>
      <polygon points={pts} className={w.under} />
      <polygon points={pts} className={`${w.shape} ${w[tone]} ${dashed ? w.dashed : ""}`} style={{ strokeLinejoin: "round" }} />
      {label ? <NodeText x={x} y={y + 0.32 * s} label={label} tone={tone} size={size} /> : null}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A MIN node (▽) centred on (x, y). Edges arrive at (x, y − 0.85s) and leave from (x, y + s). */
export function MinNode({ x, y, s = 20, label, tone = "outline", dashed, size = 12, d }: { x: number; y: number; s?: number; label?: string; tone?: Tone; dashed?: boolean; size?: number; d?: number }) {
  const pts = `${x - 1.15 * s},${y - 0.85 * s} ${x + 1.15 * s},${y - 0.85 * s} ${x},${y + s}`;
  const g = (
    <>
      <polygon points={pts} className={w.under} />
      <polygon points={pts} className={`${w.shape} ${w[tone]} ${dashed ? w.dashed : ""}`} style={{ strokeLinejoin: "round" }} />
      {label ? <NodeText x={x} y={y - 0.32 * s} label={label} tone={tone} size={size} /> : null}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A chance node: a circle, for an opponent treated like the weather. */
export function ChanceNode({ x, y, r = 17, label, tone = "slate", size = 12, d }: { x: number; y: number; r?: number; label?: string; tone?: Tone; size?: number; d?: number }) {
  const g = (
    <>
      <circle cx={x} cy={y} r={r} className={w.under} />
      <circle cx={x} cy={y} r={r} className={`${w.shape} ${w[tone]}`} />
      {label ? <NodeText x={x} y={y} label={label} tone={tone} size={size} /> : null}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A terminal state: a small box with its utility for MAX, centred on (x, y). */
export function LeafNode({ x, y, label, tone = "outline", dashed, w: lw = 34, h = 26, size = 12, d }: { x: number; y: number; label?: string; tone?: Tone; dashed?: boolean; w?: number; h?: number; size?: number; d?: number }) {
  return <Box x={x - lw / 2} y={y - h / 2} w={lw} h={h} r={6} label={label} tone={tone} dashed={dashed} size={size} mono d={d} />;
}

/** α and β stacked next to a node; `anchor` "end" puts them on its left. */
export function AlphaBeta({ x, y, alpha, beta, anchor = "end", d }: { x: number; y: number; alpha: string; beta: string; anchor?: "start" | "end"; d?: number }) {
  return (
    <>
      <Text x={x} y={y - 8} text={`α ${alpha}`} anchor={anchor} size={10.5} tone="slate" mono d={d} />
      <Text x={x} y={y + 8} text={`β ${beta}`} anchor={anchor} size={10.5} tone="slate" mono d={d} />
    </>
  );
}

/* ---------- The worked example's layout: a MAX root, three MIN nodes, nine leaves ---------- */

export const G = {
  root: [310, 66] as Pt,
  minY: 144,
  minX: [150, 310, 470] as const,
  leafY: 226,
  leafDx: 46,
  s: 20,
} as const;

export const leafAt = (i: number, j: number): Pt => [G.minX[i] + (j - 1) * G.leafDx, G.leafY];
export const minAt = (i: number): Pt => [G.minX[i], G.minY];
/** Where an edge leaves the root towards MIN node i, and where it arrives. */
export const rootEdge = (i: number): [Pt, Pt] => [
  [G.root[0], G.root[1] + 0.85 * G.s],
  [G.minX[i], G.minY - 0.85 * G.s],
];
export const leafEdge = (i: number, j: number): [Pt, Pt] => [
  [G.minX[i], G.minY + G.s],
  [leafAt(i, j)[0], G.leafY - 13],
];

export type Look = { label?: string; tone?: Tone; dashed?: boolean };
export type EdgeLook = { tone?: LineTone; dashed?: boolean; cut?: boolean; width?: number };

/**
 * The two-ply tree drawn in the standard layout. `look` styles each node by id, `edge` each
 * edge by its child's id; `moves` labels MAX's moves a1–a3 and names the leaves underneath.
 */
export function Tree2({
  tree,
  look,
  edge,
  rootMoves,
  leafNames = true,
  rows = true,
  d = 0,
  stagger = 60,
}: {
  tree: Inner;
  look?: (id: string) => Look;
  edge?: (child: string) => EdgeLook;
  /** Labels for MAX's three moves, by MIN node id ("B" → "a1") */
  rootMoves?: Readonly<Record<string, string>>;
  leafNames?: boolean;
  rows?: boolean;
  d?: number;
  stagger?: number;
}) {
  const mins = tree.children.filter((c): c is Inner => !isLeaf(c));
  const L = (id: string): Look => look?.(id) ?? {};
  const E = (id: string): EdgeLook => edge?.(id) ?? {};
  return (
    <>
      {rows ? (
        <>
          <Text x={14} y={G.root[1]} text="MAX" anchor="start" size={11} tone="muted" d={d} />
          <Text x={14} y={G.minY} text="MIN" anchor="start" size={11} tone="muted" d={d} />
        </>
      ) : null}
      {mins.map((m, i) => {
        const [a, b] = rootEdge(i);
        const e = E(m.id);
        return (
          <g key={m.id}>
            <Arrow pts={[a, b]} tone={e.tone ?? "faint"} dashed={e.dashed} head={false} width={e.width} d={d + 100} dur={300} />
            {rootMoves?.[m.id] ? (
              <Text x={i === 0 ? (a[0] + b[0]) / 2 - 6 : i === 2 ? (a[0] + b[0]) / 2 + 6 : a[0] + 14} y={i === 1 ? (a[1] + b[1]) / 2 : (a[1] + b[1]) / 2 - 12} text={rootMoves[m.id]} anchor={i === 1 ? "start" : "middle"} size={10.5} tone="muted" mono d={d + 200} />
            ) : null}
            {e.cut ? <Mark x={(a[0] + b[0]) / 2} y={(a[1] + b[1]) / 2} ok={false} r={8} d={d + 300} /> : null}
            {m.children.map((c, j) => {
              const [p, q] = leafEdge(i, j);
              const le = E(c.id);
              return (
                <g key={c.id}>
                  <Arrow pts={[p, q]} tone={le.tone ?? "faint"} dashed={le.dashed} head={false} width={le.width} d={d + 200 + i * stagger} dur={260} />
                  {le.cut ? <Mark x={(p[0] + q[0]) / 2} y={(p[1] + q[1]) / 2 + 2} ok={false} r={8} d={d + 400 + i * stagger} /> : null}
                </g>
              );
            })}
          </g>
        );
      })}
      <MaxNode x={G.root[0]} y={G.root[1]} s={G.s} {...L(tree.id)} d={d} />
      {mins.map((m, i) => (
        <g key={m.id}>
          <MinNode x={G.minX[i]} y={G.minY} s={G.s} {...L(m.id)} d={d + 120 + i * stagger} />
          {m.children.map((c, j) => {
            const [x, y] = leafAt(i, j);
            return (
              <g key={c.id}>
                <LeafNode x={x} y={y} {...L(c.id)} d={d + 260 + (i * 3 + j) * (stagger / 2)} />
                {leafNames ? <Text x={x} y={y + 26} text={c.id} size={10.5} tone="muted" mono d={d + 300 + (i * 3 + j) * (stagger / 2)} /> : null}
              </g>
            );
          })}
        </g>
      ))}
    </>
  );
}

/* ---------- Boards ---------- */

/** A tic-tac-toe board: `cells` is nine characters, "X", "O" or "." for empty, row by row. */
export function Board({ x, y, cells, c = 22, numbers, tone = "outline", d }: { x: number; y: number; cells: string; c?: number; numbers?: boolean; tone?: Tone; d?: number }) {
  const g = (
    <>
      {[...cells].map((ch, i) => {
        const cx = x + (i % 3) * c;
        const cy = y + Math.floor(i / 3) * c;
        return (
          <g key={i}>
            <rect x={cx} y={cy} width={c} height={c} className={w.under} />
            <rect x={cx} y={cy} width={c} height={c} className={`${w.shape} ${w[tone]}`} />
            {ch !== "." ? (
              <text x={cx + c / 2} y={cy + c / 2} textAnchor="middle" dominantBaseline="central" fontSize={c * 0.62} fontWeight={700} className={`${w.t} ${ch === "X" ? w.heading : w.gold}`}>
                {ch}
              </text>
            ) : numbers ? (
              <text x={cx + c / 2} y={cy + c / 2} textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={600} className={`${w.t} ${w.muted} ${w.mono}`}>
                {i + 1}
              </text>
            ) : null}
          </g>
        );
      })}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A small chess board with a few pieces (letters), `c` units per square. */
export function ChessBoard({ x, y, c = 17, pieces, d }: { x: number; y: number; c?: number; pieces: readonly { sq: string; p: string; side: "w" | "b" }[]; d?: number }) {
  const at = (sq: string): Pt => [x + (sq.charCodeAt(0) - 97) * c, y + (8 - Number(sq[1])) * c];
  const g = (
    <>
      {Array.from({ length: 64 }, (_, i) => {
        const r = Math.floor(i / 8);
        const f = i % 8;
        return <rect key={i} x={x + f * c} y={y + r * c} width={c} height={c} className={`${w.shape} ${(r + f) % 2 ? w.muted : w.outline}`} style={{ strokeWidth: 0.6 }} />;
      })}
      {pieces.map(({ sq, p, side }) => {
        const [px, py] = at(sq);
        return (
          <text key={sq} x={px + c / 2} y={py + c / 2} textAnchor="middle" dominantBaseline="central" fontSize={c * 0.66} fontWeight={800} className={`${w.t} ${side === "w" ? w.gold : w.heading} ${w.mono}`}>
            {p}
          </text>
        );
      })}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A faint triangle hanging under (x, y): a subtree that is not searched. */
export function Subtree({ x, y, w: tw = 30, h = 26, tone = "muted", dashed = true, d }: { x: number; y: number; w?: number; h?: number; tone?: Tone; dashed?: boolean; d?: number }) {
  const pts = `${x},${y} ${x - tw / 2},${y + h} ${x + tw / 2},${y + h}`;
  const g = <polygon points={pts} className={`${w.shape} ${w[tone]} ${dashed ? w.dashed : ""}`} style={{ strokeLinejoin: "round" }} />;
  return d === undefined ? g : <In d={d}>{g}</In>;
}
