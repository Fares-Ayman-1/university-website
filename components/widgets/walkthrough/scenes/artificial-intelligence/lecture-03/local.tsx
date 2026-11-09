"use client";

import { placeMap, thousands, ucsRoads, type PlacedTree } from "@/lib/widgets/ai-lecture-03";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Fade, In, Text, type L, type LineTone, type Pt, type TextTone, type Tone } from "../../../primitives";
import w from "../../../../Walkthrough.module.css";

/*
 * Drawing pieces for Artificial Intelligence · Lecture 3 that the shared primitives don't
 * have: a search tree whose nodes light up in visit order, a fringe table, a row of fringe
 * cells, and a power such as b^(d+1) with a raised exponent.
 */

export type TreeLight = { id: string; d: number; tone: Tone; dashed?: boolean };

/** A node pill's width for its label. */
export const pillWidth = (label: string, size: number, min: number) => Math.max(min, label.length * size * 0.62 + 14);

/**
 * A search tree from placeTree(). Every node is first drawn in its `base` tone; `lights`
 * then fade an opaque copy on top in another tone (visited, goal, skipped…) at their own
 * delays, so the tree lights up in visit order. `badges` number the nodes; `hide` leaves
 * nodes (and their edges) out, `ghost` draws them dashed and muted (cut off or dropped).
 */
export function TreeView({
  tree,
  nw = 30,
  nh = 24,
  size = 11.5,
  base,
  lights = [],
  badges = [],
  hide,
  ghost,
  edge,
  d = 0,
}: {
  tree: PlacedTree;
  nw?: number;
  nh?: number;
  size?: number;
  base?: (id: string) => Tone;
  lights?: readonly TreeLight[];
  badges?: readonly { id: string; n: number | string; d: number; tone?: Tone }[];
  hide?: (id: string) => boolean;
  ghost?: (id: string) => boolean;
  edge?: (from: string, to: string) => LineTone;
  d?: number;
}) {
  const shown = tree.nodes.filter((n) => !hide?.(n.id));
  const pill = (id: string) => pillWidth(tree.byId[id].label, size, nw);
  return (
    <>
      {tree.edges
        .filter(([a, b]) => !hide?.(a) && !hide?.(b))
        .map(([a, b]) => {
          const p = tree.byId[a];
          const c = tree.byId[b];
          const faded = ghost?.(b);
          return (
            <Arrow
              key={`${a}-${b}`}
              pts={[
                [p.x, p.y + nh / 2],
                [c.x, c.y - nh / 2],
              ]}
              tone={edge?.(a, b) ?? "faint"}
              head={false}
              dashed={faded}
              d={d + c.depth * 90}
              dur={260}
            />
          );
        })}
      {shown.map((n) => {
        const faded = ghost?.(n.id);
        return (
          <Box
            key={n.id}
            x={n.x - pill(n.id) / 2}
            y={n.y - nh / 2}
            w={pill(n.id)}
            h={nh}
            r={nh / 2}
            label={n.label}
            tone={faded ? "muted" : (base?.(n.id) ?? "outline")}
            dashed={faded}
            size={size}
            d={d + n.depth * 90}
          />
        );
      })}
      {lights
        .filter((l) => !hide?.(l.id))
        .map((l, i) => {
          const n = tree.byId[l.id];
          return (
            <Fade key={`${l.id}-${i}`} d={l.d}>
              <Box x={n.x - pill(l.id) / 2} y={n.y - nh / 2} w={pill(l.id)} h={nh} r={nh / 2} label={n.label} tone={l.tone} dashed={l.dashed} size={size} />
            </Fade>
          );
        })}
      {badges
        .filter((b) => !hide?.(b.id))
        .map((b) => {
          const n = tree.byId[b.id];
          const s = 15;
          return (
            <Fade key={`badge-${b.id}`} d={b.d}>
              <Box x={n.x + pill(b.id) / 2 - s + 4} y={n.y - nh / 2 - s + 5} w={s} h={s} r={s / 2} label={String(b.n)} tone={b.tone ?? "gold"} size={8.5} />
            </Fade>
          );
        })}
    </>
  );
}

/**
 * The fringe as a table: one row per step, the node removed and what the fringe holds
 * afterwards (front first). Rows appear `stagger` ms apart, the header at `d`; row i
 * (0-based) appears at d + (i + 1) · stagger, so a tree can light up in step.
 */
