"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import { EASE_CSS } from "@/lib/motion";
import type { Bi } from "../types";
import w from "../Walkthrough.module.css";

/*
 * SVG building blocks for walkthrough scenes. Every piece takes `d`, the delay in ms after
 * the panel appears, so a scene builds up in order. Labels are a plain string (a term that
 * stays in English in both languages: DBMS, SQL, T1) or a Bi, whose Arabic line sits under
 * the English and is hidden with the «ع» toggle like all Arabic.
 */

export type Tone = "navy" | "gold" | "slate" | "outline" | "muted" | "danger" | "success" | "warn" | "ghost";
export type TextTone = "text" | "heading" | "muted" | "gold" | "slate" | "danger" | "success";
export type LineTone = "muted" | "gold" | "navy" | "slate" | "danger" | "success" | "faint";
export type L = string | Bi;
export type Pt = readonly [number, number];

type Stage = { live: boolean; reduced: boolean; label: string };
export const StageContext = createContext<Stage>({ live: true, reduced: false, label: "" });
const useStage = () => useContext(StageContext);

const delay = (d = 0, dur?: number) => ({ "--d": `${d}ms`, ...(dur ? { "--dur": `${dur}ms` } : {}) }) as React.CSSProperties;
const isBi = (l: L): l is Bi => typeof l !== "string" && l.ar !== l.en;
const enOf = (l: L) => (typeof l === "string" ? l : l.en);
/** In right-to-left text "start" is the right end, so an Arabic line flips the anchor. */
const AR_ANCHOR = { start: "end", middle: "middle", end: "start" } as const;
type Anchor = keyof typeof AR_ANCHOR;

/** The scene's <svg>; its accessible name is the panel heading. */
export function Svg({ w: width = 560, h = 280, children }: { w?: number; h?: number; children: React.ReactNode }) {
  const { label } = useStage();
  return (
    <svg viewBox={`0 0 ${width} ${h}`} className={w.scene} role="img" aria-label={label}>
      {children}
    </svg>
  );
}

/** Rises into place once, `d` ms after the panel appears. */
export function In({ d = 0, children }: { d?: number; children: React.ReactNode }) {
  return (
    <g className={w.in} style={delay(d)}>
      {children}
    </g>
  );
}

/** Fades in without moving (for things that sit on top of others). */
export function Fade({ d = 0, children }: { d?: number; children: React.ReactNode }) {
  return (
    <g className={w.fade} style={delay(d)}>
      {children}
    </g>
  );
}

type Line = { text: string; size: number; ar: boolean; mono?: boolean };

/** Stacked text lines centred on (x, cy). English lines move to the middle when Arabic is hidden. */
function Lines({ x, cy, lines, cls, anchor = "middle", weight = 600, recentre = true }: { x: number; cy: number; lines: Line[]; cls: string; anchor?: Anchor; weight?: number; recentre?: boolean }) {
  const step = (l: Line) => l.size + (l.ar ? 5 : 4);
  const total = lines.reduce((s, l) => s + step(l), 0);
  const enTotal = lines.filter((l) => !l.ar).reduce((s, l) => s + step(l), 0);
  let y = cy - total / 2;
  let yEn = cy - enTotal / 2;
  return (
    <>
      {lines.map((l, i) => {
        const mid = y + step(l) / 2;
        y += step(l);
        if (l.ar) {
          return (
            <text key={i} x={x} y={mid} textAnchor={AR_ANCHOR[anchor]} direction="rtl" lang="ar" dominantBaseline="central" fontSize={l.size} fontWeight={500} className={`ar ${cls}`}>
              {l.text}
            </text>
          );
        }
        const midEn = yEn + step(l) / 2;
        yEn += step(l);
        const shift = recentre ? midEn - mid : 0;
        return (
          <text
            key={i}
            x={x}
            y={mid}
            textAnchor={anchor}
            dominantBaseline="central"
            fontSize={l.size}
            fontWeight={weight}
            className={`${cls} ${l.mono ? w.mono : ""} ${shift ? w.shift : ""}`}
            style={shift ? ({ "--shift": `${shift}px` } as React.CSSProperties) : undefined}
          >
            {l.text}
          </text>
        );
      })}
    </>
  );
}

