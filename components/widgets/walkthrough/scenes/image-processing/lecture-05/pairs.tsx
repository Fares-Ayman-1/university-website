"use client";

import type { pairs } from "@/lib/walkthroughs/image-processing/lecture-05";
import { abs, argDeg, BOX_HALF, box as boxSignal, boxWidth, centredSignal, centredSpectrum, circShift, CONSTANT, dft, fmtList, fmtNum, GAUSS_SIGMA, gaussian, IMPULSE, PAIR_N, pretty, WORKED } from "@/lib/widgets/ip-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Chip, Curve, plotAt, Svg, Text, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Dial, Seg, ZeroLine } from "./local";

const list = (xs: readonly number[]) => pretty(fmtList(xs));
const HALF = PAIR_N / 2;

function ImpulseConstant({ control }: { control: string }) {
  const impulse = control !== "constant";
  const f = impulse ? IMPULSE : CONSTANT;
  const F = dft(f).map((c) => c.re);
  const idx = f.map((_, i) => String(i));
  return (
    <Svg>
      <Text x={130} y={30} text={`f(x) = ${list([...f])}`} size={12} mono tone="heading" d={0} />
      <Text x={430} y={30} text={`F(u) = ${list(F)}`} size={12} mono tone="gold" d={900} />
      <Bars x={40} y={66} w={180} h={130} values={[...f]} labels={idx} max={1} showValues tone="slate" d={100} />
      <Arrow pts={[[240, 140], [320, 140]]} tone="gold" d={600} label="DFT" labelAt={[280, 126]} />
      <Bars x={340} y={66} w={180} h={130} values={F} labels={idx} max={1} showValues tone="gold" d={800} />
      <Text x={130} y={226} text="x" size={11} mono tone="muted" d={200} />
      <Text x={430} y={226} text="u" size={11} mono tone="muted" d={900} />
      <Chip
        x={280}
        y={252}
        text={impulse ? bi(`one spike: every frequency, equally (${fmtNum(F[0])} each)`, `نبضة واحدة: جميع الترددات بالتساوي (${fmtNum(F[0])} لكلٍّ منها)`) : bi("no variation: the DC value only", "لا تغيّر: القيمة المستمرة فقط")}
        tone={impulse ? "slate" : "gold"}
        center
        d={1400}
      />
    </Svg>
  );
}

function Shift({ control }: { control: string }) {
  const a = Number(control) || 0;
  const g = circShift(WORKED, a);
  const G = dft(g);
  const mags = G.map(abs);
  const idx = g.map((_, i) => String(i));
  const dials = [
    [446, 92],
    [516, 92],
    [446, 170],
    [516, 170],
  ] as const;
  return (
    <Svg>
      <Text x={105} y={30} text={`f(x + ${a}) = ${list(g)}`} size={12} mono tone="heading" d={0} />
      <Bars x={30} y={70} w={150} h={110} values={g} labels={idx} max={4} showValues tone="slate" d={100} />
      <Text x={295} y={30} text={bi("magnitude |F(u)|", "المقدار |F(u)|")} size={12} tone="heading" d={500} />
      <Bars x={220} y={70} w={150} h={110} values={mags} labels={idx} max={2.5} showValues tone="gold" d={600} />
      <Text x={481} y={30} text={bi("phase of F(u)", "طور F(u)")} size={12} tone="heading" d={1000} />
      {G.map((c, u) => (
        <g key={u}>
          <Text x={dials[u][0]} y={dials[u][1] - 30} text={`F${u}`} size={10.5} mono tone="muted" d={1100 + u * 150} />
          <Dial x={dials[u][0]} y={dials[u][1]} r={18} deg={argDeg(c)} tone={u === 0 ? "slate" : "gold"} label={`${pretty(String(argDeg(c)))}°`} d={1100 + u * 150} />
        </g>
      ))}
      <Chip x={280} y={246} text={bi("the bars stay, only the phases turn", "تبقى الأعمدة كما هي، وتدور الأطوار فقط")} tone="gold" center d={1900} />
    </Svg>
  );
}

const plot = (x: number, lo: number): PlotBox => ({ x, y: 66, w: 220, h: 130, domain: [-HALF, HALF - 1], range: [lo, 1.1] });