export function FringeTable({
  x,
  y,
  rows,
  cw,
  rh = 20,
  size = 10.5,
  d = 0,
  stagger = 300,
  head = ["node", "fringe"],
  headH,
  tone,
}: {
  x: number;
  y: number;
  rows: readonly (readonly string[])[];
  cw: readonly number[];
  rh?: number;
  size?: number;
  d?: number;
  stagger?: number;
  /** Column heads: code names (mono) or Bi words, which need `headH` ≥ 44 */
  head?: readonly L[];
  headH?: number;
  tone?: (r: number, c: number) => Tone | undefined;
}) {
  const xs = cw.map((_, i) => x + cw.slice(0, i).reduce((s, v) => s + v, 0));
  const hh = headH ?? rh;
  return (
    <>
      <In d={d}>
        {head.map((h, c) => (
          <Box key={c} x={xs[c]} y={y} w={cw[c]} h={hh} r={0} label={h} tone="navy" size={size} mono={typeof h === "string"} />
        ))}
      </In>
      {rows.map((row, r) => (
        <In key={r} d={d + (r + 1) * stagger}>
          {row.map((v, c) => (
            <Box key={c} x={xs[c]} y={y + hh + rh * r} w={cw[c]} h={rh} r={0} label={v} tone={tone?.(r, c) ?? "outline"} size={size} mono />
          ))}
        </In>
      ))}
    </>
  );
}

/** Fixed-width cells in a row (a queue, a stack, a heap), each with a name and an optional second line. */
export function Cells({
  x,
  y,
  items,
  cw = 70,
  ch = 40,
  gap = 6,
  tone,
  size = 11.5,
  d = 0,
  stagger = 90,
}: {
  x: number;
  y: number;
  items: readonly { label: string; sub?: string }[];
  cw?: number;
  ch?: number;
  gap?: number;
  tone?: (i: number) => Tone | undefined;
  size?: number;
  d?: number;
  stagger?: number;
}) {
  return (
    <>
      {items.map((it, i) => (
        <Box key={i} x={x + i * (cw + gap)} y={y} w={cw} h={ch} r={6} label={it.label} sub={it.sub} tone={tone?.(i) ?? "outline"} size={size} subSize={10} d={d + i * stagger} />
      ))}
    </>
  );
}

/**
 * Maths with raised exponents: `parts` is a list of [text, exponent?] pieces, so
 * [["O(b", "d+1"], [")"]] draws O(b^(d+1)). `x` is the left edge unless anchored.
 */
export function Expr({
  x,
  y,
  parts,
  size = 13,
  tone = "heading",
  anchor = "start",
  d,
}: {
  x: number;
  y: number;
  parts: readonly (readonly [string, string?])[];
  size?: number;
  tone?: TextTone;
  anchor?: "start" | "middle";
  d?: number;
}) {
  const width = parts.reduce((s, [t, e]) => s + t.length + (e ? e.length * 0.68 : 0), 0) * size * 0.6;
  const left = anchor === "middle" ? x - width / 2 : x;
  const raise = size * 0.4;
  const body = (
    <text x={left} y={y} dominantBaseline="central" fontSize={size} fontWeight={600} className={`${w.t} ${tone === "text" ? "" : w[tone]}`}>
      {parts.map(([t, e], i) => (
        <tspan key={i}>
          <tspan dy={i > 0 && parts[i - 1][1] ? raise : 0} fontSize={size}>
            {t}
          </tspan>
          {e ? (
            <tspan dy={-raise} fontSize={size * 0.72}>
              {e}
            </tspan>
          ) : null}
        </tspan>
      ))}
    </text>
  );
  return d === undefined ? body : <In d={d}>{body}</In>;
}

/** A power with a raised exponent: Pow base="O(b" exp="d+1" after=")" draws O(b^(d+1)). */
export function Pow({ base, exp, after, ...rest }: { x: number; y: number; base: string; exp?: string; after?: string; size?: number; tone?: TextTone; anchor?: "start" | "middle"; d?: number }) {
  return <Expr {...rest} parts={after ? [[base, exp], [after]] : [[base, exp]]} />;
}

/** The end of the segment p → q where it leaves a w × h box centred on q (or on p, from the start). */
function clip(p: Pt, q: Pt, hw: number, hh: number, gap = 2): Pt {
  const dx = q[0] - p[0];
  const dy = q[1] - p[1];
  const t = Math.min(dx ? (hw + gap) / Math.abs(dx) : Infinity, dy ? (hh + gap) / Math.abs(dy) : Infinity);
  return [Math.round((q[0] - dx * t) * 10) / 10, Math.round((q[1] - dy * t) * 10) / 10];
}

/**
 * The Sibiu → Bucharest map (UCS_MAP) placed in `box`: one-way roads labelled with their
 * length (or 1), towns numbered in expansion `order`, the returned `path` in gold and an
 * `alt` path dashed green. `g` adds a path-cost line under a town.
 */
