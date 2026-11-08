"use client";

import type { gamma } from "@/lib/walkthroughs/image-processing/lecture-02";
import { GAMMA_XS, gamma8 } from "@/lib/widgets/ip-lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Curve, Pixels, Svg, Table, Text, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Axes, GammaLabel, MapMark } from "./local";

const G: Record<string, number> = { g05: 0.5, g1: 1, g2: 2, g6: 6, g8: 8, g10: 10 };
const gOf = (control: string, fallback: number) => G[control] ?? fallback;

function Curves({ control }: { control: string }) {
  const g = gOf(control, 0.5);
  const box: PlotBox = { x: 56, y: 40, w: 190, h: 190, domain: [0, 255], range: [0, 255] };
  const out = GAMMA_XS.map((x) => gamma8(x, g));
  const caption =
    g < 1 ? bi("bends up: brighter, dark values lifted most", "ينحني إلى أعلى: أكثر سطوعًا، والقيم الداكنة تُرفع أكثر") : g > 1 ? bi("bends down: darker, bright tones spread", "ينحني إلى أسفل: أدكن، والدرجات الساطعة تتباعد") : bi("a straight line: nothing changes", "خط مستقيم: لا شيء يتغير");
  return (
    <Svg>
      <Axes box={box} xs={[64, 128, 192, 255]} ys={[64, 128, 192, 255]} xName="x" yName="y" d={0} />
      <Curve box={box} fn={(x) => x} tone="faint" dashed d={0} />
      <Curve box={box} fn={(x) => 255 * (x / 255) ** g} d={300} />
      {[32, 64, 128, 192].map((x, k) => (
        <MapMark key={x} box={box} x={x} y={gamma8(x, g)} d={1000 + k * 250} />
      ))}
      <Table x={300} y={44} cols={["x", ...GAMMA_XS.map(String)]} rows={[["y", ...out.map(String)]]} cw={[30, 34, 34, 34, 38, 38, 38]} d={600} stagger={700} />
      <Text x={423} y={118} text={caption} size={11.5} tone="gold" d={1500} />
      <Text x={310} y={170} text="x" size={12} mono anchor="end" tone="heading" d={1800} />
      <Pixels x={320} y={152} values={[GAMMA_XS]} cell={36} show="none" d={1800} />
      <Text x={310} y={214} text="y" size={12} mono anchor="end" tone="heading" d={2100} />
      <Pixels x={320} y={196} values={[out]} cell={36} show="none" d={2100} />
    </Svg>
  );
}

const NINE = [0, 32, 64, 96, 128, 160, 192, 224, 255];
const DARK = 3;

function DarkRange({ control }: { control: string }) {
  const g = gOf(control, 0.5);
  const CELL = 44;
  const X0 = 82;
  const W = NINE.length * CELL;
  const AXIS = 140;
  const ax = (v: number) => X0 + (v / 255) * W;
  const out = NINE.map((v) => gamma8(v, g));
  const top = gamma8(64, g);
  return (
    <Svg>
      <Text x={X0 - 12} y={56} text="x" size={12.5} mono anchor="end" tone="heading" d={0} />
      <Pixels x={X0} y={34} values={[NINE]} cell={CELL} size={11} d={0} outline={(_, c) => (c < DARK ? "gold" : undefined)} />
      <Arrow pts={[[X0, AXIS], [X0 + W, AXIS]]} tone="faint" head={false} d={300} dur={300} />
      <Arrow pts={[[X0, AXIS], [ax(top), AXIS]]} tone="gold" head={false} width={5} d={1700} dur={500} />
      {[0, 64, 128, 192, 255].map((v) => (
        <Text key={v} x={ax(v)} y={AXIS + 13} text={String(v)} size={10} mono weight={500} tone="muted" d={300} />
      ))}
      {NINE.map((v, k) => (
        <Arrow key={v} pts={[[X0 + (k + 0.5) * CELL, 80], [ax(out[k]), AXIS - 4]]} tone={k < DARK ? "gold" : "muted"} d={500 + k * 110} dur={350} />
      ))}
      <Text x={X0 - 12} y={194} text="y" size={12.5} mono anchor="end" tone="heading" d={1300} />
      <Pixels x={X0} y={172} values={[out]} cell={CELL} size={11} d={1300} outline={(_, c) => (c < DARK ? "gold" : undefined)} />
      <Text
        x={280}
        y={240}
        text={g < 1 ? bi(`0 to 64 now spans 0 to ${top}`, `المدى من 0 إلى 64 يشغل الآن من 0 إلى ${top}`) : bi(`0 to 64 is squeezed into 0 to ${top}`, `المدى من 0 إلى 64 ينضغط في المدى من 0 إلى ${top}`)}
        size={12.5}
        tone="gold"
        d={2000}
      />
    </Svg>
  );
}