function Scaling({ control }: { control: string }) {
  const sigma = GAUSS_SIGMA[control === "wide" ? "wide" : "narrow"];
  const g = gaussian(PAIR_N, sigma);
  const sig = centredSignal(g);
  const spec = centredSpectrum(g);
  const left = plot(30, -0.08);
  const right = plot(312, -0.08);
  const widthOf = (pts: [number, number][]) => {
    const above = pts.filter(([, v]) => v >= 0.5).map(([x]) => x);
    return { lo: Math.min(...above), hi: Math.max(...above), n: above.length };
  };
  const ws = widthOf(sig);
  const wf = widthOf(spec);
  const span = (box: PlotBox, w: { lo: number; hi: number }, tone: "slate" | "gold", d: number) => (
    <Arrow pts={[plotAt(box, w.lo - 0.5, 0.5), plotAt(box, w.hi + 0.5, 0.5)]} tone={tone} both d={d} dur={300} />
  );
  return (
    <Svg>
      <Text x={140} y={30} text={bi(`signal: Gaussian, σ = ${sigma}`, `الإشارة: دالة غاوس، σ = ${sigma}`)} size={12} tone="heading" d={0} />
      <Text x={422} y={30} text={bi("its spectrum", "طيفها")} size={12} tone="heading" d={800} />
      <ZeroLine box={left} d={100} />
      <Curve box={left} points={sig} tone="slate" width={2.2} d={150} />
      {span(left, ws, "slate", 700)}
      <Arrow pts={[[258, 131], [300, 131]]} tone="gold" d={700} dur={300} label="DFT" labelAt={[279, 117]} />
      <ZeroLine box={right} d={900} />
      <Curve box={right} points={spec} tone="gold" width={2.2} d={950} />
      {span(right, wf, "gold", 1500)}
      <Text x={140} y={222} text={bi(`half-height width: ${ws.n}`, `العرض عند نصف الارتفاع: ${ws.n}`)} size={11} tone="slate" d={800} />
      <Text x={422} y={222} text={bi(`half-height width: ${wf.n}`, `العرض عند نصف الارتفاع: ${wf.n}`)} size={11} tone="gold" d={1600} />
      <Text x={280} y={254} text={sigma === GAUSS_SIGMA.narrow ? bi("narrow signal → wide spectrum", "إشارة ضيقة ← طيف عريض") : bi("wide signal → narrow spectrum", "إشارة عريضة ← طيف ضيق")} size={11.5} tone="heading" d={1800} />
    </Svg>
  );
}

function BoxSinc({ control }: { control: string }) {
  const half = BOX_HALF[control === "wide" ? "wide" : "narrow"];
  const W = boxWidth(half);
  const spec = centredSpectrum(boxSignal(PAIR_N, half));
  const left = plot(30, -0.35);
  const right = plot(312, -0.35);
  const zero = PAIR_N / W;
  const outline: [number, number][] = [
    [-HALF, 0],
    [-half - 0.5, 0],
    [-half - 0.5, 1],
    [half + 0.5, 1],
    [half + 0.5, 0],
    [HALF - 1, 0],
  ];
  const tick = plotAt(right, zero, 0);
  return (
    <Svg>
      <Text x={140} y={30} text={bi(`a box of ${W} ones`, `صندوق من الآحاد عرضه ${W}`)} size={12} tone="heading" d={0} />
      <Text x={422} y={30} text={bi("its DFT: a sinc", "تحويله: دالة sinc")} size={12} tone="heading" d={800} />
      <ZeroLine box={left} d={100} />
      <Curve box={left} points={outline} tone="slate" width={2.2} d={150} />
      <Arrow pts={[[258, 131], [300, 131]]} tone="gold" d={700} dur={300} label="DFT" labelAt={[279, 117]} />
      <ZeroLine box={right} d={900} />
      <Curve box={right} points={spec} tone="gold" width={2.2} d={950} dur={1100} />
      <Seg box={right} a={[zero, -0.16]} b={[zero, 0.16]} tone="danger" head={false} d={1900} />
      <Seg box={right} a={[-zero, -0.16]} b={[-zero, 0.16]} tone="danger" head={false} d={1900} />
      <Text x={tick[0] + 4} y={tick[1] + 30} text={`N/W ≈ ${fmtNum(zero, 1)}`} anchor="start" size={10.5} mono tone="danger" d={2000} />
      <Text x={250} y={244} text={bi("main lobe:", "الفص الرئيسي:")} anchor="end" size={11.5} tone="gold" d={2200} />
      <Text x={258} y={244} text={`|u| < N/W = ${PAIR_N}/${W} ≈ ${fmtNum(zero, 1)}`} anchor="start" size={11.5} mono tone="gold" d={2200} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof pairs>>({
  "impulse-constant": ImpulseConstant,
  shift: Shift,
  scaling: Scaling,
  "box-sinc": BoxSinc,
});
