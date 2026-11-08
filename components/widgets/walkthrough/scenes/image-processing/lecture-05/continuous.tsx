"use client";

import type { continuous } from "@/lib/walkthroughs/image-processing/lecture-05";
import { cx, fmtNum, pretty, productAverage, showC } from "@/lib/widgets/ip-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, plotAt, Svg, Text, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { arc, Dot, Plane, Seg, ZeroLine } from "./local";

function Pair() {
  return (
    <Svg>
      <Box x={22} y={104} w={150} h={64} label="f(x)" sub={bi("spatial domain", "المجال المكاني")} tone="navy" size={15} mono d={0} />
      <Box x={388} y={104} w={150} h={64} label="F(u)" sub={bi("frequency domain", "المجال الترددي")} tone="gold" size={15} mono d={200} />
      <Text x={280} y={54} text="F(u) = ∫ f(x)·e^(−i2πxu) dx" size={12} mono tone="heading" d={400} />
      <Text x={280} y={76} text={bi("Fourier transform", "تحويل فورييه")} size={11} tone="gold" d={450} />
      <Chip x={392} y={54} text={bi("minus sign", "إشارة سالبة")} tone="gold" d={700} />
      <Arrow pts={[[176, 116], [384, 116]]} tone="gold" d={500} />
      <Arrow pts={[[384, 156], [176, 156]]} tone="slate" d={1100} />
      <Text x={280} y={184} text="f(x) = ∫ F(u)·e^(+i2πxu) du" size={12} mono tone="heading" d={1000} />
      <Text x={280} y={206} text={bi("inverse Fourier transform", "تحويل فورييه العكسي")} size={11} tone="slate" d={1050} />
      <Chip x={392} y={190} text={bi("plus sign", "إشارة موجبة")} tone="slate" d={1300} />
      <Text x={280} y={252} text={bi("the same information, two views", "المعلومات نفسها من منظورين")} size={11.5} tone="muted" d={1600} />
    </Svg>
  );
}

function Anatomy() {
  // Mono 17: 0.6 em = 10.2 px per character, so the pieces can be pointed at.
  const ch = 10.2;
  const patternLeft = 300;
  const uAt = patternLeft + 7.5 * ch;
  return (
    <Svg>
      <Text x={280} y={24} text={bi("The inverse transform, piece by piece", "التحويل العكسي جزءًا جزءًا")} tone="heading" size={12} d={0} />
      <Text x={220} y={72} text="f(x) = ∫" anchor="end" size={17} mono tone="heading" d={100} />
      <Text x={252} y={72} text="F(u)" size={17} mono tone="gold" d={200} />
      <Text x={284} y={72} text="·" size={17} mono tone="heading" d={200} />
      <Text x={patternLeft} y={72} text="e^(i2πxu)" anchor="start" size={17} mono tone="slate" d={300} />
      <Text x={400} y={72} text="du" anchor="start" size={17} mono tone="heading" d={300} />
      <Arrow pts={[[252, 88], [110, 138]]} tone="gold" d={600} />
      <Arrow pts={[[346, 88], [282, 138]]} tone="slate" d={800} />
      <Arrow pts={[[uAt, 88], [458, 138]]} tone="muted" d={1000} />
      <Box x={22} y={140} w={170} h={68} label="F(u)" sub={bi("the weight of frequency u", "وزن التردد u")} tone="gold" mono d={700} />
      <Box x={200} y={140} w={164} h={68} label="e^(i2πxu)" sub={bi("a simple periodic pattern", "نمط دوري بسيط")} tone="slate" mono d={900} />
      <Box x={372} y={140} w={170} h={68} label={bi("spatial frequency u", "التردد المكاني u")} sub={bi("cycles per unit of x", "دورات لكل وحدة من x")} tone="outline" d={1100} />
      <Chip x={280} y={244} text={bi("x: the image coordinate", "x: إحداثي الصورة")} tone="outline" center d={1400} />
    </Svg>
  );
}

const n2 = (v: number) => pretty(fmtNum(v, 2));

