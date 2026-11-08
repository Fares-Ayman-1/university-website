"use client";

import type { filtering } from "@/lib/walkthroughs/image-processing/lecture-05";
import {
  blurRow,
  COST_SIZE,
  directPerPixel,
  fftPerPixel,
  FILTER_IMG,
  FILTER_RADIUS,
  filterImage,
  logMag,
  lowPassMask,
  mapGrid,
  normalise,
  WRAP_KERNEL,
  WRAP_ROW,
  type Grid,
} from "@/lib/widgets/ip-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Pixels, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const N = FILTER_IMG.length;
const LOW = lowPassMask(N, FILTER_RADIUS);
const HIGH = mapGrid(LOW, (v) => 1 - v);
/** "5 مرات" but "53 مرة": Arabic counts 3–10 with a plural. */
const timesAr = (n: number) => `${n} ${n >= 3 && n <= 10 ? "مرات" : "مرة"}`;
const clamp = (g: Grid<number>) => mapGrid(g, (v) => Math.round(Math.min(255, Math.max(0, v))));

/** What each panel draws: the centred log spectrum, the mask, the kept part and the result. */
function filtered(mask: Grid<number>, high: boolean) {
  const { F, g } = filterImage(FILTER_IMG, mask);
  const spec = normalise(logMag(F));
  const kept = mapGrid(spec, (v, r, c) => v * mask[r][c]);
  const result = high ? normalise(mapGrid(g, Math.abs)) : clamp(g);
  return { spec, kept, result };
}

function Pipeline() {
  const { spec, kept, result } = filtered(LOW, false);
  const c = 5;
  const s = N * c;
  const ys = 80;
  const items = [
    { x: 14, values: FILTER_IMG, max: 255, sym: "f", label: bi("image", "الصورة") },
    { x: 130, values: spec, max: 255, sym: "F", label: bi("spectrum", "الطيف") },
    { x: 230, values: LOW, max: 1, sym: "H", label: bi("mask", "القناع") },
    { x: 330, values: kept, max: 255, sym: "F·H", label: bi("product", "حاصل الضرب") },
    { x: 466, values: result, max: 255, sym: "g", label: bi("filtered", "بعد الترشيح") },
  ];
  return (
    <Svg>
      <Text x={280} y={36} text="g = F⁻¹[ H · F[f] ]" size={14} mono tone="gold" d={0} />
      {items.map((it, i) => (
        <g key={i}>
          <Pixels x={it.x} y={ys} values={it.values} cell={c} max={it.max} show="none" d={200 + i * 380} />
          <Text x={it.x + s / 2} y={ys + s + 16} text={it.sym} size={12} mono tone="heading" d={250 + i * 380} />
          <Text x={it.x + s / 2} y={ys + s + 36} text={it.label} size={10.5} tone="muted" d={250 + i * 380} />
        </g>
      ))}
      <Arrow pts={[[98, 120], [126, 120]]} tone="gold" d={500} dur={200} label="fft2" labelAt={[112, 106]} />
      <Text x={220} y={120} text="×" size={16} tone="heading" d={900} />
      <Text x={320} y={120} text="=" size={16} tone="heading" d={1300} />
      <Arrow pts={[[414, 120], [460, 120]]} tone="gold" d={1700} dur={250} label="ifft2" labelAt={[437, 106]} />
      <Text x={280} y={234} text="f * h  ↔  F · H" size={12.5} mono tone="heading" d={2000} />
      <Text x={280} y={254} text={bi("convolution in space = multiplication in frequency", "الالتفاف في المكان = الضرب في التردد")} size={10.5} tone="muted" d={2100} />
    </Svg>
  );
}

function Mask({ control }: { control: string }) {
  const high = control === "high";
  const mask = high ? HIGH : LOW;
  const { spec, kept, result } = filtered(mask, high);
  const c = 6;
  const s = N * c;
  const y = 84;
  const xs = [16, 146, 276, 440];
  const titles = [bi("spectrum F", "الطيف F"), bi("mask H", "القناع H"), "F · H", bi("result g", "النتيجة g")];
  const grids = [spec, mask, kept, result];
  return (
    <Svg>
      {grids.map((g, i) => (
        <g key={i}>
          <Text x={xs[i] + s / 2} y={56} text={titles[i]} tone="heading" size={11.5} mono={i === 2} d={i * 450} />
          <Pixels x={xs[i]} y={y} values={g} cell={c} max={i === 1 ? 1 : 255} show="none" d={100 + i * 450} />
        </g>
      ))}
      <Text x={129} y={y + s / 2} text="×" size={16} tone="heading" d={400} />
      <Text x={259} y={y + s / 2} text="=" size={16} tone="heading" d={850} />
      <Arrow pts={[[378, y + s / 2], [432, y + s / 2]]} tone="gold" d={1250} dur={250} label="ifft2" labelAt={[405, y + s / 2 - 14]} />
      <Pixels x={16} y={204} values={FILTER_IMG} cell={4} show="none" d={200} />
      <Text x={92} y={236} text={bi("the original image", "الصورة الأصلية")} anchor="start" size={11} tone="muted" d={200} />
      <Chip x={488} y={224} text={high ? bi("edges only", "الحواف فقط") : bi("blurred", "ضبابية")} tone={high ? "warn" : "slate"} center d={1700} />
    </Svg>
  );
}

