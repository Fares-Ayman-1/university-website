"use client";

import type { histograms } from "@/lib/walkthroughs/image-processing/lecture-02";
import { F, F_HIST, F_LEVELS, sum } from "@/lib/widgets/ip-lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Chip, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const LEVELS = Array.from({ length: F_LEVELS }, (_, i) => String(i));
const PICK = 3;
const N = sum(F_HIST);

function Count() {
  return (
    <Svg>
      <Text x={88} y={54} text="f" size={13} mono tone="heading" d={0} />
      <Pixels x={24} y={72} values={F} cell={32} max={F_LEVELS - 1} d={0} stagger={80} outline={(r, c) => (F[r][c] === PICK ? "gold" : undefined)} />
      <Text x={88} y={226} text="hf[f(x,y)] += 1" size={11.5} mono tone="gold" d={600} />
      <Text x={204} y={30} text="hf" size={13} mono anchor="start" tone="heading" d={500} />
      <Bars x={210} y={50} w={320} h={150} values={F_HIST} labels={LEVELS} showValues tone="slate" barTone={(i) => (i === PICK ? "gold" : undefined)} d={700} stagger={160} />
      <Chip x={370} y={248} text={`n = ${N}`} tone="outline" center d={2200} />
    </Svg>
  );
}

function Normalized() {
  const p = F_HIST.map((k) => k / N);
  return (
    <Svg>
      <Text x={140} y={36} text="n_k" size={13} mono tone="heading" d={0} />
      <Bars x={30} y={64} w={220} h={130} values={F_HIST} labels={LEVELS} showValues tone="slate" d={0} stagger={60} />
      <Text x={280} y={112} text={`÷ ${N}`} size={12.5} mono tone="gold" d={700} />
      <Arrow pts={[[258, 129], [302, 129]]} tone="gold" d={700} />
      <Text x={420} y={36} text="p(r_k) = n_k / n" size={13} mono tone="heading" d={900} />
      <Bars x={310} y={64} w={220} h={130} values={p} labels={LEVELS} max={Math.max(...p)} showValues tone="gold" d={900} stagger={60} />
      <Chip x={140} y={244} text={`n = ${N}`} tone="outline" center d={1600} />
      <Chip x={420} y={244} text={`Σ p = ${sum(p)}`} tone="success" center d={1800} />
    </Svg>
  );
}

/** 24 pixels on 16 levels for each kind of image. */
const SHAPES: Record<string, number[]> = {
  dark: [5, 7, 5, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  light: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4, 5, 7, 5],
  low: [0, 0, 0, 0, 0, 0, 5, 8, 7, 4, 0, 0, 0, 0, 0, 0],
  high: [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
};
const CAPTION: Record<string, ReturnType<typeof bi>> = {
  dark: bi("dark: bars crowd the low end", "داكنة: الأعمدة متكدسة عند الطرف المنخفض"),
  light: bi("light: bars crowd the high end", "فاتحة: الأعمدة متكدسة عند الطرف المرتفع"),
  low: bi("low contrast: a narrow cluster", "منخفضة التباين: تجمّع ضيق"),
  high: bi("high contrast: spread over the range", "عالية التباين: منتشرة على المدى كله"),
};
const ROWS = 4;
const COLS = 6;

/** The pixels of a histogram laid out as a diagonal gradient, darkest top-left. */
function imageOf(hist: readonly number[]) {
  const values = hist.flatMap((n, v) => new Array<number>(n).fill(v));
  const cells = Array.from({ length: ROWS * COLS }, (_, k) => [Math.floor(k / COLS), k % COLS] as const).sort((a, b) => a[0] + a[1] - (b[0] + b[1]) || a[0] - b[0]);
  const img = Array.from({ length: ROWS }, () => new Array<number>(COLS).fill(0));
  cells.forEach(([r, c], k) => (img[r][c] = values[k]));
  return img;
}

function Shape({ control }: { control: string }) {
  const hist = SHAPES[control] ?? SHAPES.dark;
  return (
    <Svg>
      <Pixels x={24} y={64} values={imageOf(hist)} cell={28} max={15} show="none" d={0} stagger={80} />
      <Bars x={226} y={48} w={310} h={150} values={hist} labels={hist.map((_, i) => String(i))} max={8} tone="gold" d={400} stagger={40} />
      <Chip x={280} y={246} text={CAPTION[control] ?? CAPTION.dark} tone="gold" center d={1300} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof histograms>>({
  count: Count,
  normalized: Normalized,
  shape: Shape,
});
