"use client";

import type { pointOps } from "@/lib/walkthroughs/image-processing/lecture-02";
import { EQ, F, pointOp } from "@/lib/widgets/ip-lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Curve, Pixels, Svg, Table, Text, type LineTone, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Axes, MapMark } from "./local";

const IMG = [
  [60, 60, 180, 180],
  [60, 120, 120, 180],
  [120, 120, 60, 180],
];
const f = (v: number) => v + 60;
const OUT = pointOp(IMG, f);
const TONE: Record<number, LineTone> = { 60: "gold", 120: "navy", 180: "success" };

function Fn() {
  const box: PlotBox = { x: 206, y: 60, w: 150, h: 150, domain: [0, 255], range: [0, 255] };
  return (
    <Svg>
      <Text x={80} y={82} text="x" size={13} mono tone="heading" d={0} />
      <Pixels x={20} y={100} values={IMG} cell={30} d={0} stagger={80} outline={(r, c) => TONE[IMG[r][c]]} />
      <Axes box={box} xs={[60, 120, 180]} ys={[120, 180, 240]} xName="x" yName="y" d={300} />
      <Curve box={box} fn={(x) => x} tone="faint" dashed d={300} />
      <Curve box={box} points={[[0, 60], [195, 255], [255, 255]]} d={400} />
      {[60, 120, 180].map((v, i) => (
        <MapMark key={v} box={box} x={v} y={pointOp([[v]], f)[0][0]} tone={TONE[v]} d={1100 + i * 350} />
      ))}
      <Text x={481} y={82} text="y = f(x)" size={13} mono tone="heading" d={1900} />
      <Pixels x={421} y={100} values={OUT} cell={30} d={1900} stagger={80} outline={(r, c) => TONE[IMG[r][c]]} />
      <Text x={281} y={252} text="f(x) = min(x + 60, 255)" size={12} mono tone="gold" d={2300} />
    </Svg>
  );
}

const LUT = Array.from({ length: 8 }, (_, x) => Math.min(x + 2, 7));
const PICK = 3;

function Lookup() {
  const out = F.map((row) => row.map((v) => LUT[v]));
  return (
    <Svg>
      <Text x={280} y={20} text={bi("lookup table", "جدول البحث")} size={12} tone="heading" d={0} />
      <Table x={100} y={46} cols={["x", ...LUT.map((_, x) => String(x))]} rows={[["y", ...LUT.map(String)]]} cw={40} d={0} stagger={200} cell={(_, c) => (c === PICK + 1 ? "gold" : undefined)} />
      <Text x={280} y={112} text="y = min(x + 2, 7)" size={12} mono tone="gold" d={400} />
      <Text x={166} y={124} text="f" size={12.5} mono tone="heading" d={600} />
      <Pixels x={110} y={136} values={F} cell={28} max={7} d={600} stagger={60} outline={(r, c) => (F[r][c] === PICK ? "gold" : undefined)} />
      <Text x={280} y={168} text={bi("look up", "ابحث")} size={11.5} tone="gold" d={1100} />
      <Arrow pts={[[230, 194], [330, 194]]} tone="gold" d={1100} />
      <Text x={394} y={124} text="lut[f]" size={12.5} mono tone="heading" d={1500} />
      <Pixels x={338} y={136} values={out} cell={28} max={7} d={1500} stagger={60} outline={(r, c) => (F[r][c] === PICK ? "gold" : undefined)} />
    </Svg>
  );
}

const STEPS = EQ.map.flatMap((m, i, all) => [[i / all.length, m / 15], [(i + 1) / all.length, m / 15]] as [number, number][]);
const FAMILY: { label: ReturnType<typeof bi>; formula: string; points?: [number, number][]; fn?: (x: number) => number }[] = [
  { label: bi("Brightness", "السطوع"), formula: "x + c", points: [[0, 0.3], [0.7, 1], [1, 1]] },
  { label: bi("Contrast", "التباين"), formula: "C · x", points: [[0, 0], [0.5, 1], [1, 1]] },
  { label: bi("Gamma", "غاما"), formula: "x^0.5", fn: (x) => x ** 0.5 },
  { label: bi("Equalization", "التسوية"), formula: "CDF", points: STEPS },
];

function Family() {
  return (
    <Svg>
      {FAMILY.map((p, i) => {
        const box: PlotBox = { x: 34 + i * 134, y: 52, w: 96, h: 96 };
        return (
          <g key={i}>
            <Axes box={box} d={i * 300} />
            <Curve box={box} fn={(x) => x} tone="faint" dashed d={i * 300} />
            <Curve box={box} points={p.points} fn={p.fn} d={i * 300 + 150} dur={700} />
            <Text x={box.x + 48} y={176} text={p.label} size={12} tone="heading" d={i * 300 + 300} />
            <Text x={box.x + 48} y={214} text={p.formula} size={11.5} mono tone="gold" d={i * 300 + 400} />
          </g>
        );
      })}
      <Text x={280} y={250} text={bi("each one is a different curve y = f(x)", "كلٌّ منها منحنى مختلف")} size={12} tone="muted" d={1500} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof pointOps>>({
  function: Fn,
  lookup: Lookup,
  family: Family,
});
