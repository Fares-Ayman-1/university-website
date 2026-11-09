"use client";

import type { advantages } from "@/lib/walkthroughs/image-processing/lecture-04";
import { COST_SIZE, denoise, freqPerPixel, keptSpectrum, NOISE_SPIKES, NOISY_IMG, spatialPerPixel, spectrumImage, TEST_IMG, TEST_N, toDisplay, filterGrid } from "@/lib/widgets/ip-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Raster, Ring } from "./local";

/** Every fourth pixel of the test image: an 8 × 8 thumbnail. */
const THUMB = Array.from({ length: 8 }, (_, r) => Array.from({ length: 8 }, (_, c) => TEST_IMG[r * 4 + 1][c * 4 + 1]));
const D0 = 5;

function Theorem() {
  const H = filterGrid("ideal", "low", TEST_N, TEST_N, D0);
  const c = 2.25;
  const s = TEST_N * c;
  const xs = [296, 384, 472];
  const grids = [spectrumImage(TEST_IMG), H.map((row) => row.map((v) => v * 255)), keptSpectrum(H)];
  return (
    <Svg>
      <Text x={130} y={26} text={bi("spatial domain: slide the mask", "المجال المكاني: تحريك القناع")} tone="heading" size={12} d={0} />
      <Pixels x={66} y={56} values={THUMB} cell={16} show="none" d={100} stagger={30} />
      <Box x={66 + 2 * 16 - 2} y={56 + 3 * 16 - 2} w={52} h={52} r={3} tone="ghost" dashed d={500} />
      <Arrow pts={[[66 + 2 * 16 + 24, 56 + 3 * 16 + 24], [66 + 4 * 16 + 24, 56 + 3 * 16 + 24]]} tone="gold" d={700} dur={500} />
      <Text x={130} y={212} text={bi("m² products at every pixel", "m² عملية ضرب عند كل بكسل")} size={11} tone="muted" d={900} />
      <Text x={248} y={124} text="⟺" size={22} tone="gold" d={1100} />
      <Text x={418} y={26} text={bi("frequency domain: multiply", "المجال الترددي: الضرب")} tone="heading" size={12} d={1200} />
      {grids.map((g, i) => (
        <g key={i}>
          <Raster x={xs[i]} y={92} values={g} cell={c} d={1300 + i * 250} />
          <Text x={xs[i] + s / 2} y={92 + s + 14} text={["F", "H", "G"][i]} size={12} mono tone="heading" d={1300 + i * 250} />
        </g>
      ))}
      <Text x={376} y={128} text="×" size={15} tone="heading" d={1500} />
      <Text x={464} y={128} text="=" size={15} tone="heading" d={1750} />
      <Text x={418} y={212} text={bi("one product per frequency", "عملية ضرب واحدة لكل تردد")} size={11} tone="muted" d={2000} />
      <Text x={280} y={252} text="f * h  ↔  F · H" size={14} mono tone="gold" d={2200} />
    </Svg>
  );
}

function Count({ control }: { control: string }) {
  const m = Number(control) || 3;
  const space = spatialPerPixel(m);
  const freq = freqPerPixel(COST_SIZE, COST_SIZE);
  const fftWins = space > freq;
  const side = Math.max(6, Math.min(m * 5, 150));
  const ratio = fftWins ? space / freq : freq / space;
  /** 1.1× and 1.5× for the close cases, whole numbers (6×, 17×) for the clear ones. */
  const factor = ratio < 3 ? ratio.toFixed(1) : String(Math.round(ratio));
  return (
    <Svg>
      <Box x={24} y={48} w={170} h={170} r={4} tone="muted" d={0} />
      <Box x={109 - side / 2} y={133 - side / 2} w={side} h={side} r={2} tone="warn" dashed d={300} />
      <Box x={106} y={130} w={6} h={6} r={1} tone="gold" d={400} />
      <Text x={109} y={238} text={bi(`a ${m} × ${m} mask at one pixel`, `قناع ${m} × ${m} عند بكسل واحد`)} size={11} tone="heading" d={500} />
      <Text x={372} y={26} text={bi(`operations per pixel, ${COST_SIZE} × ${COST_SIZE} image`, `العمليات لكل بكسل، صورة ${COST_SIZE} × ${COST_SIZE}`)} tone="heading" size={12} d={600} />
      <Bars
        x={262}
        y={66}
        w={220}
        h={140}
        values={[space, freq]}
        labels={["m²", "3·log₂(MN) + 1"]}
        max={Math.max(space, freq)}
        showValues
        gap={0.45}
        d={700}
        barTone={(i) => ((i === 0) === fftWins ? "danger" : "success")}
      />
      <Chip
        x={372}
        y={252}
        text={fftWins ? bi(`frequency domain: about ${factor}× cheaper`, `المجال الترددي: أرخص بنحو ${factor}×`) : bi(`spatial domain: about ${factor}× cheaper`, `المجال المكاني: أرخص بنحو ${factor}×`)}
        tone={fftWins ? "success" : "slate"}
        center
        d={1300}
      />
    </Svg>
  );
}

function Beyond() {
  const { clean } = denoise();
  const spec = spectrumImage(NOISY_IMG);
  const c = 4;
  const s = TEST_N * c;
  const xs = [16, 216, 416];
  return (
    <Svg>
      <Text x={xs[0] + s / 2} y={26} text={bi("image + periodic noise", "صورة + ضوضاء دورية")} tone="heading" size={12} d={0} />
      <Raster x={xs[0]} y={56} values={toDisplay(NOISY_IMG, "clip")} cell={c} d={100} />
      <Arrow pts={[[150, 120], [210, 120]]} tone="gold" d={400} dur={300} label="FFT" labelAt={[180, 106]} />
      <Text x={xs[1] + s / 2} y={26} text={bi("its spectrum", "طيفها")} tone="heading" size={12} d={500} />
      <Raster x={xs[1]} y={56} values={spec} cell={c} d={600} />
      {NOISE_SPIKES.map(([r, cc], i) => (
        <Ring key={i} x={xs[1] + cc * c - 6} y={56 + r * c - 6} w={c + 12} h={c + 12} r={8} d={1100 + i * 150} />
      ))}
      <Text x={xs[1] + s / 2} y={202} text={bi("set the 2 spikes to 0", "اجعل القمتين 0")} size={11} tone="gold" d={1300} />
      <Arrow pts={[[350, 120], [410, 120]]} tone="gold" d={1500} dur={300} label="IFFT" labelAt={[380, 106]} />
      <Text x={xs[2] + s / 2} y={26} text={bi("the stripes are gone", "اختفت الخطوط")} tone="heading" size={12} d={1600} />
      <Raster x={xs[2]} y={56} values={toDisplay(clean, "clip")} cell={c} d={1700} />
      <Chip x={280} y={250} text={bi("spread over the whole image, but just 2 numbers in the spectrum", "منتشرة على الصورة كلها، لكنها رقمان فقط في الطيف")} tone="success" center d={2000} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof advantages>>({
  theorem: Theorem,
  count: Count,
  beyond: Beyond,
});
