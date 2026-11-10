"use client";

import type { convert } from "@/lib/walkthroughs/image-processing/lecture-01";
import { FLOWER, PEPPERS_BYTES, GRAY_WEIGHTS, binaryRows, flowerSum, threshold, toGray, type GrayMethod } from "@/lib/widgets/ip-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Chip, Pixels, Svg, Text, fmt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Veil } from "./local";

const n = (v: number) => v.toLocaleString("en-US");

const CHANNELS = [
  { key: "R" as const, tone: "danger" as const, x: 16 },
  { key: "G" as const, tone: "success" as const, x: 112 },
  { key: "B" as const, tone: "navy" as const, x: 208 },
];
const METHOD_NAME: Record<GrayMethod, { en: string; ar: string }> = {
  average: bi("Solution 1: average", "الحل الأول: المتوسط"),
  red: bi("Solution 2: keep R", "الحل الثاني: الإبقاء على R"),
  weighted: bi("Weighted sum", "مجموع موزون"),
};

function RgbToGray({ control }: { control: string }) {
  const method = control as GrayMethod;
  const gray = toGray(method);
  const cell = 28;
  const [r, g, b] = [FLOWER.R[0][0], FLOWER.G[0][0], FLOWER.B[0][0]];
  const [wr, wg, wb] = GRAY_WEIGHTS;
  const exact = method === "weighted" ? wr * r + wg * g + wb * b : flowerSum(0, 0) / 3;
  const formula =
    method === "red"
      ? `Gray = R = ${r}`
      : method === "weighted"
        ? `${wr.toFixed(4)}·${r} + ${wg.toFixed(4)}·${g} + ${wb.toFixed(4)}·${b} = ${fmt(exact)} → ${gray[0][0]}`
        : `(${r} + ${g} + ${b}) / 3 = ${flowerSum(0, 0)} / 3 = ${fmt(exact)} → ${gray[0][0]}`;
  return (
    <Svg>
      {CHANNELS.map((ch, i) => (
        <g key={ch.key}>
          <Chip x={ch.x + 42} y={36} text={ch.key} tone={ch.tone} center w={34} d={i * 150} />
          <Pixels x={ch.x} y={56} values={FLOWER[ch.key]} cell={cell} outline={(i2, j) => (i2 === 0 && j === 0 ? "gold" : undefined)} d={i * 150 + 50} />
          {method === "red" && ch.key !== "R" ? <Veil x={ch.x} y={56} w={3 * cell} h={3 * cell} d={600} /> : null}
        </g>
      ))}
      <Arrow pts={[[302, 98], [362, 98]]} tone="gold" d={700} dur={300} />
      <Pixels x={372} y={38} values={gray} cell={40} outline={(i, j) => (i === 0 && j === 0 ? "gold" : undefined)} d={900} stagger={80} />
      <Text x={432} y={174} text={bi("grey image", "الصورة الرمادية")} tone="heading" size={12} d={1000} />
      <Text x={280} y={210} text={formula} tone="heading" size={12} mono d={1200} />
      <Chip x={280} y={252} text={METHOD_NAME[method]} tone="gold" center d={1400} />
    </Svg>
  );
}

const AVG = toGray("average");

function Threshold({ control }: { control: string }) {
  const t = control === "t128" ? 128 : 75;
  const bw = threshold(AVG, t);
  const ones = bw.flat().filter(Boolean).length;
  const cell = 46;
  return (
    <Svg>
      <Pixels x={40} y={40} values={AVG} cell={cell} outline={(r, c) => (AVG[r][c] >= t ? "gold" : undefined)} d={0} stagger={80} />
      <Text x={109} y={196} text={bi("Gray (averaged)", "الرمادية (بالمتوسط)")} tone="heading" size={12} d={300} />
      <Arrow pts={[[188, 109], [372, 109]]} tone="gold" d={600} label={`Gray ≥ ${t} → 1`} labelAt={[280, 88]} labelTone="gold" />
      <Pixels x={382} y={40} values={bw} cell={cell} max={1} d={1000} stagger={80} />
      <Text x={451} y={196} text={bi("Binary", "الثنائية")} tone="heading" size={12} d={1200} />
      <Text x={451} y={232} text={binaryRows(bw)} tone="muted" size={12} mono d={1300} />
      <Chip
        x={160}
        y={244}
        text={ones ? bi(`${ones} pixels reach T = ${t}`, `${ones} بكسلات تبلغ T = ${t}`) : bi(`no pixel reaches T = ${t}`, `لا بكسل يبلغ T = ${t}`)}
        tone={ones ? "success" : "danger"}
        center
        d={1500}
      />
    </Svg>
  );
}

const SIZE_BARS = [
  { v: PEPPERS_BYTES.rgb, label: "rgb uint8" },
  { v: PEPPERS_BYTES.gray, label: "gray_avg uint8" },
  { v: PEPPERS_BYTES.binary, label: "binary bool" },
];

function Sizes() {
  const x = 56;
  const w = 448;
  const top = 56;
  const h = 150;
  const max = PEPPERS_BYTES.rgb;
  const slot = w / SIZE_BARS.length;
  return (
    <Svg>
      <Text x={280} y={22} text="rgb.nbytes, gray_avg.nbytes, binary.nbytes" tone="heading" size={12.5} mono d={0} />
      <Bars x={x} y={top} w={w} h={h} values={SIZE_BARS.map((b) => b.v)} max={max} labels={SIZE_BARS.map((b) => b.label)} tone="slate" d={200} stagger={200} gap={0.4} />
      {SIZE_BARS.map((b, i) => (
        <Text key={i} x={x + slot * (i + 0.5)} y={top + h - (b.v / max) * h - 12} text={n(b.v)} size={11} tone="heading" mono d={400 + i * 200} />
      ))}
      <Chip x={280} y={252} text={bi("1 byte per value: RGB has 3 values per pixel", "بايت واحد لكل قيمة: لصورة RGB ثلاث قيم لكل بكسل")} tone="outline" center d={1200} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof convert>>({
  "rgb-to-gray": RgbToGray,
  threshold: Threshold,
  sizes: Sizes,
});
