"use client";

import type { intro } from "@/lib/walkthroughs/image-processing/lecture-04";
import { INTRO_PARTS, introPart, introSignal, maxJump, NOISY_IMG, ROWS, spectrumImage, TEST_IMG, type RowId } from "@/lib/widgets/ip-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Curve, Pixels, Svg, Text, type LineTone, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Raster } from "./local";

const SPECTRUM_FREQS = 9;
const AMPS = Array.from({ length: SPECTRUM_FREQS }, (_, u) => INTRO_PARTS.find((p) => p.u === u)?.amp ?? 0);
const PART_TONES: readonly LineTone[] = ["navy", "gold", "danger"];
const BAR_TONES = ["navy", "gold", "danger"] as const;

function Decompose({ control }: { control: string }) {
  const parts = control === "parts";
  const whole: PlotBox = { x: 26, y: 70, w: 250, h: 150, domain: [0, 2 * Math.PI], range: [-1.9, 1.9] };
  const strips: PlotBox[] = INTRO_PARTS.map((_, i) => ({ x: 60, y: 62 + i * 56, w: 216, h: 44, domain: [0, 2 * Math.PI], range: [-1.1, 1.1] }));
  return (
    <Svg>
      <Text x={150} y={26} text={bi("time (or spatial) domain", "المجال الزمني (أو المكاني)")} tone="heading" size={12} d={0} />
      {parts ? (
        INTRO_PARTS.map((p, i) => (
          <g key={p.u}>
            <Curve box={strips[i]} fn={introPart(i)} samples={120} tone={PART_TONES[i]} width={2} d={150 + i * 250} />
            <Text x={22} y={strips[i].y + strips[i].h / 2} text={`u = ${p.u}`} anchor="start" size={10.5} mono tone="muted" d={150 + i * 250} />
          </g>
        ))
      ) : (
        <Curve box={whole} axes fn={introSignal} samples={160} tone="gold" d={100} dur={1200} />
      )}
      <Arrow pts={[[296, 145], [340, 145]]} tone="gold" d={900} dur={300} label="FT" labelAt={[318, 131]} />
      <Text x={448} y={26} text={bi("frequency domain", "المجال الترددي")} tone="heading" size={12} d={1000} />
      <Bars
        x={352}
        y={70}
        w={192}
        h={150}
        values={AMPS}
        labels={AMPS.map((_, u) => String(u))}
        max={1.15}
        showValues={parts}
        gap={0.45}
        d={1100}
        barTone={(u) => {
          const i = INTRO_PARTS.findIndex((p) => p.u === u);
          return i < 0 ? undefined : parts ? BAR_TONES[i] : "gold";
        }}
      />
      <Text x={448} y={250} text={bi("frequency u (spike height = amplitude)", "التردد u (ارتفاع القمة = السعة)")} size={10.5} tone="muted" d={1300} />
    </Svg>
  );
}

const ROW_TONE: Record<RowId, "slate" | "gold" | "danger"> = { smooth: "slate", edge: "gold", noise: "danger" };

function Rate({ control }: { control: string }) {
  const id: RowId = control === "edge" || control === "noise" ? control : "smooth";
  const row = ROWS[id];
  const cell = 46;
  const x0 = 96;
  const plot: PlotBox = { x: x0 + cell / 2, y: 126, w: cell * 7, h: 84, domain: [0, 7], range: [0, 255] };
  const jumps = row.slice(1).map((v, i) => Math.abs(v - row[i]));
  const at = jumps.indexOf(maxJump(row));
  const high = id !== "smooth";
  return (
    <Svg>
      <Text x={280} y={24} text={bi("one row of pixels", "صف واحد من البكسلات")} tone="heading" size={12} d={0} />
      <Pixels x={x0} y={50} values={[row]} cell={cell} max={255} d={100} outline={(_, c) => (c === at || c === at + 1 ? "gold" : undefined)} />
      <Curve box={plot} axes points={row.map((v, i) => [i, v] as const)} tone={ROW_TONE[id]} width={2.4} d={400} dur={900} />
      <Text x={plot.x - 10} y={plot.y + plot.h / 2} text={bi("value", "القيمة")} anchor="end" size={10.5} tone="muted" d={500} />
      <Chip
        x={280}
        y={252}
        text={high ? bi(`largest jump ${maxJump(row)}: high frequency`, `أكبر قفزة ${maxJump(row)}: تردد مرتفع`) : bi(`largest jump ${maxJump(row)}: low frequency`, `أكبر قفزة ${maxJump(row)}: تردد منخفض`)}
        tone={high ? "warn" : "slate"}
        center
        d={1300}
      />
    </Svg>
  );
}

