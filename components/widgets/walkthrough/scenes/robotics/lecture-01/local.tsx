"use client";

import { useContext, useEffect, useRef } from "react";
import { EASE_CSS } from "@/lib/motion";
import { twoLinkAngles } from "@/lib/widgets/rob-lecture-01";
import { Box, In, StageContext, type LineTone, type Pt, type Tone } from "../../../primitives";
import w from "../../../../Walkthrough.module.css";

/*
 * Pieces shared by the scenes of Robotics · Lecture 1: motion helpers (Swing rotates a group
 * about a pivot, Glide moves one between stops, Vanish fades one out), a two-link arm that
 * reaches for a point, and small line drawings of the machines the lecture names.
 */

/** Rotates its children about (cx, cy) from `from` to `to` degrees, `at` ms after the panel appears. */
export function Swing({ cx, cy, from, to, at = 0, dur = 700, children }: { cx: number; cy: number; from: number; to: number; at?: number; dur?: number; children: React.ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const { live, reduced } = useContext(StageContext);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced || from === to) {
      el.style.transform = `rotate(${to}deg)`;
      return;
    }
    el.style.transform = `rotate(${from}deg)`;
    if (!live) return;
    const anim = el.animate([{ transform: `rotate(${from}deg)` }, { transform: `rotate(${to}deg)` }], { duration: dur, delay: at, easing: EASE_CSS.inOutSmooth, fill: "both" });
    return () => anim.cancel();
  }, [from, to, at, dur, live, reduced]);

  return (
    <g ref={ref} style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: "view-box", transform: `rotate(${from}deg)` }}>
      {children}
    </g>
  );
}

/**
 * Moves its children (drawn at stops[0]) to each later stop in turn: the move to stops[i]
 * starts `at[i - 1]` ms after the panel appears and takes `move` ms. With reduced motion it
 * sits at the last stop.
 */
