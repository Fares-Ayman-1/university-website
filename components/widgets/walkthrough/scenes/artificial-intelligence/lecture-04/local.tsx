"use client";

import { cityName, type Board as Tiles } from "@/lib/widgets/ai-lecture-02";
import { CITIES, GOAL, fringeBefore, initial, roads, type BestFirstRun, type FringeNode } from "@/lib/widgets/ai-lecture-04";
import { bi as biText, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, In, Svg, Text, type L, type LineTone, type Pt, type TextTone, type Tone } from "../../../primitives";
import w from "../../../../Walkthrough.module.css";

/*
 * Drawing pieces for Artificial Intelligence · Lecture 4 that the shared primitives don't
 * have: the Romania map with its 20 cities drawn as initials (the cities' initials are all
 * different), a fringe list, an 8-puzzle board, and maths with raised exponents.
 */

/*
 * SVG text gets no <bdi>, so inside an Arabic line an English stretch ending in a neutral
 * character ("A*", "C > C*", "h*(n)") would have that character jump to the wrong end. This
 * `bi` isolates each English stretch of the Arabic with U+2066 … U+2069 (first-strong
 * isolate), the same stretches components/mdx/Arabic.tsx wraps in <bdi> for HTML text.
 */
const ARABIC_STRETCH = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿«»]+(?:\s+[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿«»]+)*/g;
const LRI = "⁦";
const PDI = "⁩";

