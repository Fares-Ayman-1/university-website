"use client";

import type { acquisition } from "@/lib/walkthroughs/image-processing/lecture-01";
import { FACE, PROFILE_SAMPLES, QUANTIZED, QUANT_LEVELS, SAMPLED, crop, nyquistSpacing, profile, sampleStripes, samples, signal, stripe } from "@/lib/widgets/ip-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Pixels, type PlotBox, Svg, Text, plotAt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Dots, Stripes } from "./local";

/* ---------- Sampling and quantization along one row ---------- */

const ROW: PlotBox = { x: 44, y: 48, w: 472, h: 128, domain: [0, 8], range: [0, 255] };

function Digitize({ control }: { control: string }) {
  const quant = control === "quantize";
  const values = quant ? QUANTIZED : SAMPLED;
  const levels = Array.from({ length: QUANT_LEVELS }, (_, i) => Math.round((i * 255) / (QUANT_LEVELS - 1)));
  const cell = ROW.w / PROFILE_SAMPLES.length;
  return (
    <Svg>
      <Text x={280} y={20} text={bi("Brightness along one row of the scene", "السطوع على امتداد صف واحد من المشهد")} tone="heading" size={12.5} d={0} />
      {quant
        ? levels.map((v, i) => (
            <g key={v}>
              <Arrow pts={[plotAt(ROW, 0, v), plotAt(ROW, 8, v)]} tone="faint" head={false} dashed d={100 + i * 80} />
              <Text x={ROW.x - 6} y={plotAt(ROW, 0, v)[1]} text={String(v)} anchor="end" size={10} tone="muted" mono d={100 + i * 80} />
            </g>
          ))
        : null}
      <Curve box={ROW} fn={profile} tone={quant ? "faint" : "slate"} d={100} />
      {PROFILE_SAMPLES.map((x, i) => (
        <Arrow key={i} pts={[plotAt(ROW, x, values[i]), plotAt(ROW, x, 0)]} tone="faint" head={false} dashed d={700 + i * 60} />
      ))}
      {quant ? <Dots pts={PROFILE_SAMPLES.map((x, i) => plotAt(ROW, x, SAMPLED[i]))} tone="muted" r={3} d={600} stagger={40} /> : null}
      <Dots pts={PROFILE_SAMPLES.map((x, i) => plotAt(ROW, x, values[i]))} tone="gold" d={800} />
      <Pixels x={ROW.x} y={204} values={[values]} cell={cell} d={1300} />
    </Svg>
  );
}

/* ---------- The slides' function ---------- */

const PLOT: PlotBox = { x: 44, y: 46, w: 476, h: 196, domain: [0, 2 * Math.PI], range: [-1.25, 1.25] };

function Axes({ d = 0 }: { d?: number }) {
  return (
    <>
      <Arrow pts={[plotAt(PLOT, 0, 0), [PLOT.x + PLOT.w + 10, plotAt(PLOT, 0, 0)[1]]]} tone="faint" d={d} dur={300} />
      <Arrow pts={[plotAt(PLOT, 0, -1.25), [PLOT.x, PLOT.y - 8]]} tone="faint" d={d} dur={300} />
      <Text x={PLOT.x + PLOT.w + 6} y={plotAt(PLOT, 0, 0)[1] + 14} text="x" size={11} tone="muted" mono d={d} />
      <Text x={plotAt(PLOT, 2 * Math.PI, 0)[0]} y={plotAt(PLOT, 0, 0)[1] - 12} text="2π" size={10.5} tone="muted" mono d={d} />
      <Text x={PLOT.x + 8} y={PLOT.y - 6} text="y" anchor="start" size={11} tone="muted" mono d={d} />
    </>
  );
}

const toSvg = (pts: readonly (readonly [number, number])[]) => pts.map(([x, y]) => plotAt(PLOT, x, y));

function Undersample({ control }: { control: string }) {
  if (control === "many") {
    const pts = samples(Math.PI / 16);
    return (
      <Svg>
        <Axes />
        <Curve box={PLOT} fn={signal} tone="gold" d={300} dur={1200} />
        <Dots pts={toSvg(pts)} r={3.2} d={300} stagger={30} />
        <Chip x={420} y={250} text={bi("33 samples: shape and ripples", "33 عيّنة: الشكل والتموجات")} tone="success" center d={1500} />
      </Svg>
    );
  }
  const pts = samples(Math.PI / 2);
  return (
    <Svg>
      <Axes />
      <Curve box={PLOT} fn={signal} tone="faint" dashed d={200} />
      <Arrow pts={toSvg(pts)} tone="danger" head={false} d={900} dur={700} />
      <Dots pts={toSvg(pts)} r={5} d={500} stagger={120} />
      <Chip x={420} y={250} text={bi("5 samples: undersampling", "5 عيّنات: معاينة ناقصة")} tone="danger" center d={1500} />
    </Svg>
  );
}