export function Glide({ stops, at, move = 500, children }: { stops: readonly Pt[]; at: readonly number[]; move?: number; children: React.ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const { live, reduced } = useContext(StageContext);
  const key = `${stops.map((p) => p.join(",")).join(" ")}|${at.join(",")}|${move}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const [stopText, atText] = key.split("|");
    const pts = stopText.split(" ").map((p) => p.split(",").map(Number) as [number, number]);
    const times = atText ? atText.split(",").map(Number) : [];
    const [x0, y0] = pts[0];
    const shift = (p: [number, number]) => `translate(${p[0] - x0}px, ${p[1] - y0}px)`;
    if (reduced || times.length === 0) {
      el.style.transform = shift(pts[pts.length - 1]);
      return;
    }
    el.style.transform = "";
    if (!live) return;
    const total = times[times.length - 1] + move;
    const frames: Keyframe[] = [{ transform: shift(pts[0]), offset: 0 }];
    times.forEach((t, i) => {
      frames.push({ transform: shift(pts[i]), offset: t / total, easing: EASE_CSS.inOutSmooth });
      frames.push({ transform: shift(pts[i + 1]), offset: (t + move) / total });
    });
    const anim = el.animate(frames, { duration: total, fill: "both" });
    return () => anim.cancel();
  }, [key, move, live, reduced]);

  return <g ref={ref}>{children}</g>;
}

/** Shows its children, then fades them out `at` ms after the panel appears (gone at once with reduced motion). */
export function Vanish({ at, dur = 400, children }: { at: number; dur?: number; children: React.ReactNode }) {
  const ref = useRef<SVGGElement>(null);
  const { live, reduced } = useContext(StageContext);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.style.opacity = "0";
      return;
    }
    el.style.opacity = "";
    if (!live) return;
    const anim = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: dur, delay: at, fill: "both" });
    return () => anim.cancel();
  }, [at, dur, live, reduced]);

  return <g ref={ref}>{children}</g>;
}

/* ---------- Line-drawing helpers ---------- */

const seg = (a: Pt, b: Pt) => `M${a[0]},${a[1]} L${b[0]},${b[1]}`;

/** A thick straight stroke (a link, a leg, a beam). */
export function Bar({ a, b, tone = "navy", width = 5 }: { a: Pt; b: Pt; tone?: LineTone; width?: number }) {
  return <path d={seg(a, b)} className={`${w.line} ${w[tone]}`} style={{ strokeWidth: width }} />;
}

/** A joint: a small ring with an opaque centre. */
export function Joint({ x, y, r = 4.5, tone = "outline" }: { x: number; y: number; r?: number; tone?: Tone }) {
  return (
    <>
      <circle cx={x} cy={y} r={r} className={w.under} />
      <circle cx={x} cy={y} r={r} className={`${w.shape} ${w[tone]}`} />
    </>
  );
}

/** A filled rounded rectangle without a label. */
export function Plate({ x, y, w: pw, h, r = 3, tone = "slate" }: { x: number; y: number; w: number; h: number; r?: number; tone?: Tone }) {
  return <Box x={x} y={y} w={pw} h={h} r={r} tone={tone} />;
}

/** A gripper pointing along +x from (x, y): a stem and two jaws, `open` px apart. */
function Gripper({ x, y, open = 7, tone = "slate" }: { x: number; y: number; open?: number; tone?: LineTone }) {
  return (
    <path
      d={`M${x},${y} h8 M${x + 8},${y - open} v${open * 2} M${x + 8},${y - open} h10 M${x + 8},${y + open} h10`}
      className={`${w.line} ${w[tone]}`}
      style={{ strokeWidth: 2.6 }}
    />
  );
}

/** How far the gripper reaches beyond the arm's last link. */
export const GRIPPER_LEN = 18;

/**
 * A two-link arm on a pedestal whose shoulder is at (sx, sy). It starts in the `rest` pose
 * (joint angles in degrees) and, `at` ms after the panel appears, swings so that the gripper's
 * tips, pointing straight down, touch `target`.
 */
export function ReachArm({ sx, sy, l1, l2, rest, target, at = 0, dur = 900, baseY, tone = "navy" }: { sx: number; sy: number; l1: number; l2: number; rest: readonly [number, number]; target: Pt; at?: number; dur?: number; baseY: number; tone?: LineTone }) {
  const [t1, t2] = twoLinkAngles(target[0] - sx, target[1] - GRIPPER_LEN - sy, l1, l2);
  const ex = sx + l1;
  const tx = ex + l2;
  return (
    <>
      <Plate x={sx - 26} y={baseY - 12} w={52} h={12} tone="slate" />
      <Bar a={[sx, baseY - 12]} b={[sx, sy]} tone="slate" width={9} />
      <Swing cx={sx} cy={sy} from={rest[0]} to={t1} at={at} dur={dur}>
        <Bar a={[sx, sy]} b={[ex, sy]} tone={tone} width={7} />
        <Swing cx={ex} cy={sy} from={rest[1]} to={t2} at={at} dur={dur}>
          <Bar a={[ex, sy]} b={[tx, sy]} tone={tone} width={6} />
          <Swing cx={tx} cy={sy} from={90 - rest[0] - rest[1]} to={90 - t1 - t2} at={at} dur={dur}>
            <Gripper x={tx} y={sy} />
          </Swing>
          <Joint x={ex} y={sy} />
        </Swing>
        <Joint x={sx} y={sy} r={6} />
      </Swing>
    </>
  );
}

/* ---------- Icons: each drawn around (x, y), the middle of its footprint on the ground ---------- */

/** A small articulated arm bolted to the floor; `tool` is what it carries. */
export function ArmIcon({ x, y, s = 1, tone = "navy", tool = "gripper", d }: { x: number; y: number; s?: number; tone?: LineTone; tool?: "gripper" | "torch" | "spray" | "box"; d?: number }) {
  const sh: Pt = [x - 8 * s, y - 26 * s];
  const el: Pt = [x + 6 * s, y - 58 * s];
  const tip: Pt = [x + 34 * s, y - 44 * s];
  const g = (
    <>
      <Plate x={x - 20 * s} y={y - 8 * s} w={40 * s} h={8 * s} tone="slate" />
      <Bar a={[sh[0], y - 8 * s]} b={sh} tone="slate" width={7 * s} />
      <Bar a={sh} b={el} tone={tone} width={6 * s} />
      <Bar a={el} b={tip} tone={tone} width={5 * s} />
      {tool === "gripper" ? <path d={`M${tip[0]},${tip[1]} v${6 * s} m${-5 * s},0 h${10 * s} m${-10 * s},0 v${7 * s} m${10 * s},${-7 * s} v${7 * s}`} className={`${w.line} ${w.slate}`} style={{ strokeWidth: 2.2 }} /> : null}
      {tool === "torch" ? (
        <>
          <path d={`M${tip[0]},${tip[1]} l${6 * s},${12 * s}`} className={`${w.line} ${w.slate}`} style={{ strokeWidth: 3 }} />
          <circle cx={tip[0] + 8 * s} cy={tip[1] + 17 * s} r={3.2 * s} style={{ fill: "var(--gold)" }} />
        </>
      ) : null}
      {tool === "spray" ? (
        <>
          <path d={`M${tip[0]},${tip[1]} l${8 * s},${4 * s}`} className={`${w.line} ${w.slate}`} style={{ strokeWidth: 3 }} />
          <path d={`M${tip[0] + 10 * s},${tip[1] + 5 * s} l${10 * s},${-4 * s} M${tip[0] + 10 * s},${tip[1] + 5 * s} l${11 * s},${3 * s} M${tip[0] + 10 * s},${tip[1] + 5 * s} l${8 * s},${9 * s}`} className={`${w.line} ${w.gold}`} style={{ strokeWidth: 1.6 }} />
        </>
      ) : null}
      {tool === "box" ? (
        <>
          <path d={`M${tip[0]},${tip[1]} v${6 * s}`} className={`${w.line} ${w.slate}`} style={{ strokeWidth: 2.6 }} />
          <Plate x={tip[0] - 9 * s} y={tip[1] + 6 * s} w={18 * s} h={14 * s} r={2} tone="warn" />
        </>
      ) : null}
      <Joint x={sh[0]} y={sh[1]} r={4 * s} />
      <Joint x={el[0]} y={el[1]} r={3.5 * s} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A wheeled rover with a camera mast. */
export function RoverIcon({ x, y, s = 1, d }: { x: number; y: number; s?: number; d?: number }) {
  const g = (
    <>
      <Bar a={[x + 10 * s, y - 26 * s]} b={[x + 10 * s, y - 46 * s]} tone="slate" width={3} />
      <Plate x={x + 3 * s} y={y - 54 * s} w={16 * s} h={9 * s} r={2} tone="navy" />
      <Plate x={x - 30 * s} y={y - 30 * s} w={60 * s} h={16 * s} r={4} tone="slate" />
      {[-22, 0, 22].map((dx) => (
        <g key={dx}>
          <circle cx={x + dx * s} cy={y - 7 * s} r={7 * s} className={w.under} />
          <circle cx={x + dx * s} cy={y - 7 * s} r={7 * s} className={`${w.shape} ${w.navy}`} />
        </g>
      ))}
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A moving platform on three legs (a motion generator). */
export function PlatformIcon({ x, y, s = 1, d }: { x: number; y: number; s?: number; d?: number }) {
  const top = y - 44 * s;
  const g = (
    <>
      <Plate x={x - 26 * s} y={y - 7 * s} w={52 * s} h={7 * s} tone="slate" />
      <Bar a={[x - 22 * s, y - 7 * s]} b={[x - 10 * s, top]} tone="navy" width={3.5} />
      <Bar a={[x - 2 * s, y - 7 * s]} b={[x - 18 * s, top]} tone="navy" width={3.5} />
      <Bar a={[x + 2 * s, y - 7 * s]} b={[x + 18 * s, top]} tone="navy" width={3.5} />
      <Bar a={[x + 22 * s, y - 7 * s]} b={[x + 10 * s, top]} tone="navy" width={3.5} />
      <Plate x={x - 30 * s} y={top - 8 * s} w={60 * s} h={8 * s} tone="gold" />
      <Box x={x - 12 * s} y={top - 30 * s} w={24 * s} h={22 * s} r={5} tone="outline" />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** An autonomous underwater vehicle under a wavy surface. */
export function AuvIcon({ x, y, s = 1, d }: { x: number; y: number; s?: number; d?: number }) {
  const cy = y - 22 * s;
  const g = (
    <>
      <path d={`M${x - 40 * s},${y - 52 * s} q${10 * s},-6 ${20 * s},0 t${20 * s},0 t${20 * s},0 t${20 * s},0`} className={`${w.line} ${w.slate}`} style={{ strokeWidth: 1.6 }} />
      <ellipse cx={x} cy={cy} rx={30 * s} ry={9 * s} className={w.under} />
      <ellipse cx={x} cy={cy} rx={30 * s} ry={9 * s} className={`${w.shape} ${w.navy}`} />
      <path d={`M${x - 6 * s},${cy - 8 * s} l${4 * s},${-8 * s} h${8 * s} l${2 * s},${8 * s}`} className={`${w.line} ${w.navy}`} style={{ strokeWidth: 2.4 }} />
      <path d={`M${x - 31 * s},${cy} h${-6 * s} m0,${-6 * s} v${12 * s}`} className={`${w.line} ${w.slate}`} style={{ strokeWidth: 2.4 }} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A small quadcopter seen from the side. */
export function DroneIcon({ x, y, s = 1, d }: { x: number; y: number; s?: number; d?: number }) {
  const cy = y - 40 * s;
  const g = (
    <>
      <Bar a={[x - 28 * s, cy]} b={[x + 28 * s, cy]} tone="slate" width={3} />
      {[-28, 28].map((dx) => (
        <g key={dx}>
          <Bar a={[x + dx * s, cy]} b={[x + dx * s, cy - 6 * s]} tone="slate" width={2.4} />
          <ellipse cx={x + dx * s} cy={cy - 8 * s} rx={13 * s} ry={2.6 * s} className={`${w.shape} ${w.gold}`} />
        </g>
      ))}
      <Plate x={x - 11 * s} y={cy - 5 * s} w={22 * s} h={12 * s} r={4} tone="navy" />
      <path d={`M${x - 6 * s},${cy + 7 * s} l${-5 * s},${8 * s} M${x + 6 * s},${cy + 7 * s} l${5 * s},${8 * s}`} className={`${w.line} ${w.slate}`} style={{ strokeWidth: 2 }} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A front-loading washing machine with a timer dial. */
export function WasherIcon({ x, y, d }: { x: number; y: number; d?: number }) {
  const g = (
    <>
      <Box x={x - 44} y={y - 110} w={88} h={110} r={8} tone="outline" />
      <path d={`M${x - 44},${y - 88} h88`} className={`${w.line} ${w.faint}`} />
      <circle cx={x + 26} cy={y - 99} r={6} className={`${w.shape} ${w.gold}`} />
      <Plate x={x - 34} y={y - 102} w={34} h={6} r={3} tone="muted" />
      <circle cx={x} cy={y - 44} r={28} className={`${w.shape} ${w.slate}`} />
      <circle cx={x} cy={y - 44} r={18} className={`${w.shape} ${w.outline}`} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A wall alarm: a box with a light, a sensor eye and sound waves. */
export function AlarmIcon({ x, y, d }: { x: number; y: number; d?: number }) {
  const g = (
    <>
      <Box x={x - 30} y={y - 104} w={60} h={70} r={10} tone="outline" />
      <circle cx={x} cy={y - 82} r={12} className={`${w.shape} ${w.danger}`} />
      <circle cx={x} cy={y - 50} r={6} className={`${w.shape} ${w.navy}`} />
      <path d={`M${x + 40},${y - 92} q10,10 0,20 M${x + 50},${y - 100} q16,18 0,36 M${x - 40},${y - 92} q-10,10 0,20 M${x - 50},${y - 100} q-16,18 0,36`} className={`${w.line} ${w.danger}`} style={{ strokeWidth: 2 }} />
      <Bar a={[x, y - 34]} b={[x, y - 6]} tone="faint" width={3} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** A powered prosthetic forearm and hand. */
export function ProstheticIcon({ x, y, s = 1, d }: { x: number; y: number; s?: number; d?: number }) {
  const g = (
    <>
      <Box x={x - 13 * s} y={y - 46 * s} w={26 * s} h={46 * s} r={9 * s} tone="slate" />
      <Plate x={x - 10 * s} y={y - 36 * s} w={20 * s} h={5 * s} r={2} tone="gold" />
      <Box x={x - 14 * s} y={y - 70 * s} w={28 * s} h={24 * s} r={6 * s} tone="navy" />
      {[-10, -3.5, 3.5, 10].map((dx, i) => (
        <Bar key={dx} a={[x + dx * s, y - 70 * s]} b={[x + dx * s, y - (i === 0 || i === 3 ? 84 : 90) * s]} tone="navy" width={4.4 * s} />
      ))}
      <Bar a={[x - 14 * s, y - 56 * s]} b={[x - 22 * s, y - 68 * s]} tone="navy" width={4.4 * s} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** An operator's joystick wired to a small handling arm. */
export function TeleopIcon({ x, y, s = 1, d }: { x: number; y: number; s?: number; d?: number }) {
  const g = (
    <>
      <Plate x={x - 46 * s} y={y - 14 * s} w={30 * s} h={14 * s} r={3} tone="slate" />
      <Bar a={[x - 31 * s, y - 14 * s]} b={[x - 36 * s, y - 34 * s]} tone="navy" width={3} />
      <circle cx={x - 36 * s} cy={y - 37 * s} r={5 * s} className={`${w.shape} ${w.gold}`} />
      <path d={`M${x - 16 * s},${y - 6 * s} q${18 * s},${8 * s} ${30 * s},0`} className={`${w.line} ${w.muted} ${w.dashed}`} />
      <ArmIcon x={x + 26 * s} y={y} s={0.7 * s} tone="slate" />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** The book's press loader: three pneumatic axes on a bench frame, between hand-set stops. */
export function LoaderIcon({ x, y, s = 1, d }: { x: number; y: number; s?: number; d?: number }) {
  const g = (
    <>
      <Plate x={x - 40 * s} y={y - 8 * s} w={80 * s} h={8 * s} tone="slate" />
      <Bar a={[x - 34 * s, y - 8 * s]} b={[x - 34 * s, y - 62 * s]} tone="slate" width={4} />
      <Bar a={[x + 34 * s, y - 8 * s]} b={[x + 34 * s, y - 62 * s]} tone="slate" width={4} />
      <Bar a={[x - 38 * s, y - 62 * s]} b={[x + 38 * s, y - 62 * s]} tone="navy" width={6} />
      <Plate x={x - 6 * s} y={y - 68 * s} w={14 * s} h={12 * s} r={2} tone="gold" />
      <Bar a={[x + 1 * s, y - 56 * s]} b={[x + 1 * s, y - 30 * s]} tone="navy" width={4} />
      <path d={`M${x - 6 * s},${y - 30 * s} h${14 * s} m${-14 * s},0 v${8 * s} m${14 * s},${-8 * s} v${8 * s}`} className={`${w.line} ${w.slate}`} style={{ strokeWidth: 2.2 }} />
      <path d={`M${x - 30 * s},${y - 66 * s} v8 M${x + 30 * s},${y - 66 * s} v8`} className={`${w.line} ${w.danger}`} style={{ strokeWidth: 3 }} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}
