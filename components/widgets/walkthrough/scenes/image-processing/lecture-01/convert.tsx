"use client";

import type { convert } from "@/lib/walkthroughs/image-processing/lecture-01";
import { FLOWER, PEPPERS_BYTES, RGB2GRAY_WEIGHTS, binaryRows, flowerSum, threshold, toGray, type GrayMethod } from "@/lib/widgets/ip-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Pixels, Svg, Text, fmt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Veil } from "./local";

const n = (v: number) => v.toLocaleString("en-US");

function Functions() {
  return (
    <Svg>
      <Box x={220} y={30} w={120} h={44} label="RGB" tone="gold" d={0} />
      <Box x={24} y={146} w={136} h={44} label={bi("Grayscale", "رمادية")} tone="slate" d={150} />
      <Box x={400} y={146} w={136} h={44} label={bi("Indexed", "مفهرسة")} tone="navy" d={300} />
      <Box x={24} y={232} w={136} h={44} label={bi("Binary", "ثنائية")} tone="outline" d={450} />
      <Arrow pts={[[236, 80], [128, 140]]} tone="gold" d={600} label="rgb2gray" labelAt={[198, 128]} labelTone="gold" />
      <Arrow pts={[[116, 140], [222, 80]]} tone="slate" d={700} label="gray2rgb" labelAt={[136, 92]} labelTone="slate" />
      <Arrow pts={[[324, 80], [432, 140]]} tone="gold" d={800} label="rgb2ind" labelAt={[362, 128]} labelTone="gold" />
      <Arrow pts={[[444, 140], [338, 80]]} tone="slate" d={900} label="ind2rgb" labelAt={[424, 92]} labelTone="slate" />
      <Arrow pts={[[164, 160], [396, 160]]} tone="gold" d={1000} label="gray2ind" labelAt={[280, 148]} labelTone="gold" />
      <Arrow pts={[[396, 176], [164, 176]]} tone="slate" d={1100} label="ind2gray" labelAt={[280, 190]} labelTone="slate" />
      <Arrow pts={[[92, 194], [92, 228]]} tone="gold" d={1200} label="g >= 128" labelAt={[134, 211]} labelTone="gold" />
    </Svg>
  );
}

const CHANNELS = [
  { key: "R" as const, tone: "danger" as const, x: 16 },
  { key: "G" as const, tone: "success" as const, x: 112 },
  { key: "B" as const, tone: "navy" as const, x: 208 },
];
const METHOD_NAME: Record<GrayMethod, { en: string; ar: string }> = {
  average: bi("Solution 1: average", "الحل الأول: المتوسط"),
  red: bi("Solution 2: keep R", "الحل الثاني: الإبقاء على R"),
  weighted: bi("rgb2gray: weighted sum", "rgb2gray: مجموع موزون"),
};

function RgbToGray({ control }: { control: string }) {
  const method = control as GrayMethod;
  const gray = toGray(method);
  const cell = 28;
  const [r, g, b] = [FLOWER.R[0][0], FLOWER.G[0][0], FLOWER.B[0][0]];
  const [wr, wg, wb] = RGB2GRAY_WEIGHTS;
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

function Sizes({ control }: { control: string }) {
  const python = control === "python";
  const bars = python
    ? [
        { v: PEPPERS_BYTES.rgb, label: "rgb uint8" },
        { v: PEPPERS_BYTES.gray, label: "gray_avg uint8" },
        { v: PEPPERS_BYTES.binary, label: "binary bool" },
      ]
    : [
        { v: PEPPERS_BYTES.rgb, label: "x uint8" },
        { v: PEPPERS_BYTES.gray, label: "g uint8" },
        { v: PEPPERS_BYTES.binary, label: "bw logical" },
        { v: PEPPERS_BYTES.double, label: "y double" },
      ];
  const x = 56;
  const w = 448;
  const top = 56;
  const h = 150;
  const max = python ? PEPPERS_BYTES.rgb : PEPPERS_BYTES.double;
  const slot = w / bars.length;
  return (
    <Svg>
      <Text x={280} y={22} text={python ? "rgb.nbytes, gray_avg.nbytes" : "whos x g bw y"} tone="heading" size={12.5} mono d={0} />
      <Bars x={x} y={top} w={w} h={h} values={bars.map((b) => b.v)} max={max} labels={bars.map((b) => b.label)} barTone={(i) => (bars[i].label.includes("double") ? "danger" : "slate")} d={200} stagger={200} gap={0.4} />
      {bars.map((b, i) => (
        <Text key={i} x={x + slot * (i + 0.5)} y={top + h - (b.v / max) * h - 12} text={n(b.v)} size={11} tone="heading" mono d={400 + i * 200} />
      ))}
      <Chip
        x={280}
        y={252}
        text={python ? bi("same bytes as MATLAB's uint8", "البايتات نفسها كما في uint8 في MATLAB") : bi("double: 8 bytes per value = 8×", "double: ثمانية بايتات لكل قيمة = 8 أضعاف")}
        tone={python ? "outline" : "danger"}
        center
        d={1200}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof convert>>({
  functions: Functions,
  "rgb-to-gray": RgbToGray,
  threshold: Threshold,
  sizes: Sizes,
});
