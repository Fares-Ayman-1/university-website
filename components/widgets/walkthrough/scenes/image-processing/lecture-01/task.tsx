"use client";

import type { task } from "@/lib/walkthroughs/image-processing/lecture-01";
import { COINS, COINS_AFTER, COINS_BEFORE, COINS_BW, COIN_T } from "@/lib/widgets/ip-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Pixels, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const STEPS = [
  { label: bi("1. Acquire the image", "1. التقاط الصورة"), example: bi("photograph the car, digitize it", "تصوير السيارة وتحويلها إلى صيغة رقمية") },
  { label: bi("2. Preprocess", "2. المعالجة المسبقة"), example: bi("brighten a dark photo, remove noise", "زيادة سطوع الصورة الداكنة وإزالة ضوضائها") },
  { label: bi("3. Segment", "3. التقطيع"), example: bi("find the plate, then each character", "إيجاد اللوحة، ثم كل حرف عليها") },
  { label: bi("4. Represent and describe", "4. التمثيل والوصف"), example: bi("describe each character's strokes", "وصف خطوط كل حرف") },
  { label: bi("5. Recognise and interpret", "5. التعرّف والتفسير"), example: bi('read "DS 8354", open the gate', "قراءة «DS 8354» وفتح البوابة") },
];

function Steps() {
  const y = (i: number) => 12 + i * 52;
  return (
    <Svg>
      <Arrow pts={[[14, 20], [14, 258]]} tone="gold" d={0} dur={2000} />
      <Token pts={[[14, 20], [14, 258]]} d={200} dur={2200} />
      {STEPS.map((s, i) => (
        <g key={i}>
          <Box x={26} y={y(i)} w={204} h={46} label={s.label} tone={i === 4 ? "muted" : "navy"} dashed={i === 4} size={12} d={i * 350} />
          <Text x={246} y={y(i) + 15} text={s.example} anchor="start" tone={i === 4 ? "muted" : "heading"} size={11.5} d={i * 350 + 150} />
        </g>
      ))}
      <Chip x={462} y={y(4) + 25} text={bi("course book", "كتاب المقرر")} tone="muted" size={10} d={1600} w={86} />
    </Svg>
  );
}

function SegmentCoins({ control }: { control: string }) {
  const binary = control === "binary";
  const cell = 22;
  return (
    <Svg>
      <Pixels x={24} y={38} values={binary ? COINS_BW : COINS} cell={cell} max={binary ? 1 : 255} d={0} stagger={40} />
      {binary ? (
        <>
          <Chip x={420} y={70} text={`bw = g < ${COIN_T}`} tone="gold" center d={600} />
          <Text x={420} y={120} text={bi("coins → 1 (white)", "العملات ← 1 (أبيض)")} tone="heading" size={12} d={800} />
          <Text x={420} y={164} text={bi("background → 0 (black)", "الخلفية ← 0 (أسود)")} tone="heading" size={12} d={1000} />
          <Chip x={420} y={226} text={bi("3 coins, 2 blobs?", "3 عملات، كتلتان؟")} tone="warn" center d={1300} />
        </>
      ) : (
        <>
          <Text x={420} y={80} text={bi("dark coins: 70 … 90", "العملات الداكنة: 70 … 90")} tone="heading" size={12} d={600} />
          <Text x={420} y={130} text={bi("light background: 196 … 220", "الخلفية الفاتحة: 196 … 220")} tone="heading" size={12} d={800} />
          <Chip x={420} y={200} text={`T = ${COIN_T}`} tone="gold" center d={1100} />
        </>
      )}
    </Svg>
  );
}

const BLOB_COLORS = ["#111", "#e0b84a", "#3aa7a0", "#e06a5a"];

function ErodeCount({ control }: { control: string }) {
  const after = control === "after";
  const { labels, n } = after ? COINS_AFTER : COINS_BEFORE;
  const cell = 22;
  const colors = labels.map((row) => row.map((l) => BLOB_COLORS[l]));
  const bridge = (r: number, c: number) => !after && (r === 4 || r === 5) && (c === 7 || c === 8);
  return (
    <Svg>
      <Pixels x={24} y={38} values={labels} cell={cell} colors={colors} show="none" outline={(r, c) => (bridge(r, c) ? "danger" : undefined)} d={0} stagger={40} />
      <Text x={420} y={64} text={`N = ${n}`} tone={after ? "success" : "danger"} size={24} mono d={600} />
      <Text x={420} y={108} text={after ? bi("erosion split the blob", "فصل التآكل الكتلة") : bi("two coins touch: one blob", "عملتان متلامستان: كتلة واحدة")} tone={after ? "success" : "danger"} size={12} d={800} />
      <Chip x={420} y={170} text={after ? "imerode(bw, se)" : "bwlabel(bw)"} tone="outline" center d={1000} />
      <Text x={420} y={222} text={bi("each colour = one region", "كل لون = منطقة واحدة")} tone="muted" size={11.5} d={1200} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof task>>({
  steps: Steps,
  "segment-coins": SegmentCoins,
  "erode-count": ErodeCount,
});