export function MapView({
  box = { x: 70, y: 70, w: 420, h: 150 },
  costs,
  order = [],
  path = [],
  alt,
  g,
  size = 11.5,
  d = 0,
  step = 300,
  start,
}: {
  box?: { x: number; y: number; w: number; h: number };
  costs: "km" | "unit";
  order?: readonly string[];
  path?: readonly string[];
  alt?: readonly string[];
  g?: Readonly<Record<string, number>>;
  size?: number;
  d?: number;
  step?: number;
  /** When the first town in `order` lights up (default d + step); the rest follow `step` apart */
  start?: number;
}) {
  const at = placeMap(box);
  const lightAt = (i: number) => (start ?? d + step) + i * step;
  const nh = g ? 40 : 30;
  const nw = (id: string) => pillWidth(id, size, 60);
  const onPath = (list: readonly string[] | undefined, a: string, b: string) => !!list && list.some((v, i) => v === a && list[i + 1] === b);
  const roads = ucsRoads();
  const done = lightAt(order.length - 1) + 300;
  return (
    <>
      {roads.map((r, i) => {
        const p: Pt = [at[r.from].x, at[r.from].y];
        const q: Pt = [at[r.to].x, at[r.to].y];
        const a = clip(q, p, nw(r.from) / 2, nh / 2);
        const b = clip(p, q, nw(r.to) / 2, nh / 2, 4);
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
        const mid: Pt = [(p[0] + q[0]) / 2 + ((q[1] - p[1]) / len) * 14, (p[1] + q[1]) / 2 - ((q[0] - p[0]) / len) * 14];
        return (
          <g key={i}>
            <Arrow pts={[a, b]} tone="faint" d={d + 100 + i * 60} dur={300} label={costs === "km" ? String(r.km) : "1"} labelAt={mid} labelTone="muted" />
            {onPath(alt, r.from, r.to) ? <Arrow pts={[a, b]} tone="success" dashed d={done + 400} /> : null}
            {onPath(path, r.from, r.to) ? <Arrow pts={[a, b]} tone="gold" width={2.6} d={done} /> : null}
          </g>
        );
      })}
      {Object.entries(at).map(([id, pos]) => (
        <Box key={id} x={pos.x - nw(id) / 2} y={pos.y - nh / 2} w={nw(id)} h={nh} r={nh / 2} label={id} sub={g && id in g ? `g = ${g[id]}` : undefined} tone="outline" size={size} subSize={10} d={d} />
      ))}
      {order.map((id, i) => {
        const pos = at[id];
        const last = i === order.length - 1;
        return (
          <Fade key={id} d={lightAt(i)}>
            <Box x={pos.x - nw(id) / 2} y={pos.y - nh / 2} w={nw(id)} h={nh} r={nh / 2} label={id} sub={g && id in g ? `g = ${g[id]}` : undefined} tone={last ? "success" : "navy"} size={size} subSize={10} />
            <Box x={pos.x + nw(id) / 2 - 11} y={pos.y - nh / 2 - 10} w={15} h={15} r={7.5} label={String(i + 1)} tone="gold" size={8.5} />
          </Fade>
        );
      })}
    </>
  );
}

/**
 * Nodes per depth as bars on one shared scale (`max`), each with its count printed above it
 * ("—" for an empty level), the depths underneath and a "depth" caption.
 */
export function DepthBars({
  values,
  max,
  first = 1,
  tone,
  box = { x: 70, y: 70, w: 440, h: 140 },
  d = 100,
}: {
  values: readonly number[];
  max: number;
  first?: number;
  tone?: (i: number) => Tone | undefined;
  box?: { x: number; y: number; w: number; h: number };
  d?: number;
}) {
  const slot = box.w / values.length;
  return (
    <>
      <Bars x={box.x} y={box.y} w={box.w} h={box.h} values={values} max={max} labels={values.map((_, i) => `${i + first}`)} barTone={(i) => tone?.(i) ?? "slate"} d={d} stagger={140} />
      {values.map((v, i) => (
        <Text key={i} x={box.x + i * slot + slot / 2} y={box.y + box.h - (v / max) * box.h - 10} text={v ? thousands(v) : "—"} size={10.5} mono tone={tone?.(i) === "danger" ? "danger" : "heading"} d={d + 250 + i * 140} />
      ))}
      <Text x={box.x + box.w / 2} y={box.y + box.h + 30} text={bi("depth", "العمق")} tone="muted" size={10.5} d={d} />
    </>
  );
}