function isolateRuns(text: string): string {
  let out = "";
  let last = 0;
  const latin = (segment: string) => {
    // Sentence punctuation and spaces at either end stay outside, so they follow the Arabic.
    const [, lead, core, trail] = /^([\s.,:;!?]*)(.*?)([\s.,:;!?]*)$/s.exec(segment)!;
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

/** Lecture 2's map grid (0–100): the same layout as the page's <WeightedGraph>. */
const GRID: Readonly<Record<string, Pt>> = {
  Oradea: [17, 4],
  Zerind: [11, 17],
  Arad: [5, 32],
  Timisoara: [6, 60],
  Lugoj: [26, 70],
  Mehadia: [27, 83],
  Dobreta: [25, 96],
  Craiova: [48, 98],
  Sibiu: [33, 44],
  Rimnicu_Vilcea: [38, 60],
  Fagaras: [55, 45],
  Pitesti: [58, 72],
  Bucharest: [78, 82],
  Giurgiu: [72, 98],
  Urziceni: [88, 74],
  Hirsova: [99, 74],
  Eforie: [100, 96],
  Vaslui: [93, 48],
  Iasi: [85, 30],
  Neamt: [70, 20],
};

export type MapBox = { x: number; y: number; w: number; h: number };
/** The map beside a side list (x 36–296). */
export const SIDE_MAP: MapBox = { x: 40, y: 66, w: 256, h: 182 };
/** The map across the whole scene. */
export const WIDE_MAP: MapBox = { x: 70, y: 62, w: 420, h: 184 };

export const placeCity = (box: MapBox, city: string): Pt => [box.x + (GRID[city][0] / 100) * box.w, box.y + (GRID[city][1] / 100) * box.h];

/** A city as a list prints it: "Rimnicu_Vilcea" → "Rimnicu V." */
export const shortName = (city: string) => (city === "Rimnicu_Vilcea" ? "Rimnicu V." : cityName(city));

/** Where an order badge sits relative to a city's centre, chosen so it misses the roads. */
const BADGE_AT: Readonly<Record<string, Pt>> = { Arad: [-13, 0], Zerind: [13, 0], Bucharest: [9, 10], Craiova: [13, 0], Mehadia: [13, 0], Dobreta: [-13, 0] };
const badgeOffset = (city: string, r: number): Pt => BADGE_AT[city] ?? [r * 0.9, -r - 2];

/** The segment p → q shortened by `a` at p and `b` at q, so it meets two circles' edges. */
export function trim(p: Pt, q: Pt, a: number, b: number): [Pt, Pt] {
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
  const ux = (q[0] - p[0]) / len;
  const uy = (q[1] - p[1]) / len;
  return [
    [p[0] + ux * a, p[1] + uy * a],
    [q[0] - ux * b, q[1] - uy * b],
  ];
}

export type MapLine = { path: readonly string[]; tone: LineTone; d: number; dashed?: boolean; width?: number };

/**
 * The Romania road map in `box`: every road as a faint line, the cities as circles holding
 * their initials, then `lines` (search-tree edges, a route) drawn over the roads, and order
 * `badges`. `look` picks a city's tone; `show` leaves cities (and their roads) out.
 */
export function RomaniaMap({
  box,
  r = 9,
  size = 10.5,
  look,
  badges = [],
  lines = [],
  show,
  d = 0,
  roadsD,
  withRoads = true,
}: {
  box: MapBox;
  r?: number;
  size?: number;
  look?: (city: string) => Tone | undefined;
  badges?: readonly { city: string; n: string | number; d: number; tone?: Tone }[];
  lines?: readonly MapLine[];
  show?: (city: string) => boolean;
  d?: number;
  /** When the plain roads appear (default d) */
  roadsD?: number;
  /** Draw the plain roads (default true) */
  withRoads?: boolean;
}) {
  const at = (c: string) => placeCity(box, c);
  const shown = (c: string) => show?.(c) ?? true;
  const rd = roadsD ?? d;
  return (
    <>
      {(withRoads ? roads() : [])
        .filter((x) => shown(x.from) && shown(x.to))
        .map((x, i) => {
          const [a, b] = trim(at(x.from), at(x.to), r, r);
          return <Arrow key={`${x.from}-${x.to}`} pts={[a, b]} tone="faint" head={false} d={rd + i * 15} dur={260} />;
        })}
      {lines.flatMap((l, li) =>
        l.path.slice(1).map((c, i) => {
          const [a, b] = trim(at(l.path[i]), at(c), r + 1, r + 1);
          return <Arrow key={`${li}-${i}`} pts={[a, b]} tone={l.tone} head={false} dashed={l.dashed} width={l.width ?? 2.6} d={l.d + i * 160} dur={260} />;
        }),
      )}
      {CITIES.filter(shown).map((c) => {
        const [x, y] = at(c);
        return <Box key={c} x={x - r} y={y - r} w={2 * r} h={2 * r} r={r} label={initial(c)} tone={look?.(c) ?? "outline"} size={size} d={d} />;
      })}
      {badges.map((b) => {
        const [x, y] = at(b.city);
        const [dx, dy] = badgeOffset(b.city, r);
        const s = 13;
        return (
          <Fade key={`badge-${b.city}`} d={b.d}>
            <Box x={x + dx - s / 2} y={y + dy - s / 2} w={s} h={s} r={s / 2} label={String(b.n)} tone={b.tone ?? "gold"} size={8} />
          </Fade>
        );
      })}
    </>
  );
}

/** The cities a best-first run has removed after k steps, in first-removal order. */
export const removedAfter = (run: BestFirstRun, k: number) => [...new Set(run.steps.slice(0, k).map((s) => s.removed.city))];

/** Search-tree edges generated in the first k steps of a run, as two-city paths. */
export const treeEdgesAfter = (run: BestFirstRun, k: number): string[][] =>
  run.steps.slice(0, k).flatMap((s) => s.added.map((n) => [s.removed.city, n.city]));

/** The map look of step k of a run: expanded navy, the next node out gold (green when it is the goal), the rest of the fringe slate. */
export function stepLook(run: BestFirstRun, k: number, goal: string): (city: string) => Tone {
  const done = new Set(removedAfter(run, k));
  const fringe = fringeBefore(run, k);
  const front = fringe[0]?.city;
  const waiting = new Set(fringe.map((n) => n.city));
  return (c) => (c === front ? (c === goal ? "success" : "gold") : done.has(c) ? "navy" : waiting.has(c) ? "slate" : "muted");
}

/**
 * A fringe as a list, front first: one row per node with its cells (name, numbers…). The front
 * row is gold (or green for a goal); `mark` can pick other rows' tone.
 */
export function FringeList({
  x,
  y,
  head,
  rows,
  cw,
  rh = 18,
  headH = 20,
  size = 10,
  frontTone = "gold",
  mark,
  d = 0,
  stagger = 50,
}: {
  x: number;
  y: number;
  head: readonly L[];
  rows: readonly (readonly string[])[];
  cw: readonly number[];
  rh?: number;
  headH?: number;
  size?: number;
  frontTone?: Tone;
  mark?: (r: number) => Tone | undefined;
  d?: number;
  stagger?: number;
}) {
  const xs = cw.map((_, i) => x + cw.slice(0, i).reduce((s, v) => s + v, 0));
  return (
    <>
      <In d={d}>
        {head.map((h, c) => (
          <Box key={c} x={xs[c]} y={y} w={cw[c]} h={headH} r={0} label={h} tone="navy" size={size} mono={typeof h === "string"} />
        ))}
      </In>
      {rows.map((row, r) => (
        <In key={r} d={d + (r + 1) * stagger}>
          {row.map((v, c) => (
            <Box key={c} x={xs[c]} y={y + headH + rh * r} w={cw[c]} h={rh} r={0} label={v} tone={r === 0 ? frontTone : (mark?.(r) ?? "outline")} size={size} mono />
          ))}
        </In>
      ))}
    </>
  );
}

/** A fringe node as list cells: name and f (greedy: h) or name, g + h and f (A*). */
export const fringeCells = (n: FringeNode, kind: "h" | "f") => (kind === "h" ? [shortName(n.city), String(n.h)] : [shortName(n.city), `${n.g} + ${n.h}`, String(n.f)]);

/** An n-puzzle board, row by row (0 is the blank). `tone` picks a tile's tone by its position. */
export function Board({ x, y, tiles, size = 3, cell = 40, tone, d }: { x: number; y: number; tiles: Tiles; size?: number; cell?: number; tone?: (i: number) => Tone | undefined; d?: number }) {
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
          tone={t === 0 ? "muted" : (tone?.(i) ?? "outline")}
          size={Math.max(8, cell * 0.4)}
          mono
        />
      ))}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** The centre of cell `i` on a board drawn at (x, y). */