function Cost({ control }: { control: string }) {
  const m = Number(control) || 3;
  const direct = directPerPixel(m);
  const fft = fftPerPixel(COST_SIZE, COST_SIZE);
  const fftWins = direct > fft;
  const side = Math.min(m * 5, 160);
  return (
    <Svg>
      <Text x={335} y={30} text={bi("multiplications per pixel", "عمليات الضرب لكل بكسل")} tone="heading" size={12} d={0} />
      <Box x={24} y={56} w={170} h={170} r={4} tone="muted" d={0} />
      <Box x={109 - side / 2} y={141 - side / 2} w={side} h={side} r={2} tone="warn" dashed d={300} />
      <Box x={106} y={138} w={6} h={6} r={1} tone="gold" d={400} />
      <Text x={109} y={244} text={bi(`a ${m} × ${m} kernel at one pixel`, `نواة ${m} × ${m} عند بكسل واحد`)} size={11} tone="heading" d={500} />
      <Bars
        x={250}
        y={70}
        w={170}
        h={150}
        values={[direct, fft]}
        labels={["m²", "log₂(MN)"]}
        max={Math.max(direct, fft)}
        showValues
        gap={0.4}
        d={700}
        barTone={(i) => ((i === 0) === fftWins ? "danger" : "success")}
      />
      <Text x={335} y={250} text={bi(`${COST_SIZE} × ${COST_SIZE} image: log₂(MN) = ${fft}`, `صورة ${COST_SIZE} × ${COST_SIZE}: log₂(MN) = ${fft}`)} size={10.5} tone="muted" d={900} />
      <Chip
        x={488}
        y={140}
        text={fftWins ? bi(`FFT: ${Math.round(direct / fft)}× fewer`, `FFT: أقل بـ ${timesAr(Math.round(direct / fft))}`) : bi("space is cheaper", "المكان أرخص")}
        tone={fftWins ? "success" : "slate"}
        center
        d={1300}
      />
    </Svg>
  );
}

function Wrap({ control }: { control: string }) {
  const padded = control === "zero";
  const out = blurRow(WRAP_ROW, WRAP_KERNEL, padded).map((v) => Math.round(v));
  const c = 44;
  const x0 = 100;
  const top = [...WRAP_ROW, ...(padded ? [0, 0] : [])];
  return (
    <Svg>
      <Text x={280} y={24} text={bi("a 3-pixel mean, applied through the DFT", "متوسط 3 بكسلات مطبَّق عبر DFT")} tone="heading" size={12} d={0} />
      <Text x={padded ? x0 - 8 : x0 - c - 2} y={96} text={bi("row", "الصف")} anchor="end" size={11} tone="heading" d={0} />
      <Pixels x={x0} y={74} values={[top]} cell={c} max={255} d={100} outline={(_, i) => (i >= WRAP_ROW.length ? "slate" : undefined)} />
      {padded ? (
        <Text x={x0 + (WRAP_ROW.length + 1) * c} y={134} text={bi("zero padding", "حشو بالأصفار")} size={10.5} tone="slate" d={400} />
      ) : (
        <>
          <Box x={x0 - c + 4} y={78} w={c - 8} h={c - 8} r={4} label={String(WRAP_ROW[WRAP_ROW.length - 1])} tone="ghost" dashed mono size={11} d={500} />
          <Arrow pts={[[x0 + (WRAP_ROW.length - 0.5) * c, 72], [x0 + (WRAP_ROW.length - 0.5) * c, 60], [x0 - c / 2, 60], [x0 - c / 2, 74]]} tone="slate" dashed d={600} />
          <Text x={x0 + c / 2} y={134} text={bi("the left neighbour wraps in from the right end", "الجار الأيسر يلتف من الطرف الأيمن")} anchor="start" size={10.5} tone="slate" d={800} />
        </>
      )}
      <Arrow pts={[[x0 + 4 * c, 146], [x0 + 4 * c, 166]]} tone="gold" d={900} dur={250} />
      <Text x={x0 - 8} y={192} text={bi("result", "النتيجة")} anchor="end" size={11} tone="heading" d={1000} />
      <Pixels x={x0} y={170} values={[out]} cell={c} max={255} d={1000} outline={(_, i) => (i === 0 ? (padded ? "success" : "danger") : undefined)} />
      {padded ? <Text x={x0 + (WRAP_ROW.length + 1) * c} y={192} text={bi("cut off", "تُقصّ")} size={10.5} tone="muted" d={1200} /> : null}
      <Chip
        x={280}
        y={250}
        text={padded ? bi(`the left border stays ${out[0]}`, `يبقى الحد الأيسر ${out[0]}`) : bi(`the left border gets ${out[0]} from the right end`, `يتلقى الحد الأيسر ${out[0]} من الطرف الأيمن`)}
        tone={padded ? "success" : "danger"}
        center
        d={1400}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof filtering>>({
  pipeline: Pipeline,
  mask: Mask,
  cost: Cost,
  wrap: Wrap,
});

