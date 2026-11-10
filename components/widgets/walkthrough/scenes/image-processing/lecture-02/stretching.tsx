"use client";

import type { stretching } from "@/lib/walkthroughs/image-processing/lecture-02";
import { STRETCH_BAND, STRETCH_HIST, STRETCH_MAP, STRETCH_POINTS, linearStretch, round, slopes, stretchRange, sum } from "@/lib/widgets/ip-lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Bars, Box, Chip, Curve, Pixels, Svg, Table, Text, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Axes, Dot, MapMark, Remap } from "./local";

const LEVELS = STRETCH_HIST.map((_, i) => String(i));
const inBand = (i: number) => STRETCH_BAND.includes(i);
const N = sum(STRETCH_HIST);
const BAND = sum(STRETCH_BAND.map((i) => STRETCH_HIST[i]));

function Narrow() {
  const slot = 480 / 16;
  return (
    <Svg>
      <Box x={40 + 5 * slot - 4} y={22} w={5 * slot + 8} h={204} r={8} tone="ghost" dashed d={1500} />
      <Bars x={40} y={44} w={480} h={160} values={STRETCH_HIST} labels={LEVELS} showValues tone="slate" barTone={(i) => (inBand(i) ? "gold" : undefined)} d={0} stagger={70} />
      <Text x={280} y={246} text={bi(`${BAND} of ${N} pixels have levels 5 to 9`, `${BAND} من ${N} بكسلًا مستوياتها من 5 إلى 9`)} size={12.5} tone="gold" d={1700} />
    </Svg>
  );
}

function Mapping() {
  const box: PlotBox = { x: 60, y: 36, w: 200, h: 200, domain: [0, 15], range: [0, 15] };
  const rows = [["j", ...STRETCH_BAND.map((i) => String(STRETCH_MAP[i]))]];
  return (
    <Svg>
      <Axes box={box} xs={[...STRETCH_BAND, 15]} ys={STRETCH_BAND.map((i) => STRETCH_MAP[i])} xName="i" yName="j" d={0} />
      <Curve box={box} fn={(x) => x} tone="faint" dashed d={0} />
      <Curve box={box} points={STRETCH_POINTS} d={300} />
      {STRETCH_BAND.map((i, k) => (
        <MapMark key={i} box={box} x={i} y={STRETCH_MAP[i]} d={1000 + k * 300} />
      ))}
      <Text x={306} y={52} text="j = (14 − 2)/(9 − 5) · (i − 5) + 2" size={11.5} mono anchor="start" tone="heading" d={400} />
      <Text x={306} y={76} text={`  = ${slopes(STRETCH_POINTS)[1]}(i − 5) + 2`} size={11.5} mono anchor="start" tone="gold" d={700} />
      <Table x={318} y={104} cols={["i", ...STRETCH_BAND.map(String)]} rows={rows} cw={36} d={1000} stagger={1000} />
      <Text x={426} y={190} text={bi("0 and 15 stay as they are", "يبقى المستويان 0 و15 كما هما")} size={12} tone="muted" d={2600} />
    </Svg>
  );
}

function Result() {
  return <Remap x={60} w={480} top={30} h={66} gap={74} before={STRETCH_HIST} map={STRETCH_MAP} labels={LEVELS} names={[bi("before", "قبل"), bi("after", "بعد")]} />;
}
const ResultScene = () => (
  <Svg>
    <Result />
  </Svg>
);

const POUT = [75, 160] as const;
const PROBE = [75, 92, 109, 126, 143, 160];

function General() {
  const box: PlotBox = { x: 60, y: 44, w: 180, h: 180, domain: [0, 255], range: [0, 255] };
  const s = (r: number) => round(linearStretch(r, POUT[0], POUT[1]));
  return (
    <Svg>
      <Axes box={box} xs={[75, 120, 160]} ys={[s(120), 255]} xName="r" yName="s" d={0} />
      <Curve box={box} fn={(x) => x} tone="faint" dashed d={0} />
      <Curve box={box} points={[[0, 0], [POUT[0], 0], [POUT[1], 255], [255, 255]]} d={300} />
      <MapMark box={box} x={120} y={s(120)} d={1100} />
      <Text x={422} y={40} text={bi("before", "قبل")} size={12} tone="heading" d={600} />
      <Pixels x={320} y={70} values={[PROBE]} cell={34} size={11} d={600} />
      <Text x={422} y={132} text={bi("after", "بعد")} size={12} tone="heading" d={1400} />
      <Pixels x={320} y={162} values={[PROBE.map(s)]} cell={34} size={11} d={1400} />
      <Text x={422} y={226} text="s = (r − 75)/85 · 255" size={12} mono tone="gold" d={1800} />
    </Svg>
  );
}

const A = 0.3;
const B = 0.7;
const C = 0.15;
const D = 0.9;

/** Stretching a chosen range [a, b] onto [c, d], flat at both ends, on a [0, 1] scale. */
function ChosenRange() {
  const box: PlotBox = { x: 64, y: 44, w: 190, h: 180 };
  return (
    <Svg>
      <Axes box={box} xs={[[A, "a"], [B, "b"], [1, "1"]]} ys={[[C, "c"], [D, "d"], [1, "1"]]} xName="x" yName="y" d={0} />
      <Curve box={box} points={[[0, C], [A, C], [B, D], [1, D]]} d={300} />
      {[0.15, 0.5, 0.85].map((x, k) => (
        <MapMark key={x} box={box} x={x} y={stretchRange(x, A, B, C, D)} tone={k === 1 ? "gold" : "navy"} d={1100 + k * 300} />
      ))}
      <Dot at={[box.x + A * box.w, box.y + box.h - C * box.h]} tone="slate" d={900} />
      <Dot at={[box.x + B * box.w, box.y + box.h - D * box.h]} tone="slate" d={900} />
      <Text x={300} y={46} text="[a, b]  →  [c, d]" size={12} mono anchor="start" tone="heading" d={400} />
      <Text x={312} y={86} text="x ≤ a      →  c" size={12} mono anchor="start" d={1100} />
      <Text x={312} y={114} text="a … b      →  c … d" size={12} mono anchor="start" tone="gold" d={1400} />
      <Text x={312} y={142} text="x ≥ b      →  d" size={12} mono anchor="start" d={1700} />
      <Text x={312} y={176} text={bi("all values on a [0, 1] scale", "كل القيم على مقياس [0, 1]")} size={12} anchor="start" tone="muted" d={2000} />
      <Chip x={422} y={232} text="pout.tif:  [75, 160]/255  →  [0, 1]" size={11} tone="gold" center d={2300} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof stretching>>({
  narrow: Narrow,
  mapping: Mapping,
  result: ResultScene,
  general: General,
  range: ChosenRange,
});