export const cellCentre = (x: number, y: number, i: number, size = 3, cell = 40): Pt => [x + (i % size) * cell + cell / 2, y + Math.floor(i / size) * cell + cell / 2];

/**
 * Maths with raised exponents: `parts` is a list of [text, exponent?] pieces, so
 * [["O(b", "m"], [")"]] draws O(b^m). `x` is the left edge unless anchored in the middle.
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

/** A small legend entry: a swatch in a tone and its words. */
export function Key({ x, y, tone, text, d }: { x: number; y: number; tone: Tone; text: L; d?: number }) {
  return (
    <>
      <Box x={x} y={y - 6} w={12} h={12} r={6} tone={tone} d={d} />
      <Text x={x + 17} y={y} text={text} anchor="start" size={10} tone="muted" d={d} />
    </>
  );
}

/** One step of a best-first run on the map, with its fringe listed beside it. */
export function RunStep({ run, k, kind, routeCost }: { run: BestFirstRun; k: number; kind: "h" | "f"; routeCost: number }) {
  const fringe = fringeBefore(run, k);
  const done = removedAfter(run, k);
  const final = fringe[0]?.city === GOAL;
  const rows = fringe.map((n) => fringeCells(n, kind));
  const cw = kind === "h" ? [110, 54] : [96, 78, 44];
  const rh = kind === "h" ? 18 : 16;
  return (
    <Svg>
      <RomaniaMap
        box={SIDE_MAP}
        look={stepLook(run, k, GOAL)}
        lines={[
          ...treeEdgesAfter(run, k).map((p, i) => ({ path: p, tone: "navy" as const, d: 300 + i * 40, width: 1.6 })),
          ...(final ? [{ path: fringe[0].path, tone: "gold" as const, d: 900 }] : []),
        ]}
        badges={done.map((c, i) => ({ city: c, n: i + 1, d: 200 + i * 120 }))}
      />
      <Text x={328} y={46} text={kind === "h" ? bi("fringe, lowest h first", "الحافة، الأقل h أولًا") : bi("fringe, lowest f first", "الحافة، الأقل f أولًا")} anchor="start" tone="muted" size={10.5} d={0} />
      <FringeList x={328} y={72} head={kind === "h" ? ["n", "h"] : ["n", "g + h", "f"]} headH={18} rows={rows} cw={cw} rh={rh} size={kind === "h" ? 10.5 : 10} frontTone={final ? "success" : "gold"} d={300} stagger={60} />
      {final ? <Chip x={220} y={48} text={bi(`goal ✓ ${routeCost} km`, `الهدف ✓ ${routeCost} km`)} tone="success" center size={11} d={1300} /> : null}
    </Svg>
  );
}
