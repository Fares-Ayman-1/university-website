"use client";

import { edgeHighBoost, edgeUnsharp, highBoostMask, smooth1d } from "@/lib/widgets/ip-lecture-03";
import type { unsharp } from "@/lib/walkthroughs/image-processing/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Pixels, Svg, Text, plotAt, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Frame, Matrix, SignedBars, num, signTone } from "./local";

/** The 20 | 80 edge over nine pixels; samples 2–4 are the page's interior 20, 20, 80. */
const ROW9 = [20, 20, 20, 20, 80, 80, 80, 80, 80];
const BLUR9 = smooth1d(ROW9, [1, 1, 1]);
const DIFF9 = ROW9.map((v, i) => v - BLUR9[i]);
const STEP9 = [[0, 20], [3.5, 20], [3.5, 80], [8, 80]] as const;
const pts = (ys: readonly number[]) => ys.map((v, i) => [i, v] as const);
const UN2 = edgeUnsharp(2).boosted;

const TOP: PlotBox = { x: 50, y: 52, w: 280, h: 112, domain: [0, 8], range: [0, 100] };

function Difference() {
  const un = edgeUnsharp(2);
  const xs = ROW9.map((_, i) => plotAt(TOP, i, 0)[0]);
  const [fx, fy] = plotAt(TOP, 6.6, 92);
  const [bx, by] = plotAt(TOP, 5.4, 50);
  const left = plotAt(TOP, 1.5, 0)[0];
  const right = plotAt(TOP, 4.5, 0)[0];
  return (
    <Svg>
      <Curve box={TOP} axes points={STEP9} tone="muted" dashed d={0} />
      <Text x={fx} y={fy} text="f" size={12} mono tone="muted" d={200} />
      <Curve box={TOP} points={pts(BLUR9)} tone="gold" d={500} />
      <Text x={bx} y={by} text="f̄" size={13} tone="gold" d={900} />
      <Frame x={left} y={TOP.y - 6} w={right - left} h={TOP.h + 6} tone="navy" dashed width={1.6} d={1100} />
      <Text x={22} y={246} text="f − f̄" anchor="start" size={12} tone="heading" d={1200} />
      <SignedBars xs={xs} zeroY={214} values={DIFF9} scale={1.2} barW={18} d={1300} stagger={70} />
      <Text x={400} y={76} text="f" anchor="end" size={12} mono tone="heading" d={1500} />
      <Matrix x={410} y={60} values={[un.f]} cell={40} ch={32} d={1500} />
      <Text x={400} y={124} text="f̄" anchor="end" size={13} tone="gold" d={1700} />
      <Matrix x={410} y={108} values={[un.blurred]} cell={40} ch={32} tone={() => "gold"} d={1700} />
      <Text x={400} y={172} text="f − f̄" anchor="end" size={12} tone="heading" d={1900} />
      <Matrix x={410} y={156} values={[un.difference]} cell={40} ch={32} tone={signTone} d={1900} />
      <Chip x={455} y={232} text={bi("negative, then positive", "سالب ثم موجب")} tone="navy" center d={2300} />
    </Svg>
  );
}

const ADD: PlotBox = { x: 50, y: 60, w: 288, h: 150, domain: [0, 8], range: [-40, 110] };

function AddBack({ control }: { control: string }) {
  const added = control === "added";
  const boosted = ROW9.map((v, i) => 2 * v - BLUR9[i]);
  const zeroY = plotAt(ADD, 0, 0)[1];
  const lo = Math.min(...DIFF9);
  const hi = Math.max(...DIFF9);
  // imshow(g, []) for the difference: its minimum shows black and its maximum white.
  const shown = added ? boosted : DIFF9.map((v) => ((v - lo) / (hi - lo)) * 110);
  const image = Array.from({ length: 6 }, () => shown);
  const [dx, dy] = plotAt(ADD, 3, 0);
  const [ox, oy] = plotAt(ADD, 4, 100);
  return (
    <Svg>
      <Curve box={ADD} axes points={[]} d={0} />
      <Arrow pts={[[ADD.x, zeroY], [ADD.x + ADD.w + 6, zeroY]]} tone="faint" head={false} d={200} dur={300} />
      <Text x={ADD.x - 6} y={zeroY} text="0" anchor="end" size={10} mono tone="muted" d={200} />
      {added ? (
        <>
          <Curve box={ADD} points={STEP9} tone="muted" dashed d={300} />
          <Curve box={ADD} points={pts(boosted)} tone="gold" d={600} dur={1000} />
          <Text x={dx - 30} y={dy + 6} text={bi("dip", "انخفاض")} size={11} tone="danger" d={1500} />
          <Text x={ox - 44} y={oy - 6} text={bi("overshoot", "تجاوز")} size={11} tone="gold" d={1600} />
        </>
      ) : (
        <Curve box={ADD} points={pts(DIFF9)} tone="gold" d={300} dur={1000} />
      )}
      <Text x={460} y={40} text={bi("Shown as an image", "معروضة صورةً")} tone="heading" size={12} d={800} />
      <Pixels x={370} y={76} values={image} cell={20} max={110} show="none" d={900} stagger={60} />
      <Chip
        x={440}
        y={226}
        text={added ? bi(`around the jump: ${UN2.join(", ")}`, `حول القفزة: ${UN2.join("، ")}`) : bi("only the edge is left", "لا يبقى إلا الحافة")}
        tone={added ? "gold" : "slate"}
        center
        d={1800}
      />
    </Svg>
  );
}

