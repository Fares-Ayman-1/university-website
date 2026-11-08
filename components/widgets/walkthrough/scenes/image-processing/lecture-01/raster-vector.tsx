"use client";

import type { rasterVector } from "@/lib/walkthroughs/image-processing/lecture-01";
import { RASTER_SCALES, ringMask, sampleDisc } from "@/lib/widgets/ip-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Dots, Shape, VectorRing } from "./local";

const N = 12;
const RING = ringMask(N);

function Zoom({ control }: { control: string }) {
  const vector = control === "vector";
  const small = 48;
  const big = 216;
  const bx = 200;
  const by = 36;
  return (
    <Svg>
      {vector ? <VectorRing x={40} y={110} size={small} r={small * 0.35} width={small * 0.13} d={0} /> : <Pixels x={40} y={110} values={RING} cell={small / N} max={1} show="none" d={0} />}
      <Text x={64} y={176} text="1×" size={12} tone="heading" mono d={100} />
      <Arrow pts={[[96, 134], [192, 134]]} tone="gold" d={300} label={bi("zoom in", "كبِّر")} labelAt={[144, 112]} labelTone="gold" />
      {vector ? (
        <VectorRing x={bx} y={by} size={big} r={big * 0.35} width={big * 0.13} d={600} />
      ) : (
        <Pixels x={bx} y={by} values={RING} cell={big / N} max={1} show="none" d={600} stagger={40} />
      )}
      <Text x={bx + big / 2} y={by + big + 16} text="4.5×" size={12} tone="heading" mono d={700} />
      {vector ? (
        <>
          <Chip x={490} y={100} text={bi("still smooth", "ما زالت ناعمة")} tone="success" center d={1200} />
          <Chip x={490} y={160} text={bi("drawn by formula", "تُرسم بالصيغة")} tone="outline" center d={1400} />
        </>
      ) : (
        <>
          <Chip x={490} y={100} text={bi("pixelated", "متقطعة إلى مربعات")} tone="danger" center d={1200} />
          <Chip x={490} y={160} text={bi("only 144 pixels", "144 بكسلًا فقط")} tone="outline" center d={1400} />
        </>
      )}
    </Svg>
  );
}

const STEPS = [bi("1. draw a dot at a", "1. ارسم نقطة عند a"), bi("2. draw a dot at b", "2. ارسم نقطة عند b"), bi("3. join them with a line", "3. صِلهما بخط"), bi("4. colour the line red", "4. لوِّن الخط بالأحمر")];

function Instructions() {
  const line = (ax: number, bx: number, y: number, d: number) => (
    <>
      <Dots pts={[[ax, y]]} tone="danger" r={5} d={d} />
      <Text x={ax} y={y - 16} text="a" size={12} tone="heading" mono d={d} />
      <Dots pts={[[bx, y]]} tone="danger" r={5} d={d + 300} />
      <Text x={bx} y={y - 16} text="b" size={12} tone="heading" mono d={d + 300} />
      <Arrow pts={[[ax, y], [bx, y]]} tone="danger" head={false} width={5} d={d + 600} dur={500} />
    </>
  );
  return (
    <Svg>
      {STEPS.map((s, i) => (
        <Box key={i} x={16} y={30 + i * 56} w={236} h={46} label={s} tone="outline" size={12} d={i * 300} />
      ))}
      {line(330, 440, 76, 200)}
      <Text x={530} y={76} text="1×" size={12} tone="muted" mono d={500} />
      {line(300, 520, 156, 1400)}
      <Text x={300} y={184} text="2×" size={12} tone="muted" mono d={1700} />
      <Chip x={410} y={214} text={bi("same 4 instructions", "التعليمات الأربع نفسها")} tone="gold" center d={2300} />
      <Chip x={410} y={256} text={bi("same file size", "حجم الملف نفسه")} tone="success" center d={2500} />
    </Svg>
  );
}

const SIZES = [
  { n: 4, cx: 50 },
  { n: 8, cx: 130 },
  { n: 16, cx: 262 },
];
const CELL = 8;

function TradeOffs({ control }: { control: string }) {
  const vector = control === "vector";
  const base = 196;
  return (
    <Svg>
      {SIZES.map(({ n, cx }, i) => {
        const side = n * CELL;
        const d = i * 400;
        const bytes = RASTER_SCALES[i].bytes.toLocaleString("en-US");
        return (
          <g key={n}>
            {vector ? (
              <Shape x={cx - side / 2 + side * 0.1} y={base - side + side * 0.1} w={side * 0.8} h={side * 0.8} ellipse fill="var(--gold)" stroke="var(--gold-text)" d={d} />
            ) : (
              <Pixels x={cx - side / 2} y={base - side} values={sampleDisc(n)} cell={CELL} show="none" d={d} />
            )}
            <Text x={cx} y={base + 16} text={`${RASTER_SCALES[i].scale}×`} size={12} tone="heading" mono d={d} />
            <Text x={cx} y={base + 38} text={vector ? bi("same size", "الحجم نفسه") : `${bytes} B`} size={11} tone={vector ? "success" : i === 2 ? "danger" : "muted"} mono={!vector} d={d + 200} />
          </g>
        );
      })}
      {vector ? (
        <>
          <Chip x={460} y={70} text={bi("logos, fonts, diagrams", "الشعارات، والخطوط، والمخططات")} tone="gold" center d={1300} />
          <Chip x={460} y={130} text="SVG · EPS · AI · PDF" tone="outline" center d={1500} />
        </>
      ) : (
        <>
          <Chip x={460} y={70} text={bi("size grows with pixels", "الحجم يكبر بزيادة البكسلات")} tone="danger" center d={1300} />
          <Chip x={460} y={130} text={bi("photographs", "الصور الفوتوغرافية")} tone="gold" center d={1500} />
          <Chip x={460} y={178} text="JPEG · PNG · BMP · TIFF" tone="outline" center d={1700} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof rasterVector>>({
  zoom: Zoom,
  instructions: Instructions,
  "trade-offs": TradeOffs,
});