const linesOf = (label: L | undefined, size: number, mono?: boolean): Line[] => {
  if (label === undefined) return [];
  const out: Line[] = [{ text: enOf(label), size, ar: false, mono }];
  if (isBi(label)) out.push({ text: label.ar, size: Math.max(size - 2, 10), ar: true });
  return out;
};

/** Free text. With a Bi, the Arabic goes on the next line. */
export function Text({
  x,
  y,
  text,
  size = 13,
  anchor = "middle",
  tone = "text",
  weight = 600,
  mono,
  d,
}: {
  x: number;
  y: number;
  text: L;
  size?: number;
  anchor?: Anchor;
  tone?: TextTone;
  weight?: number;
  mono?: boolean;
  d?: number;
}) {
  const lines = linesOf(text, size, mono);
  const height = lines.reduce((s, l) => s + l.size + (l.ar ? 5 : 4), 0);
  // `y` is the English line's middle, whatever follows it.
  const body = <Lines x={x} cy={y - (size + 4) / 2 + height / 2} lines={lines} cls={`${w.t} ${tone === "text" ? "" : w[tone]}`} anchor={anchor} weight={weight} recentre={false} />;
  return d === undefined ? body : <In d={d}>{body}</In>;
}

/** A rounded box with a label and an optional smaller second line. */
export function Box({
  x,
  y,
  w: bw,
  h: bh,
  label,
  sub,
  tone = "outline",
  r = 10,
  size = 13,
  subSize = 11,
  mono,
  dashed,
  d,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: L;
  sub?: L;
  tone?: Tone;
  r?: number;
  size?: number;
  subSize?: number;
  mono?: boolean;
  dashed?: boolean;
  d?: number;
}) {
  const lines = [...linesOf(label, size, mono), ...linesOf(sub, subSize)];
  const body = (
    <>
      {tone === "ghost" ? null : <rect x={x} y={y} width={bw} height={bh} rx={r} className={w.under} />}
      <rect x={x} y={y} width={bw} height={bh} rx={r} className={`${w.shape} ${w[tone]} ${dashed ? w.dashed : ""}`} />
      {lines.length ? <Lines x={x + bw / 2} cy={y + bh / 2} lines={lines} cls={`${w.bt} ${w[tone]}`} /> : null}
    </>
  );
  return d === undefined ? body : <In d={d}>{body}</In>;
}

/** A pill-shaped tag. Its width follows the English label unless `w` is given. */
export function Chip({ x, y, text, tone = "slate", size = 11.5, w: cw, d, center }: { x: number; y: number; text: L; tone?: Tone; size?: number; w?: number; d?: number; center?: boolean }) {
  const h = isBi(text) ? size * 2 + 14 : size + 12;
  const width = cw ?? Math.max(enOf(text).length * size * 0.6 + 22, 40);
  const left = center ? x - width / 2 : x;
  return <Box x={left} y={y - h / 2} w={width} h={h} r={h / 2} label={text} tone={tone} size={size} d={d} />;
}

