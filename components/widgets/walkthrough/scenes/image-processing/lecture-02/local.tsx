"use client";

import { Arrow, Bars, Curve, Fade, In, Pixels, Text, plotAt, type L, type LineTone, type PlotBox, type Pt, type Tone } from "../../../primitives";

/*
 * Drawing pieces shared by the Lecture 2 scenes (point processing): plot axes with tick
 * labels, an input → output mark on a transfer curve, and a before/after histogram pair
 * whose bars are joined by the mapping.
 */

const FILL: Record<LineTone, string> = {
  gold: "var(--gold)",
  navy: "var(--heading)",
  slate: "var(--slate)",
  danger: "var(--danger)",
  success: "var(--success)",
  muted: "var(--muted)",
  faint: "var(--border-strong)",
};

/** A round marker, e.g. a point on a curve. */
export function Dot({ at, tone = "gold", r = 4, d = 0 }: { at: Pt; tone?: LineTone; r?: number; d?: number }) {
  return (
    <Fade d={d}>
      <circle cx={at[0]} cy={at[1]} r={r} style={{ fill: FILL[tone], stroke: "var(--surface)", strokeWidth: 1.2 }} />
    </Fade>
  );
}

/** A tick: a data value, optionally printed as another label ("a", "b"…). */
export type Tick = number | readonly [number, string];
const tickOf = (t: Tick): [number, string] => (typeof t === "number" ? [t, String(t)] : [t[0], t[1]]);

/**
 * Both axes of a plot box, with tick labels at chosen data values (`xs` under the x-axis,
 * `ys` left of the y-axis, `ysRight` right of the plot) and short axis names.
 */
export function Axes({
  box,
  xs = [],
  ys = [],
  ysRight = [],
  xName,
  yName,
  d = 0,
}: {
  box: PlotBox;
  xs?: readonly Tick[];
  ys?: readonly Tick[];
  ysRight?: readonly Tick[];
  xName?: L;
  yName?: L;
  d?: number;
}) {
  const { x, y, w, h } = box;
  const [d0] = box.domain ?? [0, 1];
  const [r0] = box.range ?? [0, 1];
  return (
    <>
      <Arrow pts={[[x, y + h], [x + w + 12, y + h]]} tone="faint" d={d} dur={300} />
      <Arrow pts={[[x, y + h], [x, y - 12]]} tone="faint" d={d} dur={300} />
      <In d={d + 150}>
        {xs.map(tickOf).map(([v, label]) => {
          const [px, py] = plotAt(box, v, r0);
          return <Text key={`x${v}`} x={px} y={py + 12} text={label} size={10} tone="muted" weight={500} mono />;
        })}
        {ys.map(tickOf).map(([v, label]) => {
          const [px, py] = plotAt(box, d0, v);
          return <Text key={`y${v}`} x={px - 11} y={py} text={label} size={10} anchor="end" tone="muted" weight={500} mono />;
        })}
        {ysRight.map(tickOf).map(([v, label]) => {
          const [, py] = plotAt(box, d0, v);
          return <Text key={`r${v}`} x={x + w + 8} y={py} text={label} size={10} anchor="start" tone="gold" weight={500} mono />;
        })}
        {xName !== undefined ? <Text x={x + w + 18} y={y + h} text={xName} size={11.5} anchor="start" tone="muted" mono /> : null}
        {yName !== undefined ? <Text x={x} y={y - 22} text={yName} size={11.5} tone="muted" mono /> : null}
      </In>
    </>
  );
}

/** Input x on the x-axis, up to the curve at (x, y), across to y on the y-axis. */
export function MapMark({ box, x, y, tone = "gold", d = 0 }: { box: PlotBox; x: number; y: number; tone?: LineTone; d?: number }) {
  const [d0] = box.domain ?? [0, 1];
  const [r0] = box.range ?? [0, 1];
  const from = plotAt(box, x, r0);
  const at = plotAt(box, x, y);
  const to = plotAt(box, d0, y);
  return (
    <>
      <Arrow pts={[from, at, to]} tone={tone} dashed d={d} dur={400} />
      <Dot at={at} tone={tone} d={d + 100} />
    </>
  );
}

/**
 * A histogram before (top) and after (bottom) a point operation, with an arrow from every
 * occupied level i to its new level map[i]: bars move, keep their heights, and may merge.
 */