function Domains() {
  const c = 4;
  const s = 32 * c;
  const lx = 28;
  const rx = 404;
  const y = 56;
  return (
    <Svg>
      <Text x={lx + s / 2} y={26} text={bi("spatial domain", "المجال المكاني")} tone="heading" size={12} d={0} />
      <Raster x={lx} y={y} values={TEST_IMG} cell={c} d={100} />
      <Text x={lx + s / 2} y={y + s + 16} text="f(x, y)" size={12} mono tone="heading" d={300} />
      <Arrow pts={[[170, 96], [394, 96]]} tone="gold" d={600} dur={500} label={bi("Fourier transform", "تحويل فورييه")} labelAt={[282, 70]} />
      <Arrow pts={[[394, 140], [170, 140]]} tone="slate" d={1100} dur={500} label={bi("inverse transform", "التحويل المعكوس")} labelAt={[282, 160]} labelTone="slate" />
      <Text x={rx + s / 2} y={26} text={bi("frequency domain", "المجال الترددي")} tone="heading" size={12} d={800} />
      <Raster x={rx} y={y} values={spectrumImage(TEST_IMG)} cell={c} d={900} />
      <Text x={rx + s / 2} y={y + s + 16} text="F(u, v)" size={12} mono tone="heading" d={1000} />
      <Chip x={lx + s / 2 + 10} y={244} text={bi("each pixel: an intensity", "كل بكسل: شدة")} tone="slate" center d={1400} />
      <Chip x={rx + s / 2 - 10} y={244} text={bi("each point: a frequency", "كل نقطة: تردد")} tone="gold" center d={1600} />
    </Svg>
  );
}

const DISC = Array.from({ length: 20 }, (_, r) => Array.from({ length: 20 }, (_, c) => (Math.hypot(r - 10, c - 10) <= 5 ? 1 : 0)));

function Why() {
  const boxes = [
    { x: 16, title: bi("Speed", "السرعة"), sub: bi("large masks run faster", "الأقنعة الكبيرة أسرع"), tone: "navy" as const },
    { x: 200, title: bi("Precision", "الدقة"), sub: bi("pick exact frequencies", "انتقاء ترددات بعينها"), tone: "gold" as const },
    { x: 384, title: bi("New tasks", "مهام جديدة"), sub: bi("e.g. periodic noise", "مثل الضوضاء الدورية"), tone: "slate" as const },
  ];
  return (
    <Svg>
      {boxes.map((b, i) => (
        <Box key={i} x={b.x} y={44} w={160} h={72} label={b.title} sub={b.sub} tone={b.tone} d={i * 300} />
      ))}
      <Bars x={46} y={136} w={100} h={84} values={[961, 55]} labels={["31²", "FFT"]} max={961} showValues gap={0.4} d={900} barTone={(i) => (i === 0 ? "danger" : "success")} />
      <Raster x={240} y={136} values={DISC} cell={4} max={1} d={1100} />
      <Text x={280} y={238} text={bi("keep only the disc", "أبقِ القرص فقط")} size={10.5} tone="muted" d={1200} />
      <Raster x={424} y={136} values={spectrumImage(NOISY_IMG)} cell={2.5} d={1300} />
      <Text x={464} y={238} text={bi("noise = two spikes", "الضوضاء = قمتان")} size={10.5} tone="muted" d={1400} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof intro>>({
  decompose: Decompose,
  rate: Rate,
  domains: Domains,
  why: Why,
});