function Pipeline() {
  return (
    <Svg>
      <Box x={20} y={50} w={112} h={44} label={bi("Original", "الأصل")} tone="navy" d={0} />
      <Arrow pts={[[76, 96], [76, 134]]} tone="muted" d={300} dur={300} />
      <Box x={20} y={136} w={112} h={48} label={bi("Blur (low-pass)", "تضبيب (تمرير منخفض)")} tone="outline" size={12} d={400} />
      <Arrow pts={[[134, 160], [168, 160]]} tone="muted" d={700} dur={300} />
      <Box x={170} y={136} w={112} h={48} label={bi("Scale × 1/A", "اقسم على A")} tone="outline" size={12} d={800} />
      <Arrow pts={[[284, 160], [370, 160], [370, 96]]} tone="muted" d={1100} dur={400} />
      <Arrow pts={[[134, 72], [318, 72]]} tone="navy" d={1000} dur={500} />
      <Box x={320} y={50} w={100} h={44} label={bi("Subtract", "اطرح")} tone="gold" d={1400} />
      <Arrow pts={[[422, 72], [442, 72]]} tone="muted" d={1700} dur={200} />
      <Box x={444} y={50} w={108} h={44} label={bi("Scale to show", "حجّم للعرض")} tone="outline" size={12} d={1800} />
      <Text x={24} y={222} text={bi("All in one mask:", "كل ذلك في قناع واحد:")} anchor="start" tone="heading" size={12} d={2100} />
      <Text x={24} y={258} text="δ − (1/A)·mean ∝ A·δ − mean" anchor="start" size={12} mono tone="gold" d={2300} />
      <Text x={412} y={236} text="(1/9) ×" anchor="end" size={12} mono tone="muted" d={2500} />
      <Matrix
        x={418}
        y={204}
        values={[["−1", "−1", "−1"], ["−1", "9A−1", "−1"], ["−1", "−1", "−1"]]}
        cell={42}
        ch={22}
        size={10.5}
        tone={(r, c) => (r === 1 && c === 1 ? "gold" : undefined)}
        d={2500}
      />
    </Svg>
  );
}

const BOOST: PlotBox = { x: 206, y: 56, w: 316, h: 160, domain: [0, 8], range: [-80, 220] };

function HighBoost({ control }: { control: string }) {
  const A = control === "a0" ? 0 : control === "a17" ? 1.7 : 1;
  const mask = highBoostMask(A);
  const lap = smooth1d(ROW9, [1, -2, 1]);
  const out = ROW9.map((v, i) => A * v - lap[i]);
  const zeroY = plotAt(BOOST, 0, 0)[1];
  const row = edgeHighBoost(A).map(num);
  return (
    <Svg>
      <Text x={81} y={40} text={bi("Mask", "القناع")} tone="heading" size={12} d={0} />
      <Matrix x={30} y={82} values={mask} cell={34} tone={(r, c, v) => (r === 1 && c === 1 ? "gold" : signTone(r, c, v))} d={100} />
      <Chip x={81} y={214} text={`A + 4 = ${num(A + 4)}`} tone="gold" center d={500} />
      <Curve box={BOOST} axes points={[]} d={200} />
      <Arrow pts={[[BOOST.x, zeroY], [BOOST.x + BOOST.w + 6, zeroY]]} tone="faint" head={false} d={300} dur={300} />
      <Text x={BOOST.x - 6} y={zeroY} text="0" anchor="end" size={10} mono tone="muted" d={300} />
      <Curve box={BOOST} points={STEP9} tone="muted" dashed d={400} />
      <Curve box={BOOST} points={pts(out)} tone="gold" d={700} dur={1000} />
      <Text x={262} y={250} text={bi("edge row", "صف الحافة")} anchor="end" tone="heading" size={12} d={1600} />
      <Chip x={364} y={250} text={row.join("  ")} tone={A === 0 ? "slate" : "gold"} center d={1600} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof unsharp>>({
  difference: Difference,
  "add-back": AddBack,
  pipeline: Pipeline,
  "high-boost": HighBoost,
});