/** A database: a cylinder with its label on the body. */
export function Cylinder({ x, y, w: cw = 86, h: ch = 92, label, sub, tone = "navy", size = 13, d }: { x: number; y: number; w?: number; h?: number; label?: L; sub?: L; tone?: Tone; size?: number; d?: number }) {
  const rx = cw / 2;
  const ry = Math.min(12, ch * 0.13);
  const body = `M${x},${y + ry} a${rx},${ry} 0 0 0 ${cw},0 v${ch - 2 * ry} a${rx},${ry} 0 0 1 ${-cw},0 z`;
  const lines = [...linesOf(label, size), ...linesOf(sub, 11)];
  const g = (
    <>
      <path d={body} className={w.under} />
      <path d={body} className={`${w.shape} ${w[tone]}`} />
      <ellipse cx={x + rx} cy={y + ry} rx={rx} ry={ry} className={w.under} />
      <ellipse cx={x + rx} cy={y + ry} rx={rx} ry={ry} className={`${w.shape} ${w[tone]}`} style={{ filter: "brightness(1.12)" }} />
      {lines.length ? <Lines x={x + rx} cy={y + ry + (ch - ry) / 2} lines={lines} cls={`${w.bt} ${w[tone]}`} /> : null}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A file: a page with a folded corner. */
export function Doc({ x, y, w: dw = 54, h: dh = 66, label, sub, tone = "outline", size = 11.5, d }: { x: number; y: number; w?: number; h?: number; label?: L; sub?: L; tone?: Tone; size?: number; d?: number }) {
  const c = Math.min(14, dw * 0.28);
  const lines = [...linesOf(label, size), ...linesOf(sub, 10)];
  const g = (
    <>
      <path d={`M${x},${y} h${dw - c} l${c},${c} v${dh - c} h${-dw} z`} className={w.under} />
      <path d={`M${x},${y} h${dw - c} l${c},${c} v${dh - c} h${-dw} z`} className={`${w.shape} ${w[tone]}`} />
      <path d={`M${x + dw - c},${y} v${c} h${c}`} className={`${w.shape} ${w[tone]}`} style={{ fill: "none" }} />
      {lines.length ? <Lines x={x + dw / 2} cy={y + c / 2 + dh / 2} lines={lines} cls={`${w.bt} ${w[tone]}`} /> : null}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A person: head and shoulders centred on x, with the label underneath. */
export function Person({ x, y, label, tone = "slate", size = 11.5, d }: { x: number; y: number; label?: L; tone?: Tone; size?: number; d?: number }) {
  const g = (
    <>
      <circle cx={x} cy={y + 9} r={9} className={`${w.shape} ${w[tone]}`} />
      <path d={`M${x - 15},${y + 38} a15,15 0 0 1 30,0 z`} className={`${w.shape} ${w[tone]}`} />
      {label !== undefined ? <Text x={x} y={y + 50} text={label} size={size} tone="heading" /> : null}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A ✓ or ✗ badge centred on (x, y). */
export function Mark({ x, y, ok, r = 11, d }: { x: number; y: number; ok: boolean; r?: number; d?: number }) {
  const s = r * 0.45;
  const g = (
    <>
      <circle cx={x} cy={y} r={r} className={`${w.mark} ${ok ? w.ok : w.bad}`} />
      <path
        d={ok ? `M${x - s},${y} l${s * 0.7},${s * 0.75} l${s * 1.3},${-s * 1.4}` : `M${x - s * 0.8},${y - s * 0.8} l${s * 1.6},${s * 1.6} m0,${-s * 1.6} l${-s * 1.6},${s * 1.6}`}
        className={w.markGlyph}
      />
    </>
  );
  return d === undefined ? g : <Fade d={d}>{g}</Fade>;
}

/**
 * A polyline arrow that draws itself in, then shows its head. `label` sits at the middle of
 * the first segment (or at `labelAt`).
 */
export function Arrow({
  pts,
  tone = "muted",
  d = 0,
  dur = 520,
  dashed,
  head = true,
  both,
  label,
  labelAt,
  labelTone = "muted",
  width,
}: {
  pts: readonly Pt[];
  tone?: LineTone;
  d?: number;
  dur?: number;
  dashed?: boolean;
  head?: boolean;
  both?: boolean;
  label?: L;
  labelAt?: Pt;
  labelTone?: TextTone;
  width?: number;
}) {
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const headAt = (tip: Pt, from: Pt) => {
    const a = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
    const l = 9;
    const spread = 0.45;
    const p1 = [tip[0] - l * Math.cos(a - spread), tip[1] - l * Math.sin(a - spread)];
    const p2 = [tip[0] - l * Math.cos(a + spread), tip[1] - l * Math.sin(a + spread)];
    return `${tip[0]},${tip[1]} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  };
  const n = pts.length;
  const at = labelAt ?? ([(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2 - 10] as Pt);
  return (
    <>
      {dashed ? (
        <Fade d={d}>
          <path d={path} className={`${w.line} ${w[tone]} ${w.dashed}`} style={width ? { strokeWidth: width } : undefined} />
        </Fade>
      ) : (
        <path d={path} pathLength={1} className={`${w.line} ${w[tone]} ${w.draw}`} style={{ ...delay(d, dur), ...(width ? { strokeWidth: width } : {}) }} />
      )}
      {head || both ? (
        <Fade d={d + dur * 0.75}>
          {head ? <polygon points={headAt(pts[n - 1], pts[n - 2])} className={`${w.head} ${w[tone]}`} /> : null}
          {both ? <polygon points={headAt(pts[0], pts[1])} className={`${w.head} ${w[tone]}`} /> : null}
        </Fade>
      ) : null}
      {label !== undefined ? <Text x={at[0]} y={at[1]} text={label} size={11} tone={labelTone} d={d + dur * 0.5} /> : null}
    </>
  );
}

/**
 * A dot that travels along `pts` once (Web Animations API), `d` ms after the panel appears.
 * It waits until the stage is on screen, and with reduced motion it just sits at the end.
 */
export function Token({ pts, d = 0, dur = 1400, tone = "gold", r = 6, label }: { pts: readonly Pt[]; d?: number; dur?: number; tone?: "gold" | "navy" | "danger" | "success"; r?: number; label?: string }) {
  const ref = useRef<SVGGElement>(null);
  const { live, reduced } = useStage();
  const key = pts.map((p) => p.join(",")).join(" ");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const points = key.split(" ").map((p) => p.split(",").map(Number) as [number, number]);
    const end = points[points.length - 1];
    if (reduced) {
      el.style.transform = `translate(${end[0]}px, ${end[1]}px)`;
      el.style.opacity = "1";
      return;
    }
    if (!live) return;
    const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
    const total = lengths.reduce((s, l) => s + l, 0) || 1;
    let run = 0;
    const frames = points.map((p, i) => {
      if (i > 0) run += lengths[i - 1];
      return { transform: `translate(${p[0]}px, ${p[1]}px)`, offset: run / total };
    });
    const move = el.animate(frames, { duration: dur, delay: d, easing: EASE_CSS.inOutSmooth, fill: "both" });
    const show = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: d, fill: "both" });
    return () => {
      move.cancel();
      show.cancel();
    };
  }, [key, d, dur, live, reduced]);

  return (
    <g ref={ref} style={{ opacity: 0, transform: `translate(${pts[0][0]}px, ${pts[0][1]}px)` }} aria-hidden="true">
      <circle r={r} className={`${w.token} ${tone === "gold" ? "" : w[tone]}`} />
      {label ? (
        <text y={-r - 7} textAnchor="middle" fontSize={10.5} fontWeight={700} className={`${w.t} ${w.heading} ${w.mono}`}>
          {label}
        </text>
      ) : null}
    </g>
  );
}

/** A small table: a header row, then rows that appear one after another. */
export function Table({
  x,
  y,
  cols,
  rows,
  cw,
  rh = 24,
  d = 0,
  stagger = 110,
  head = "navy",
  cell,
  size = 11.5,
}: {
  x: number;
  y: number;
  cols: readonly string[];
  rows: readonly (readonly string[])[];
  cw: number | readonly number[];
  rh?: number;
  d?: number;
  stagger?: number;
  head?: Tone;
  /** Tone of one cell (row, column); return undefined for the default */
  cell?: (r: number, c: number) => Tone | undefined;
  size?: number;
}) {
  const widths = cols.map((_, i) => (typeof cw === "number" ? cw : cw[i]));
  const xs = widths.map((_, i) => x + widths.slice(0, i).reduce((s, v) => s + v, 0));
  return (
    <>
      <In d={d}>
        {cols.map((c, i) => (
          <Box key={i} x={xs[i]} y={y} w={widths[i]} h={rh} r={0} label={c} tone={head} size={size} mono />
        ))}
      </In>
      {rows.map((row, r) => (
        <In key={r} d={d + (r + 1) * stagger}>
          {row.map((v, c) => (
            <Box key={c} x={xs[c]} y={y + rh * (r + 1)} w={widths[c]} h={rh} r={0} label={v} tone={cell?.(r, c) ?? "outline"} size={size} mono />
          ))}
        </In>
      ))}
    </>
  );
}
