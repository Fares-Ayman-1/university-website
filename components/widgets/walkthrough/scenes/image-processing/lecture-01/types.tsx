"use client";

import type { types } from "@/lib/walkthroughs/image-processing/lecture-01";
import { BINARY_EDGES, BOXED_INDEX, EMU_INDICES, EMU_MAP, FACE, FLOWER, TRUE_COLORS, crop, levels, mapColor, mapRow, requantize } from "@/lib/widgets/ip-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Chip, Pixels, Svg, Table, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { NumGrid, Stripes, Swatch } from "./local";

function Binary() {
  return (
    <Svg>
      <Pixels x={30} y={40} values={BINARY_EDGES} cell={32} max={1} d={0} stagger={60} />
      <Text x={142} y={250} text={bi("edge image of a block", "صورة حواف مكعب")} tone="heading" size={12} d={400} />
      <Chip x={420} y={80} text={bi("1 bit per pixel", "بِت واحد لكل بكسل")} tone="gold" center d={600} />
      <Text x={420} y={140} text={bi("0 = black, 1 = white", "0 = أسود، 1 = أبيض")} tone="heading" size={12.5} d={800} />
      <Chip x={420} y={206} text={bi("text, fingerprints, plans", "النصوص، والبصمات، والمخططات")} tone="outline" center d={1000} />
    </Svg>
  );
}

const PATCH = crop(FACE, 1, 3, 6, 6);
const AR_BITS: Record<number, string> = { 1: "بِت واحد", 2: "بِتّين" };

function Grayscale({ control }: { control: string }) {
  const k = Number(control.slice(1));
  const L = levels(k);
  const values = PATCH.map((row) => row.map((v) => requantize(v, k)));
  return (
    <Svg>
      <Pixels x={30} y={40} values={values} cell={32} d={0} stagger={50} />
      <Text x={126} y={250} text={bi(`face patch at ${k} bit${k > 1 ? "s" : ""}`, `رقعة الوجه بعمق ${AR_BITS[k] ?? `${k} بِتّات`}`)} tone="heading" size={12} d={300} />
      <Text x={410} y={44} text={bi("every grey level available", "كل مستويات الرمادي المتاحة")} tone="muted" size={11.5} d={400} />
      <Stripes x={290} y={68} w={240} h={36} f={(u) => requantize(Math.min(255, u * 256), k)} d={500} />
      <Text x={290} y={116} text="0" anchor="start" size={10.5} tone="muted" mono d={500} />
      <Text x={530} y={116} text="255" anchor="end" size={10.5} tone="muted" mono d={500} />
      <Chip x={410} y={164} text={`k = ${k}  →  L = 2^${k} = ${L.toLocaleString("en-US")}`} tone={k === 8 ? "gold" : "outline"} center d={800} />
      <Text x={410} y={214} text={bi(`${L} grey levels`, `عدد مستويات الرمادي: ${L}`)} tone="heading" size={13} d={1000} />
    </Svg>
  );
}

const CHANNELS = [
  { key: "R" as const, tint: (v: number) => `rgb(${v},0,0)`, tone: "danger" as const, x: 20 },
  { key: "G" as const, tint: (v: number) => `rgb(0,${v},0)`, tone: "success" as const, x: 134 },
  { key: "B" as const, tint: (v: number) => `rgb(0,0,${v})`, tone: "navy" as const, x: 248 },
];

function Rgb() {
  const cell = 30;
  const composite = FLOWER.R.map((row, i) => row.map((r, j) => `rgb(${r},${FLOWER.G[i][j]},${FLOWER.B[i][j]})`));
  return (
    <Svg>
      {CHANNELS.map((ch, i) => (
        <g key={ch.key}>
          <Chip x={ch.x + 45} y={46} text={ch.key} tone={ch.tone} center w={34} d={i * 250} />
          <Pixels x={ch.x} y={66} values={FLOWER[ch.key]} cell={cell} colors={FLOWER[ch.key].map((row) => row.map(ch.tint))} d={i * 250 + 100} />
          {i < 2 ? <Text x={ch.x + 102} y={111} text="+" size={16} tone="muted" d={i * 250 + 200} /> : null}
        </g>
      ))}
      <Text x={364} y={111} text="=" size={16} tone="muted" d={900} />
      <Text x={452} y={30} text={bi("the colour pixels", "البكسلات الملونة")} tone="heading" size={12} d={1000} />
      <Pixels x={392} y={52} values={FLOWER.R} cell={40} colors={composite} show="none" d={1000} />
      <Chip x={280} y={214} text={bi("3 × 8 = 24 bits per pixel", "3 × 8 = 24 بِتًّا لكل بكسل")} tone="gold" center d={1300} />
      <Chip x={280} y={256} text={bi(`2^24 = ${TRUE_COLORS.toLocaleString("en-US")} colours`, `2^24 = ${TRUE_COLORS.toLocaleString("en-US")} لونًا`)} tone="outline" center d={1500} />
    </Svg>
  );
}

function Indexed() {
  const cell = 34;
  const gx = 20;
  const gy = 50;
  const boxed = { r: 1, c: 4 };
  const rh = 22;
  const tx = 300;
  const ty = 30;
  const rowY = ty + rh * (BOXED_INDEX + 1) + rh / 2;
  const fmt4 = (v: number) => v.toFixed(4);
  return (
    <Svg>
      <NumGrid x={gx} y={gy} values={EMU_INDICES} cell={cell} tone={(r, c) => (r === boxed.r && c === boxed.c ? "gold" : undefined)} d={0} stagger={150} />
      <Text x={gx + 3 * cell} y={gy + 2 * cell + 16} text={bi("indices (uint8)", "الفهارس (uint8)")} tone="heading" size={12} d={200} />
      <Table
        x={tx}
        y={ty}
        cols={["row", "R", "G", "B"]}
        cw={[44, 62, 62, 62]}
        rh={rh}
        size={11}
        rows={EMU_MAP.map((rgb, i) => [String(i + 1), ...rgb.map(fmt4)])}
        cell={(r) => (r === BOXED_INDEX ? "gold" : undefined)}
        d={300}
        stagger={70}
      />
      {EMU_MAP.map((_, i) => (
        <Swatch key={i} x={tx + 236} y={ty + rh * (i + 1) + 2} size={rh - 4} fill={mapColor(i)} d={300 + (i + 1) * 70} />
      ))}
      <Text x={tx + 115} y={ty + rh * 9 + 16} text={bi("colour map", "خريطة الألوان")} tone="heading" size={12} d={900} />
      <Arrow
        pts={[
          [gx + (boxed.c + 0.5) * cell, gy - 2],
          [gx + (boxed.c + 0.5) * cell, gy - 14],
          [262, gy - 14],
          [262, rowY],
          [tx - 4, rowY],
        ]}
        tone="gold"
        d={1200}
        dur={600}
      />
      <Chip x={256} y={150} text={bi(`${BOXED_INDEX} → row ${mapRow(BOXED_INDEX)}`, `${BOXED_INDEX} ← الصف ${mapRow(BOXED_INDEX)}`)} tone="gold" center d={1600} />
      <Pixels x={gx} y={170} values={EMU_INDICES} cell={cell} colors={EMU_INDICES.map((row) => row.map(mapColor))} show="none" d={1800} />
      <Text x={gx + 3 * cell} y={254} text={bi("the pixels shown", "البكسلات المعروضة")} tone="heading" size={12} d={1900} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof types>>({
  binary: Binary,
  grayscale: Grayscale,
  rgb: Rgb,
  indexed: Indexed,
});