function Nyquist({ control }: { control: string }) {
  if (control === "sixth") {
    const pts = samples(Math.PI / 6);
    return (
      <Svg>
        <Axes />
        <Curve box={PLOT} fn={signal} tone="faint" dashed d={200} />
        <Arrow pts={toSvg(pts)} tone="gold" head={false} d={1000} dur={900} />
        <Dots pts={toSvg(pts)} d={400} stagger={60} />
        <Chip x={160} y={26} text={bi("spacing π/6 ≈ 0.52", "المسافة π/6 ≈ 0.52")} tone="outline" center d={0} />
        <Chip x={420} y={250} text={bi("ripple kept", "حُفظ التموج")} tone="success" center d={1800} />
      </Svg>
    );
  }
  const pts = samples(Math.PI / 3);
  return (
    <Svg>
      <Axes />
      <Curve box={PLOT} fn={signal} tone="faint" dashed d={200} />
      <Curve box={PLOT} fn={Math.sin} tone="slate" d={1000} />
      <Dots pts={toSvg(pts)} d={400} stagger={100} />
      <Arrow pts={[[392, 26], [418, 26]]} tone="slate" head={false} d={1600} dur={200} />
      <Text x={424} y={26} text="sin(x)" anchor="start" size={11.5} tone="slate" mono d={1600} />
      <Chip x={160} y={26} text={bi(`spacing π/3 ≈ ${nyquistSpacing}`, `المسافة π/3 ≈ ${nyquistSpacing}`)} tone="gold" center d={0} />
      <Chip x={420} y={250} text={bi("every sample hits sin(3x) = 0", "كل عيّنة عند sin(3x) = 0")} tone="danger" center d={1800} />
    </Svg>
  );
}

/* ---------- Aliasing ---------- */

function Aliasing({ control }: { control: string }) {
  const n = control === "coarse" ? 8 : 32;
  const x = 40;
  const w = 480;
  const values = sampleStripes(n);
  const cell = w / n;
  const centres = values.map((_, k) => [x + (k + 0.5) * cell, 112] as const);
  return (
    <Svg>
      <Text x={280} y={20} text={bi("Scene: 7 fine stripes", "المشهد: 7 خطوط دقيقة")} tone="heading" size={12.5} d={0} />
      <Stripes x={x} y={48} w={w} h={50} f={stripe} d={100} />
      <Dots pts={centres} r={n === 8 ? 4.5 : 3} tone={n === 8 ? "danger" : "gold"} d={500} stagger={n === 8 ? 100 : 25} />
      <Arrow pts={[[280, 121], [280, 140]]} tone="gold" d={1000} dur={250} />
      {n === 8 ? (
        <>
          <Pixels x={x} y={144} values={[values]} cell={cell} d={1200} />
          <Text x={280} y={226} text={bi("8 pixels: one slow wave, never in the scene", "8 بكسلات: موجة بطيئة واحدة لم تكن في المشهد")} tone="danger" size={12} d={1600} />
        </>
      ) : (
        <>
          <Pixels x={x} y={144} values={[values, values, values]} cell={cell} show="none" d={1200} />
          <Text x={280} y={212} text={bi("32 pixels: the 7 stripes come through", "32 بكسلًا: تظهر الخطوط السبعة")} tone="success" size={12} d={1600} />
        </>
      )}
    </Svg>
  );
}

/* ---------- Sensors ---------- */

const GRID = crop(FACE, 2, 2, 6, 8);

function Sensors({ control }: { control: string }) {
  const scanner = control === "scanner";
  const gx = 168;
  const gy = 58;
  const cell = 30;
  return (
    <Svg>
      <Pixels x={24} y={64} values={FACE} cell={8} show="none" d={0} />
      <Text x={72} y={202} text={bi("the scene", "المشهد")} tone="heading" size={12} d={100} />
      <Arrow pts={[[126, 128], [162, 128]]} tone="gold" d={300} dur={300} />
      {scanner ? (
        <>
          <Box x={gx - 4} y={40} w={8 * cell + 8} h={12} r={6} tone="gold" d={300} />
          <Arrow pts={[[gx + 8 * cell + 12, 46], [gx + 8 * cell + 12, gy + 6 * cell]]} tone="gold" d={500} dur={6 * 280} />
          <Pixels x={gx} y={gy} values={GRID} cell={cell} d={600} stagger={280} />
          <Box x={432} y={70} w={120} h={70} label={bi("Scanner", "الماسح")} sub={bi("one row of cells", "صف واحد من الخلايا")} tone="slate" size={12} d={400} />
          <Chip x={492} y={186} text={bi("row by row", "صفًّا صفًّا")} tone="gold" center d={900} />
          <Chip x={492} y={236} text={bi("slower", "أبطأ")} tone="muted" center d={1100} />
        </>
      ) : (
        <>
          <Box x={gx - 4} y={gy - 4} w={8 * cell + 8} h={6 * cell + 8} r={6} tone="ghost" dashed d={300} />
          <Pixels x={gx} y={gy} values={GRID} cell={cell} d={700} />
          <Box x={426} y={56} w={126} h={68} label="CCD" sub={bi("high res, low noise", "دقة عالية، ضوضاء أقل")} tone="navy" size={12.5} d={900} />
          <Box x={426} y={136} w={126} h={68} label="CMOS" sub={bi("cheaper, noisier", "أرخص، ضوضاء أكثر")} tone="slate" size={12.5} d={1100} />
          <Chip x={489} y={234} text={bi("all at once", "كلها مرة واحدة")} tone="success" center d={1300} />
        </>
      )}
      <Text x={gx + 4 * cell} y={gy + 6 * cell + 18} text={bi("photosites → pixels", "الخلايا الحساسة ← البكسلات")} tone="muted" size={11} d={800} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof acquisition>>({
  digitize: Digitize,
  undersample: Undersample,
  nyquist: Nyquist,
  aliasing: Aliasing,
  sensors: Sensors,
});
