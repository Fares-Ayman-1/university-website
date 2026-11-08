"use client";

import type { why } from "@/lib/walkthroughs/image-processing/lecture-05";
import { abs, dft2, fftshift2, mapGrid, MIXED, MIXED_CUTOFF, mixed, normalise, STRIPE_CYCLES, stripes, THREE_SINES, threeSines } from "@/lib/widgets/ip-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Chip, Curve, Pixels, Svg, Text, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Ring, ZeroLine } from "./local";

const TWO_PI = 2 * Math.PI;

function Decompose() {
  const sum: PlotBox = { x: 34, y: 60, w: 216, h: 90, domain: [0, TWO_PI], range: [-1.5, 1.5] };
  const labels = ["sin x", "(1/3) sin 2x", "(1/5) sin 4x"];
  const spikes = [0, 1, 2, 3, 4, 5].map((u) => THREE_SINES.find((s) => s.u === u)?.amp ?? 0);
  const bars = { x: 336, y: 64, w: 190, h: 150 };
  const slot = bars.w / spikes.length;
  const amps = ["", "1", "1/3", "", "1/5", ""];
  return (
    <Svg>
      <Text x={142} y={22} text={bi("Spatial domain", "المجال المكاني")} tone="heading" size={12.5} d={0} />
      <Text x={431} y={22} text={bi("Frequency domain", "المجال الترددي")} tone="heading" size={12.5} d={0} />
      {THREE_SINES.map((s, i) => {
        const box: PlotBox = { x: 122, y: 172 + i * 34, w: 128, h: 26, domain: [0, TWO_PI], range: [-1.05, 1.05] };
        return (
          <g key={i}>
            <Text x={114} y={box.y + 13} text={labels[i]} anchor="end" size={10.5} mono tone="muted" d={100 + i * 220} />
            <ZeroLine box={box} d={100 + i * 220} />
            <Curve box={box} fn={(x) => s.amp * Math.sin(s.u * x)} tone="slate" width={1.6} d={150 + i * 220} dur={500} />
          </g>
        );
      })}
      <ZeroLine box={sum} d={900} />
      <Curve box={sum} fn={threeSines} samples={160} d={950} dur={900} />
      <Text x={42} y={54} text="f(x)" anchor="start" size={11} mono tone="gold" d={950} />
      <Arrow pts={[[264, 140], [320, 140]]} tone="gold" d={1900} label="FT" labelAt={[292, 126]} />
      <Bars x={bars.x} y={bars.y} w={bars.w} h={bars.h} values={spikes} labels={spikes.map((_, u) => String(u))} max={1} d={2100} barTone={(i) => (spikes[i] ? "gold" : undefined)} />
      {spikes.map((v, u) =>
        v ? <Text key={u} x={bars.x + u * slot + slot / 2} y={bars.y + bars.h - v * bars.h - 10} text={amps[u]} size={10.5} mono tone="heading" d={2300 + u * 70} /> : null,
      )}
      <Text x={431} y={248} text={bi("frequency u", "التردد u")} size={11} tone="muted" d={2500} />
    </Svg>
  );
}

function Image({ control }: { control: string }) {
  const narrow = control === "narrow";
  const cycles = STRIPE_CYCLES[narrow ? "narrow" : "wide"];
  const img = stripes(cycles);
  const spec = normalise(mapGrid(fftshift2(dft2(img)), abs));
  return (
    <Svg>
      <Text x={128} y={22} text={bi("Image f(x, y)", "الصورة f(x, y)")} tone="heading" size={12.5} d={0} />
      <Text x={428} y={22} text={bi("Spectrum |F(u, v)|", "الطيف |F(u, v)|")} tone="heading" size={12.5} d={0} />
      <Pixels x={40} y={50} values={img} cell={22} show="none" d={100} stagger={40} />
      <Arrow pts={[[228, 139], [324, 139]]} tone="gold" d={700} label="2-D DFT" labelAt={[276, 125]} />
      <Pixels x={340} y={50} values={spec} cell={22} show="none" d={1000} stagger={40} outline={(r, c) => (r === 4 && c === 4 ? "gold" : spec[r][c] > 0 ? "success" : undefined)} />
      <Text x={128} y={246} text={narrow ? bi(`${cycles} cycles across`, `${cycles} دورات عبر الصورة`) : bi("1 cycle across", "دورة واحدة عبر الصورة")} size={11} tone="muted" d={600} />
      <Text x={428} y={246} text={bi("centre = average, dots = the stripes", "المركز = المتوسط، والنقطتان = الخطوط")} size={11} tone="muted" d={1600} />
    </Svg>
  );
}

function Isolate({ control }: { control: string }) {
  const keep = control === "high" ? "high" : "low";
  const sig: PlotBox = { x: 20, y: 96, w: 150, h: 80, domain: [0, TWO_PI], range: [-1.9, 1.9] };
  const res: PlotBox = { ...sig, x: 404 };
  const spectrum = Array.from({ length: 14 }, (_, u) => MIXED.find((p) => p.u === u)?.amp ?? 0);
  const bars = { x: 212, y: 96, w: 146, h: 80 };
  const slot = bars.w / spectrum.length;
  const kept = (u: number) => (keep === "low" ? u < MIXED_CUTOFF : u >= MIXED_CUTOFF);
  const ringX = keep === "low" ? bars.x - 2 : bars.x + MIXED_CUTOFF * slot - 2;
  const ringW = keep === "low" ? MIXED_CUTOFF * slot + 4 : (spectrum.length - MIXED_CUTOFF) * slot + 4;
  return (
    <Svg>
      <Text x={95} y={60} text={bi("Signal", "الإشارة")} tone="heading" size={12} d={0} />
      <Text x={285} y={60} text={bi("Spectrum, masked", "الطيف بعد القناع")} tone="heading" size={12} d={0} />
      <Text x={479} y={60} text={bi("Result", "النتيجة")} tone="heading" size={12} d={0} />
      <ZeroLine box={sig} d={100} />
      <Curve box={sig} fn={mixed("all")} samples={200} tone="slate" d={150} />
      <Arrow pts={[[176, 136], [206, 136]]} tone="gold" d={800} dur={300} label="DFT" labelAt={[191, 122]} />
      <Bars
        x={bars.x}
        y={bars.y}
        w={bars.w}
        h={bars.h}
        values={spectrum}
        labels={spectrum.map((v, u) => (v ? String(u) : ""))}
        max={1}
        d={1000}
        stagger={40}
        barTone={(u) => (spectrum[u] ? (kept(u) ? "gold" : "muted") : undefined)}
      />
      <Ring x={ringX} y={88} w={ringW} h={106} d={1700} />
      <Arrow pts={[[368, 136], [398, 136]]} tone="gold" d={1900} dur={300} label="DFT⁻¹" labelAt={[383, 122]} />
      <ZeroLine box={res} d={2000} />
      <Curve box={res} fn={mixed("all")} samples={200} tone="faint" dashed width={1.4} d={2000} />
      <Curve box={res} fn={mixed(keep)} samples={200} tone="gold" d={2100} />
      <Chip x={280} y={238} text={keep === "low" ? bi("only the smooth outline is left", "لا يبقى إلا الشكل العام الأملس") : bi("only the fine ripples are left", "لا يبقى إلا التموجات الدقيقة")} tone={keep === "low" ? "success" : "warn"} center d={2700} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof why>>({
  decompose: Decompose,
  image: Image,
  isolate: Isolate,
});
