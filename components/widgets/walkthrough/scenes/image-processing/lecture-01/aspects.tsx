"use client";

import type { aspects } from "@/lib/walkthroughs/image-processing/lecture-01";
import { AERIAL, BLURRED_ROW, DULL, RESTORED_ROW, SCENE_ROW, SEGMENTS, SHARPENED_ROW, STRETCHED, type SegClass } from "@/lib/widgets/ip-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Pixels, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Swatch } from "./local";

function Enhancement() {
  const cell = 44;
  const flat = (g: readonly (readonly number[])[]) => g.flat();
  const range = (g: readonly (readonly number[])[]) => `${Math.min(...flat(g))} … ${Math.max(...flat(g))}`;
  return (
    <Svg>
      <Pixels x={30} y={40} values={DULL} cell={cell} d={0} stagger={60} />
      <Text x={118} y={238} text={bi("dull: grey levels", "باهتة: مستويات الرمادي")} tone="heading" size={12} d={300} />
      <Text x={118} y={268} text={range(DULL)} tone="muted" size={11.5} mono d={300} />
      <Arrow pts={[[214, 128], [346, 128]]} tone="gold" d={600} label={bi("stretch to 0 … 255", "مطّ إلى 0 … 255")} labelAt={[280, 104]} labelTone="gold" />
      <Token pts={[[214, 128], [346, 128]]} d={700} dur={500} />
      <Pixels x={354} y={40} values={STRETCHED} cell={cell} d={1000} stagger={60} />
      <Text x={442} y={238} text={bi("enhanced: full range", "محسَّنة: المدى كاملًا")} tone="heading" size={12} d={1300} />
      <Text x={442} y={268} text={range(STRETCHED)} tone="muted" size={11.5} mono d={1300} />
    </Svg>
  );
}

function Restoration({ control }: { control: string }) {
  const restore = control === "restore";
  const cell = 46;
  const x = 172;
  const rows = [
    { y: 34, values: SCENE_ROW, label: bi("scene (unknown)", "المشهد (مجهول)") },
    { y: 116, values: BLURRED_ROW, label: bi("blurred b", "المشوَّشة b") },
    { y: 198, values: restore ? RESTORED_ROW : SHARPENED_ROW, label: restore ? bi("restored f", "المستعادة f") : bi("sharpened", "بعد الإبراز") },
  ];
  const result = rows[2].values;
  return (
    <Svg>
      {rows.map((r, i) => (
        <g key={i}>
          <Text x={x - 10} y={r.y + cell / 2 - 8} text={r.label} anchor="end" tone={i === 2 ? (restore ? "success" : "danger") : "heading"} size={12} d={i * 500} />
          <Pixels
            x={x}
            y={r.y}
            values={[r.values]}
            cell={cell}
            outline={i === 2 ? (_, c) => (result[c] === SCENE_ROW[c] ? "success" : "danger") : undefined}
            d={i * 500 + 100}
          />
        </g>
      ))}
      <Arrow pts={[[x + 4 * cell, 34 + cell + 2], [x + 4 * cell, 114]]} tone="danger" d={400} dur={250} label={bi("camera slid 1 pixel", "انزلقت الكاميرا بكسلًا")} labelAt={[x + 4 * cell + 82, 92]} labelTone="danger" />
      <Arrow pts={[[x + 4 * cell, 116 + cell + 2], [x + 4 * cell, 196]]} tone={restore ? "success" : "gold"} d={900} dur={250} label={restore ? "f(i) = 2·b(i) − f(i−1)" : bi("generic sharpen", "إبراز عام")} labelAt={[x + 4 * cell + (restore ? 100 : 66), 174]} labelTone={restore ? "success" : "gold"} />
    </Svg>
  );
}

const SEG_COLORS: Record<SegClass, string> = { road: "#7d8590", tree: "#3f8f55", building: "#c27a3a", car: "#d64545" };
const SEG_NAMES: Record<SegClass, { en: string; ar: string }> = {
  road: bi("road", "طريق"),
  tree: bi("tree", "شجرة"),
  building: bi("building", "مبنى"),
  car: bi("car", "سيارة"),
};

function Segmentation({ control }: { control: string }) {
  const classes = control === "classes";
  const cell = 34;
  return (
    <Svg>
      <Pixels
        x={24}
        y={30}
        values={AERIAL}
        cell={cell}
        colors={classes ? SEGMENTS.map((row) => row.map((c) => SEG_COLORS[c])) : undefined}
        show={classes ? "none" : "values"}
        d={0}
        stagger={classes ? 0 : 60}
      />
      <Text x={160} y={252} text={classes ? bi("every pixel has a class", "لكل بكسل فئة") : bi("aerial view, grey levels", "منظر جوي، مستويات الرمادي")} tone="heading" size={12} d={400} />
      {classes ? (
        (Object.keys(SEG_COLORS) as SegClass[]).map((k, i) => (
          <g key={k}>
            <Swatch x={360} y={56 + i * 50} size={28} fill={SEG_COLORS[k]} d={500 + i * 150} />
            <Text x={400} y={64 + i * 50} text={SEG_NAMES[k]} anchor="start" tone="heading" size={12.5} d={500 + i * 150} />
          </g>
        ))
      ) : (
        <Text x={440} y={140} text={bi("road? tree? building? car?", "طريق؟ شجرة؟ مبنى؟ سيارة؟")} tone="muted" size={12.5} d={700} />
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof aspects>>({
  enhancement: Enhancement,
  restoration: Restoration,
  segmentation: Segmentation,
});
