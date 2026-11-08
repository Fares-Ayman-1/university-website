"use client";

import type { piecewiseWt } from "@/lib/walkthroughs/image-processing/lecture-02";
import { PW_COMPRESS, PW_STRETCH, STRETCH_HIST, STRETCH_POINTS, fmt2, pw8, slopes } from "@/lib/widgets/ip-lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Bars, Box, Curve, Pixels, Svg, Text, plotAt, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Axes, Dot } from "./local";

const PROBE = [64, 96, 128, 160, 192];

function Pieces({ control }: { control: string }) {
  const compress = control === "compress";
  const pts = compress ? PW_COMPRESS : PW_STRETCH;
  const box: PlotBox = { x: 56, y: 40, w: 190, h: 190, domain: [0, 255], range: [0, 255] };
  const m = slopes(pts);
  const mid = plotAt(box, (pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2);
  return (
    <Svg>
      <Axes box={box} xs={[64, 192, 255]} ys={[pts[1][1], pts[2][1], 255]} xName="x" yName="y" d={0} />
      <Curve box={box} fn={(x) => x} tone="faint" dashed d={0} />
      <Curve box={box} points={pts} d={300} />
      {pts.map((p, i) => (
        <Dot key={i} at={plotAt(box, p[0], p[1])} tone={i === 1 || i === 2 ? "gold" : "slate"} d={1000 + i * 120} />
      ))}
      <Text x={mid[0] + 8} y={mid[1] + 22} text={bi(`slope ${fmt2(m[1])}`, `الميل ${fmt2(m[1])}`)} size={11} anchor="start" tone={compress ? "slate" : "gold"} d={1400} />
      <Text x={420} y={40} text={compress ? bi("mid-tones squeezed together", "الدرجات المتوسطة تتقارب") : bi("mid-tones spread apart", "الدرجات المتوسطة تتباعد")} size={12} tone="gold" d={1500} />
      <Text x={312} y={100} text="x" size={12.5} mono anchor="end" tone="heading" d={600} />
      <Pixels x={320} y={80} values={[PROBE]} cell={40} size={11} d={600} />
      <Text x={312} y={190} text="y" size={12.5} mono anchor="end" tone="heading" d={1700} />
      <Pixels x={320} y={170} values={[PROBE.map((v) => pw8(pts, v))]} cell={40} size={11} d={1700} />
      <Text x={420} y={240} text={`64…192  →  ${pw8(pts, 64)}…${pw8(pts, 192)}`} size={12} mono tone="gold" d={2000} />
    </Svg>
  );
}

function Example16() {
  const box: PlotBox = { x: 64, y: 36, w: 240, h: 150, domain: [-0.5, 15.5], range: [0, 15] };
  const m = slopes(STRETCH_POINTS);
  const tones = ["slate", "gold", "slate"] as const;
  const pieces = [
    { range: "0 … 5", x: 360, y: 40 },
    { range: "5 … 9", x: 360, y: 104 },
    { range: "9 … 15", x: 360, y: 168 },
  ];
  return (
    <Svg>
      <Axes box={box} ys={[2, 14]} xName="i" yName="j" d={0} />
      <Curve box={box} points={STRETCH_POINTS} d={300} />
      {STRETCH_POINTS.map((p, i) => (
        <Dot key={i} at={plotAt(box, p[0], p[1])} tone={i === 1 || i === 2 ? "gold" : "slate"} d={900 + i * 120} />
      ))}
      <Text x={plotAt(box, 5, 2)[0] + 8} y={plotAt(box, 5, 2)[1] + 2} text="(5, 2)" size={10.5} mono anchor="start" tone="muted" d={1100} />
      <Text x={plotAt(box, 9, 14)[0] - 8} y={plotAt(box, 9, 14)[1] - 2} text="(9, 14)" size={10.5} mono anchor="end" tone="muted" d={1200} />
      <Bars
        x={box.x}
        y={198}
        w={box.w}
        h={46}
        values={STRETCH_HIST}
        labels={STRETCH_HIST.map((_, i) => ([0, 5, 9, 15].includes(i) ? String(i) : ""))}
        tone="slate"
        barTone={(i) => (i >= 5 && i <= 9 ? "gold" : undefined)}
        d={600}
        stagger={30}
      />
      {pieces.map((p, i) => (
        <Box key={i} x={p.x} y={p.y} w={176} h={56} label={p.range} sub={bi(`slope ${fmt2(m[i])}`, `الميل ${fmt2(m[i])}`)} mono tone={tones[i]} d={1400 + i * 250} />
      ))}
      <Text x={448} y={250} text={bi("steep where the pixels are", "شديدة الميل حيث توجد البكسلات")} size={12} tone="gold" d={2300} />
    </Svg>
  );
}

const NINE = [0, 32, 64, 96, 128, 160, 192, 224, 255];

function Lut() {
  const lut = NINE.map((v) => pw8(PW_STRETCH, v));
  const X0 = 56;
  const CELL = 50;
  return (
    <Svg>
      <Text x={24} y={34} text="a = [0 64 192 255];  b = [0 20 235 255];" size={11.5} mono anchor="start" tone="heading" d={0} />
      <Text x={24} y={60} text="lut = interp1(a, b, 0:255);" size={11.5} mono anchor="start" tone="gold" d={300} />
      <Text x={24} y={86} text="out = uint8(lut(double(im) + 1));" size={11.5} mono anchor="start" tone="gold" d={600} />
      <Text x={440} y={60} text={bi("256 entries, computed once", "256 مدخلًا تُحسب مرة واحدة")} size={11.5} tone="muted" d={800} />
      <Text x={X0 - 8} y={140 + CELL / 2} text="x" size={12.5} mono anchor="end" tone="heading" d={900} />
      <Pixels x={X0} y={140} values={[NINE]} cell={CELL} size={11.5} d={900} outline={(_, c) => (NINE[c] >= 64 && NINE[c] <= 192 ? "gold" : undefined)} />
      <Text x={X0 - 8} y={200 + CELL / 2} text="lut[x]" size={12.5} mono anchor="end" tone="heading" d={1500} />
      <Pixels x={X0} y={200} values={[lut]} cell={CELL} size={11.5} d={1500} outline={(_, c) => (NINE[c] >= 64 && NINE[c] <= 192 ? "gold" : undefined)} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof piecewiseWt>>({
  pieces: Pieces,
  example16: Example16,
  lut: Lut,
});
