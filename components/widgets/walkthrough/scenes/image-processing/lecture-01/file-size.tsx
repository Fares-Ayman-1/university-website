"use client";

import type { fileSize } from "@/lib/walkthroughs/image-processing/lecture-01";
import { CAMERA_PIXELS, STORAGE, sampleDisc } from "@/lib/widgets/ip-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Ball, Frame, Swatch } from "./local";

const n = (v: number) => v.toLocaleString("en-US");

function Resolution({ control }: { control: string }) {
  const high = control === "high";
  const k = high ? 16 : 6;
  const size = 192;
  return (
    <Svg>
      <Ball x={40} y={40} size={160} label={bi("the scene", "المشهد")} d={0} />
      <Arrow pts={[[208, 120], [252, 120]]} tone="gold" d={400} dur={300} label={bi("scan", "مسح")} labelAt={[230, 98]} labelTone="gold" />
      <Pixels x={260} y={24} values={sampleDisc(k)} cell={size / k} show={high ? "none" : "values"} d={600} stagger={high ? 20 : 80} />
      <Text x={356} y={236} text={bi(`${k} × ${k} pixels`, `${k} × ${k} بكسلًا`)} tone="heading" size={12} d={900} />
      <Chip x={506} y={120} text={high ? bi("smooth", "ناعمة") : bi("blocky", "خشنة")} tone={high ? "success" : "danger"} center d={1200} />
    </Svg>
  );
}

const COLORS: { name: { en: string; ar: string }; rgb: [number, number, number] }[] = [
  { name: bi("Black", "أسود"), rgb: [0, 0, 0] },
  { name: bi("Red", "أحمر"), rgb: [255, 0, 0] },
  { name: bi("Green", "أخضر"), rgb: [0, 255, 0] },
  { name: bi("Blue", "أزرق"), rgb: [0, 0, 255] },
  { name: bi("Yellow", "أصفر"), rgb: [255, 255, 0] },
  { name: bi("Cyan", "سماوي"), rgb: [0, 255, 255] },
  { name: bi("Magenta", "أرجواني"), rgb: [255, 0, 255] },
  { name: bi("White", "أبيض"), rgb: [255, 255, 255] },
  { name: bi("Grey", "رمادي"), rgb: [128, 128, 128] },
];

function ColorDepth() {
  return (
    <Svg>
      {COLORS.map((c, i) => {
        const x = 24 + (i % 3) * 180;
        const y = 22 + Math.floor(i / 3) * 68;
        const grey = i === COLORS.length - 1;
        return (
          <g key={i}>
            <Swatch x={x} y={y} size={44} fill={`rgb(${c.rgb.join(",")})`} d={i * 120} />
            <Text x={x + 54} y={y + 10} text={c.name} anchor="start" tone={grey ? "gold" : "heading"} size={12} d={i * 120} />
            <Text x={x + 54} y={y + 42} text={`(${c.rgb.join(", ")})`} anchor="start" tone="muted" size={11} mono d={i * 120} />
            {grey ? <Frame x={x - 6} y={y - 6} w={172} h={58} d={1300} /> : null}
          </g>
        );
      })}
      <Chip x={180} y={254} text={bi("8 + 8 + 8 = 24 bits", "8 + 8 + 8 = 24 بِتًّا")} tone="gold" center d={1400} />
      <Chip x={420} y={254} text={bi("R = G = B → grey", "R = G = B ← رمادي")} tone="outline" center d={1600} />
    </Svg>
  );
}

function FileSize({ control }: { control: string }) {
  const indexed = control === "indexed";
  const s = indexed ? STORAGE.indexed : STORAGE.trueColor;
  const y = 40;
  const h = 62;
  return (
    <Svg>
      <Box x={20} y={y} w={104} h={h} label={n(CAMERA_PIXELS)} sub={bi("pixels", "بكسل")} tone="slate" mono size={12.5} d={0} />
      <Text x={138} y={y + h / 2} text="×" size={16} tone="muted" d={200} />
      <Box x={152} y={y} w={84} h={h} label={String(s.bpp)} sub={bi("bits / pixel", "بِت لكل بكسل")} tone={indexed ? "slate" : "gold"} mono size={12.5} d={300} />
      <Text x={250} y={y + h / 2} text="=" size={16} tone="muted" d={500} />
      <Box x={264} y={y} w={112} h={h} label={n(s.bits)} sub={bi("bits", "بِت")} tone="outline" mono size={12.5} d={600} />
      <Text x={398} y={y + h / 2} text="÷ 8 =" size={13} tone="muted" mono d={800} />
      <Box x={420} y={y} w={120} h={h} label={n(s.bytes)} sub={bi("bytes", "بايت")} tone="navy" mono size={12.5} d={900} />
      <Bars
        x={70}
        y={136}
        w={200}
        h={100}
        values={[STORAGE.trueColor.bytes / 1e6, STORAGE.indexed.bytes / 1e6]}
        max={9}
        labels={["24-bit", "8-bit"]}
        showValues
        barTone={(i) => ((i === 1) === indexed ? "gold" : "muted")}
        d={1100}
        stagger={200}
      />
      <Text x={60} y={150} text="MB" anchor="end" size={10.5} tone="muted" mono d={1100} />
      <Chip x={420} y={170} text={indexed ? bi("a third of True-Color", "ثلث الألوان الحقيقية") : bi("≈ 9 MB uncompressed", "≈ 9 ميغابايت دون ضغط")} tone="gold" center d={1500} />
      <Chip
        x={420}
        y={226}
        text={indexed ? bi("GIF: ≤ 256 colours", "GIF: 256 لونًا على الأكثر") : bi("JPEG compresses it", "JPEG يضغطها")}
        tone="outline"
        center
        d={1700}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof fileSize>>({
  resolution: Resolution,
  "color-depth": ColorDepth,
  "file-size": FileSize,
});