export function Remap({
  x,
  w,
  top,
  h,
  gap,
  before,
  map,
  max,
  tone = "gold",
  d = 0,
  labels,
  names,
}: {
  x: number;
  w: number;
  top: number;
  h: number;
  gap: number;
  before: readonly number[];
  map: readonly number[];
  max?: number;
  tone?: Tone;
  d?: number;
  /** Level labels under both histograms ("" to skip one); every level by default */
  labels?: readonly string[];
  /** Names left of the two histograms */
  names?: readonly [L, L];
}) {
  const L = before.length;
  const after = new Array<number>(L).fill(0);
  before.forEach((n, i) => (after[map[i]] += n));
  const top2 = top + h + gap;
  const slot = w / L;
  const cx = (i: number) => x + (i + 0.5) * slot;
  const tallest = max ?? Math.max(...before, ...after, 1);
  const marks = labels ?? before.map((_, i) => String(i));
  const used = before.flatMap((n, i) => (n ? [i] : []));
  return (
    <>
      {names ? (
        <>
          <Text x={8} y={top + h / 2} text={names[0]} anchor="start" size={11.5} tone="heading" d={d} />
          <Text x={8} y={top2 + h / 2} text={names[1]} anchor="start" size={11.5} tone="heading" d={d + 700} />
        </>
      ) : null}
      <Bars x={x} y={top} w={w} h={h} values={before} labels={marks} max={tallest} tone="slate" barTone={(i) => (before[i] ? tone : undefined)} d={d} stagger={40} />
      {used.map((i, k) => (
        <Arrow key={i} pts={[[cx(i), top + h + 19], [cx(map[i]), top2 - 3]]} tone="gold" d={d + 700 + k * 120} dur={380} />
      ))}
      <Bars x={x} y={top2} w={w} h={h} values={after} labels={marks} max={tallest} tone="slate" barTone={(i) => (after[i] ? tone : undefined)} d={d + 900 + used.length * 120} stagger={40} />
    </>
  );
}

/* ---------- The three-column layout: x, the transfer curve, y ---------- */

type Grid = readonly (readonly number[])[];

/** The plot box of the three-column scenes (arithmetic, complements). */
export const T_BOX: PlotBox = { x: 212, y: 72, w: 120, h: 120, domain: [0, 255], range: [0, 255] };

/**
 * The input image on the left, the transfer curve y = f(x) in the middle (drawn by
 * `children` on T_BOX, over the axes and the dashed identity line), and the result on the
 * right, with chosen pixels ringed.
 */
export function Transfer({
  input,
  output,
  title,
  outLabel,
  ring,
  d = 0,
  children,
}: {
  input: Grid;
  output: Grid;
  title: string;
  outLabel: string;
  ring?: (r: number, c: number) => LineTone | undefined;
  d?: number;
  children?: React.ReactNode;
}) {
  return (
    <>
      <Text x={80} y={54} text="x" size={13} mono tone="heading" d={d} />
      <Pixels x={20} y={72} values={input} cell={30} d={d} stagger={60} outline={ring} />
      <Text x={272} y={30} text={title} size={12.5} mono tone="gold" d={d + 300} />
      <Axes box={T_BOX} xs={[128, 255]} ys={[128, 255]} d={d + 300} />
      <Curve box={T_BOX} fn={(x) => x} tone="faint" dashed d={d + 300} />
      {children}
      <Text x={470} y={54} text={outLabel} size={12.5} mono tone="heading" d={d + 1500} />
      <Pixels x={410} y={72} values={output} cell={30} d={d + 1500} stagger={60} outline={ring} />
    </>
  );
}

/**
 * A linear y = f(x) drawn on T_BOX after clipping to 0–255: the straight part in gold, the
 * clipped (flat) parts in red.
 */
export function ClippedLine({ f, d = 0 }: { f: (x: number) => number; d?: number }) {
  const a = f(1) - f(0);
  const b = f(0);
  const knees = a === 0 ? [] : [(0 - b) / a, (255 - b) / a].filter((k) => k > 0 && k < 255).sort((p, q) => p - q);
  const xs = [0, ...knees, 255];
  const at = (x: number) => Math.min(255, Math.max(0, f(x)));
  return (
    <>
      {xs.slice(1).map((x1, i) => {
        const x0 = xs[i];
        const mid = f((x0 + x1) / 2);
        const clipped = mid < 0 || mid > 255;
        return (
          <Curve
            key={i}
            box={T_BOX}
            points={[
              [x0, at(x0)],
              [x1, at(x1)],
            ]}
            tone={clipped ? "danger" : "gold"}
            width={clipped ? 3 : 2.2}
            d={d + i * 250}
            dur={400}
          />
        );
      })}
    </>
  );
}

/** "γ = v" with a serif italic γ, so it can't be read as the axis name y. */
export function GammaLabel({ x, y, value, size = 13, tone = "gold", d = 0 }: { x: number; y: number; value: number; size?: number; tone?: "gold" | "heading"; d?: number }) {
  return (
    <Fade d={d}>
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={size} fontWeight={600} style={{ fill: tone === "gold" ? "var(--gold-text)" : "var(--heading)" }}>
        <tspan style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontSize: size + 2 }}>γ</tspan>
        {` = ${value}`}
      </text>
    </Fade>
  );
}