const TIRE = [
  [40, 30, 20, 20, 30, 40],
  [30, 12, 60, 60, 12, 30],
  [20, 60, 140, 140, 60, 20],
  [30, 12, 60, 60, 12, 30],
  [40, 30, 20, 20, 30, 40],
];
const NEAR_BLACK = [12, 20, 30, 40];

function Tire() {
  const after = TIRE.map((row) => row.map((v) => gamma8(v, 0.5)));
  return (
    <Svg>
      <Text x={102} y={32} text={bi("before", "قبل")} size={12} tone="heading" d={0} />
      <Pixels x={24} y={56} values={TIRE} cell={26} size={10} d={0} stagger={60} />
      <Text x={280} y={110} text="imadjust(t, [], [], 0.5)" size={11.5} mono tone="gold" d={500} />
      <Arrow pts={[[190, 128], [370, 128]]} tone="gold" d={600} />
      <GammaLabel x={458} y={32} value={0.5} size={12.5} tone="heading" d={900} />
      <Pixels x={380} y={56} values={after} cell={26} size={10} d={900} stagger={60} />
      <Pixels x={42} y={206} values={[NEAR_BLACK]} cell={30} size={10.5} d={1500} />
      <Text x={280} y={196} text={bi("the gaps grow", "تتسع الفجوات")} size={12} tone="gold" d={1700} />
      <Arrow pts={[[172, 223], [392, 223]]} tone="gold" d={1700} />
      <Pixels x={398} y={206} values={[NEAR_BLACK.map((v) => gamma8(v, 0.5))]} cell={30} size={10.5} d={1900} />
    </Svg>
  );
}

const BRIGHT = [64, 96, 128, 160, 192, 224, 255];

function Large({ control }: { control: string }) {
  const g = gOf(control, 6);
  const box: PlotBox = { x: 56, y: 44, w: 170, h: 170, domain: [0, 255], range: [0, 255] };
  return (
    <Svg>
      <Axes box={box} xs={[128, 255]} ys={[128, 255]} xName="x" yName="y" d={0} />
      <Curve box={box} fn={(x) => x} tone="faint" dashed d={0} />
      {[6, 8, 10].map((k) => (k === g ? null : <Curve key={k} box={box} fn={(x) => 255 * (x / 255) ** k} tone="faint" dashed d={200} />))}
      <Curve box={box} fn={(x) => 255 * (x / 255) ** g} width={2.8} d={300} />
      <GammaLabel x={110} y={70} value={g} d={900} />
      <Text x={292} y={77} text="x" size={12.5} mono anchor="end" tone="heading" d={400} />
      <Pixels x={300} y={60} values={[BRIGHT]} cell={34} size={10.5} d={400} />
      <Text x={292} y={167} text="y" size={12.5} mono anchor="end" tone="heading" d={1100} />
      <Pixels x={300} y={150} values={[BRIGHT.map((v) => gamma8(v, g))]} cell={34} size={10.5} d={1100} />
      <Text
        x={419}
        y={226}
        text={bi(`128 becomes ${gamma8(128, g)}, 192 becomes ${gamma8(192, g)}`, `تصبح 128 مساوية ${gamma8(128, g)}، و192 مساوية ${gamma8(192, g)}`)}
        size={12}
        tone="gold"
        d={1600}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof gamma>>({
  curves: Curves,
  "dark-range": DarkRange,
  tire: Tire,
  large: Large,
});
