"use client";

import { useContext, useEffect, useRef } from "react";
import { EASE_CSS } from "@/lib/motion";
import { In, StageContext, type Pt, type Tone } from "../../../primitives";
import w from "../../../../Walkthrough.module.css";

/** A small triangle pointing up with its tip at (x, y): the pivot of a balance. */
export function Tri({ x, y, s = 12, tone = "slate", d }: { x: number; y: number; s?: number; tone?: Tone; d?: number }) {
  const pts = `${x},${y} ${x - s * 0.7},${y + s} ${x + s * 0.7},${y + s}`;
  const g = (
    <>
      <polygon points={pts} className={w.under} />
      <polygon points={pts} className={`${w.shape} ${w[tone]}`} />
    </>
  );
  return d === undefined ? g : <In d={d}>{g}</In>;
}

/** Points along a circle arc (degrees, clockwise on screen from the +x axis), for Arrow and Token. */
export function arc(cx: number, cy: number, r: number, from: number, to: number, n = 10): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = ((from + ((to - from) * i) / n) * Math.PI) / 180;
    return [Math.round((cx + r * Math.cos(a)) * 10) / 10, Math.round((cy + r * Math.sin(a)) * 10) / 10] as Pt;
  });
}

/**
 * Moves its children (drawn at stops[0]) to each later stop in turn: the move to stops[i]
 * starts `at[i - 1]` ms after the panel appears and takes `move` ms. Like Token, it waits
 * for the stage to be on screen, and with reduced motion it just sits at the last stop.
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
    const times = atText.split(",").map(Number);
    const [x0, y0] = pts[0];
    const shift = (p: [number, number]) => `translate(${p[0] - x0}px, ${p[1] - y0}px)`;
    if (reduced) {
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