function Euler({ control }: { control: string }) {
  const deg = Number(control) || 45;
  const t = (deg * Math.PI) / 180;
  const c = cx(Math.cos(t), Math.sin(t));
  const box: PlotBox = { x: 40, y: 44, w: 222, h: 222, domain: [-1.35, 1.35], range: [-1.35, 1.35] };
  const p = plotAt(box, c.re, c.im);
  const cosAt = plotAt(box, c.re, 0);
  const sinAt = plotAt(box, 0, c.im);
  // On an axis (θ = 270°) the projections collapse onto the point, so they are not labelled.
  const showCos = Math.abs(c.re) > 0.05 && Math.abs(c.im) > 0.05;
  const showSin = showCos;
  return (
    <Svg>
      <Plane box={box} unit d={0} />
      <Curve box={box} points={arc(0, 0, 0.26, 0, t, 24)} tone="gold" width={1.6} d={500} dur={400} />
      <Seg box={box} a={[0, 0]} b={[c.re, c.im]} tone="gold" width={2.4} d={300} dur={500} />
      <Dot x={p[0]} y={p[1]} r={5} tone="gold" d={750} />
      {showCos && showSin ? (
        <>
          <Seg box={box} a={[c.re, c.im]} b={[c.re, 0]} tone="slate" head={false} dashed d={900} />
          <Seg box={box} a={[c.re, c.im]} b={[0, c.im]} tone="slate" head={false} dashed d={900} />
        </>
      ) : null}
      {showCos ? <Text x={cosAt[0]} y={cosAt[1] + (c.im > 0 ? 14 : -12)} text="cos θ" size={10.5} mono tone="slate" d={1000} /> : null}
      {showSin ? <Text x={sinAt[0] + (c.re < 0 ? 6 : -6)} y={sinAt[1]} text="sin θ" anchor={c.re < 0 ? "start" : "end"} size={10.5} mono tone="slate" d={1000} /> : null}
      <Text x={296} y={64} text="e^(iθ) = cos θ + i sin θ" anchor="start" size={12.5} mono tone="heading" d={200} />
      <Text x={296} y={102} text={`θ = ${deg}°`} anchor="start" size={12} mono tone="muted" d={400} />
      <Text x={296} y={128} text={`cos θ = ${n2(c.re)}`} anchor="start" size={12} mono tone="slate" d={1000} />
      <Text x={296} y={152} text={`sin θ = ${n2(c.im)}`} anchor="start" size={12} mono tone="slate" d={1100} />
      <Text x={296} y={188} text={`e^(iθ) = ${showC(c, 2)}`} anchor="start" size={13} mono tone="gold" d={1300} />
      {deg === 270 ? <Chip x={296} y={232} text={bi("−i is the ω of a 4-point DFT", "وهي قيمة ω في تحويل DFT ذي 4 نقاط")} tone="gold" d={1500} /> : null}
    </Svg>
  );
}

function Measure({ control }: { control: string }) {
  const u = Number(control) || 2;
  const f = (x: number) => Math.cos(2 * Math.PI * 2 * x);
  const g = (x: number) => Math.cos(2 * Math.PI * u * x);
  const avg = productAverage(2, u);
  const rows = [
    { y: 46, label: bi("signal f(x)", "الإشارة f(x)"), fn: f, tone: "slate" as const },
    { y: 118, label: bi(`pattern, u = ${u}`, `النمط، u = ${u}`), fn: g, tone: "navy" as const },
    { y: 190, label: bi("product", "حاصل الضرب"), fn: (x: number) => f(x) * g(x), tone: "gold" as const },
  ];
  const boxOf = (y: number): PlotBox => ({ x: 150, y, w: 280, h: 52, domain: [0, 1], range: [-1.15, 1.15] });
  const prod = boxOf(190);
  const match = avg > 0.01;
  return (
    <Svg>
      {rows.map((r, i) => {
        const box = boxOf(r.y);
        return (
          <g key={i}>
            <Text x={140} y={r.y + 20} text={r.label} anchor="end" size={11.5} tone="heading" d={i * 450} />
            <ZeroLine box={box} d={i * 450} />
            <Curve box={box} fn={r.fn} samples={200} tone={r.tone} width={2} d={50 + i * 450} dur={700} />
          </g>
        );
      })}
      <Text x={290} y={109} text="×" size={15} tone="muted" d={400} />
      <Text x={290} y={181} text="=" size={15} tone="muted" d={850} />
      <Seg box={prod} a={[0, avg]} b={[1, avg]} tone={match ? "success" : "danger"} head={false} dashed d={1500} />
      <Chip x={496} y={216} text={bi(`average = ${fmtNum(avg, 2)}`, `المتوسط = ${fmtNum(avg, 2)}`)} tone={match ? "success" : "danger"} center d={1600} />
      <Chip x={496} y={92} text={match ? `F(${u}) ≠ 0` : `F(${u}) = 0`} tone={match ? "gold" : "outline"} center d={1900} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof continuous>>({
  pair: Pair,
  anatomy: Anatomy,
  euler: Euler,
  measure: Measure,
});
