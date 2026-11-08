"use client";

import type { sines } from "@/lib/walkthroughs/image-processing/lecture-05";
import { abs, dft, overshoot, SQUARE_LEVEL, squareSum, THREE_SINES, threeSines } from "@/lib/widgets/ip-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Bars, Chip, Curve, Pixels, plotAt, Svg, Text, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { ZeroLine } from "./local";

const TWO_PI = 2 * Math.PI;

function Three() {
  const labels = ["sin x", "(1/3) sin 2x", "(1/5) sin 4x"];
  const sum: PlotBox = { x: 300, y: 64, w: 236, h: 160, domain: [0, TWO_PI], range: [-1.5, 1.5] };
  return (
    <Svg>
      {THREE_SINES.map((s, i) => {
        const box: PlotBox = { x: 56, y: 56 + i * 72, w: 180, h: 44, domain: [0, TWO_PI], range: [-1.05, 1.05] };
        return (
          <g key={i}>
            <Text x={box.x} y={box.y - 8} text={labels[i]} anchor="start" size={11} mono tone="slate" d={i * 350} />
            <ZeroLine box={box} d={i * 350} />
            <Curve box={box} fn={(x) => s.amp * Math.sin(s.u * x)} tone="slate" width={1.8} d={50 + i * 350} dur={600} />
            {i > 0 ? <Text x={36} y={box.y + 22 - 36} text="+" size={18} tone="muted" d={i * 350} /> : null}
          </g>
        );
      })}
      <Text x={268} y={144} text="=" size={22} tone="gold" d={1200} />
      <Text x={sum.x} y={sum.y - 14} text="f(x)" anchor="start" size={12} mono tone="gold" d={1300} />
      <ZeroLine box={sum} d={1300} />
      <Curve box={sum} fn={threeSines} samples={200} width={2.6} d={1350} dur={1000} />
      <Text x={418} y={252} text={bi("same period, a richer shape", "الدورة نفسها، بشكل أغنى")} size={11} tone="muted" d={2300} />
    </Svg>
  );
}

function Square({ control }: { control: string }) {
  const n = Number(control) || 1;
  const box: PlotBox = { x: 44, y: 64, w: 300, h: 160, domain: [0, TWO_PI], range: [-1.15, 1.15] };
  const L = SQUARE_LEVEL;
  const target: [number, number][] = [
    [0, 0],
    [0, L],
    [Math.PI, L],
    [Math.PI, -L],
    [TWO_PI, -L],
    [TWO_PI, 0],
  ];
  const harmonics = Array.from({ length: 10 }, (_, k) => 1 / (2 * k + 1));
  const [, levelY] = plotAt(box, 0, L);
  return (
    <Svg>
      <Text x={194} y={26} text="sin x + (1/3) sin 3x + (1/5) sin 5x + …" size={11.5} mono tone="heading" d={0} />
      <ZeroLine box={box} d={100} />
      <Curve box={box} points={target} tone="faint" dashed width={1.6} d={100} />
      <Text x={38} y={levelY} text="π/4" anchor="end" size={10.5} mono tone="muted" d={200} />
      <Curve box={box} fn={squareSum(n)} samples={480} width={2.4} d={300} dur={1000} />
      <Text x={452} y={58} text={bi("terms used", "الحدود المستخدمة")} size={11} tone="heading" d={600} />
      <Bars
        x={378}
        y={90}
        w={150}
        h={120}
        values={harmonics}
        labels={harmonics.map((_, k) => String(2 * k + 1))}
        max={1}
        gap={0.3}
        d={700}
        stagger={50}
        barTone={(k) => (k < n ? "gold" : "muted")}
      />
      <Text x={452} y={240} text={bi("frequency (odd only)", "التردد (الفردي فقط)")} size={10.5} tone="muted" d={900} />
      <Chip
        x={194}
        y={252}
        text={n === 10 ? bi(`overshoot ≈ ${Math.round(overshoot(n) * 100)} % of the jump`, `التجاوز ≈ ${Math.round(overshoot(n) * 100)} % من القفزة`) : bi(`${n} of infinitely many terms`, `${n} من عدد لا نهائي من الحدود`)}
        tone={n === 10 ? "warn" : "slate"}
        center
        d={1400}
      />
    </Svg>
  );
}

const ROW = 16;
const EDGE = Array.from({ length: ROW }, (_, x) => (x < ROW / 2 ? 30 : 220));
const SMOOTH = Array.from({ length: ROW }, (_, x) => 125 - 95 * Math.cos((2 * Math.PI * x) / ROW));

function Edges({ control }: { control: string }) {
  const edge = control !== "smooth";
  const row = edge ? EDGE : SMOOTH;
  const mags = (r: number[]) => dft(r).slice(1, ROW / 2 + 1).map(abs);
  const shown = mags(row);
  const top = Math.max(...mags(EDGE), ...mags(SMOOTH));
  const plot: PlotBox = { x: 56, y: 88, w: 448, h: 48, domain: [-0.5, ROW - 0.5], range: [0, 255] };
  return (
    <Svg>
      <Text x={280} y={22} text={edge ? bi("A row across a sharp edge", "صف يعبر حافة حادة") : bi("A row across a smooth area", "صف يعبر منطقة ملساء")} tone="heading" size={12.5} d={0} />
      <Pixels x={56} y={46} values={[row]} cell={28} show="none" d={100} />
      <Curve box={plot} points={row.map((v, x) => [x, v] as const)} tone="slate" width={2} d={300} dur={700} />
      <Bars x={140} y={160} w={280} h={70} values={shown} labels={shown.map((_, i) => String(i + 1))} max={top} d={900} barTone={(i) => (i >= 3 ? (edge ? "warn" : "muted") : "gold")} />
      <Text x={280} y={256} text={bi("magnitude |F(u)|, u = 1 … 8 (DC left out)", "المقدار |F(u)| عند u = 1 … 8 (دون المركبة المستمرة)")} size={10.5} tone="muted" d={1300} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof sines>>({
  three: Three,
  square: Square,
  edges: Edges,
});
