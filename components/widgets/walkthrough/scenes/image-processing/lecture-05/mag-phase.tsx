"use client";

import type { magPhase } from "@/lib/walkthroughs/image-processing/lecture-05";
import { abs, arg, argDeg, fmtC, fmtNum, MATLAB_B, naiveArgDeg, pretty, showC, WORKED, WORKED_F, WORKED_SUMS } from "@/lib/widgets/ip-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Curve, In, plotAt, Svg, Text, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { arc, Dot, Plane, Seg, SignedBars } from "./local";

const n = (v: number, digits = 4) => pretty(fmtNum(v, digits));

function Polar({ control }: { control: string }) {
  const u = Number(control) || 1;
  const F = WORKED_F[u];
  const mag = abs(F);
  const phi = arg(F);
  const deg = argDeg(F);
  const naive = naiveArgDeg(F);
  const naiveRad = (naive * Math.PI) / 180;
  const box: PlotBox = { x: 40, y: 44, w: 222, h: 222, domain: [-0.95, 0.95], range: [-0.95, 0.95] };
  const [px, py] = plotAt(box, F.re, F.im);
  const label = plotAt(box, 0.34 * Math.cos(phi / 2), 0.34 * Math.sin(phi / 2));
  const wrongEnd = plotAt(box, mag * Math.cos(naiveRad), mag * Math.sin(naiveRad));
  return (
    <Svg>
      <Plane box={box} d={0} />
      <Curve box={box} points={arc(0, 0, mag)} tone="faint" dashed width={1.3} d={200} />
      <Seg box={box} a={[0, 0]} b={[mag * Math.cos(naiveRad), mag * Math.sin(naiveRad)]} tone="danger" dashed d={1600} />
      <Text x={wrongEnd[0] + (Math.cos(naiveRad) >= 0 ? 6 : -6)} y={wrongEnd[1] + (naive === 0 ? -12 : Math.sin(naiveRad) > 0 ? -10 : 12)} text={`${pretty(String(naive))}°?`} anchor={Math.cos(naiveRad) >= 0 ? "start" : "end"} size={10.5} mono tone="danger" d={1700} />
      <Curve box={box} points={arc(0, 0, 0.2, 0, phi, 30)} tone="gold" width={1.8} d={700} dur={500} />
      <Seg box={box} a={[0, 0]} b={[F.re, F.im]} tone="gold" width={2.6} d={300} dur={500} />
      <Dot x={px} y={py} r={5} tone="gold" d={750} />
      <Text x={label[0]} y={label[1] + (Math.abs(phi) > 3 ? -10 : 0)} text={`${pretty(String(deg))}°`} size={11} mono tone="gold" d={1000} />
      <Text x={296} y={60} text={`F${u} = ${showC(F)}`} anchor="start" size={13} mono tone="gold" d={200} />
      <Text x={296} y={96} text={`|F${u}| = √(${n(F.re ** 2)} + ${n(F.im ** 2)}) = ${n(mag, 2)}`} anchor="start" size={11.5} mono tone="text" d={500} />
      <Text x={296} y={124} text={`φ = atan2(${n(F.im)}, ${n(F.re)}) = ${pretty(String(deg))}°`} anchor="start" size={11.5} mono tone="text" d={900} />
      <Box
        x={296}
        y={160}
        w={240}
        h={58}
        label={`tan⁻¹(${n(F.im)}/${n(F.re)}) = ${pretty(String(naive))}°`}
        sub={bi("wrong: the real part is negative", "خطأ: لأن الجزء الحقيقي سالب")}
        tone="danger"
        mono
        size={11.5}
        d={1500}
      />
      <Text x={296} y={248} text="F = |F|·e^(iφ)" anchor="start" size={12} mono tone="muted" d={1900} />
    </Svg>
  );
}

function Spectra({ control }: { control: string }) {
  const phase = control === "phase";
  const mags = WORKED_F.map(abs);
  const phases = WORKED_F.map(argDeg);
  const labels = WORKED_F.map((_, u) => `u=${u}`);
  return (
    <Svg>
      {phase ? (
        <>
          <Text x={240} y={24} text={bi("phase φ_u, in degrees", "الطور φ_u بالدرجات")} tone="heading" size={12} d={0} />
          <SignedBars x={90} y={62} w={300} h={168} values={phases} max={180} labels={labels} texts={phases.map((p) => `${pretty(String(p))}°`)} d={200} barTone={(u) => (u === 1 || u === 3 ? "slate" : "gold")} />
          <Text x={420} y={110} text="φ3 = −φ1" anchor="start" size={12} mono tone="slate" d={1000} />
          <Text x={420} y={132} text={bi("anti-symmetric", "تناظر بإشارة معاكسة")} anchor="start" size={11} tone="muted" d={1000} />
        </>
      ) : (
        <>
          <Text x={240} y={24} text={bi("magnitude |F_u|", "المقدار |F_u|")} tone="heading" size={12} d={0} />
          <Bars x={90} y={64} w={300} h={150} values={mags} labels={labels} max={2.5} showValues d={200} barTone={(u) => (u === 1 || u === 3 ? "slate" : "gold")} />
          <Text x={420} y={110} text="|F1| = |F3|" anchor="start" size={12} mono tone="slate" d={1000} />
          <Text x={420} y={132} text={bi("a mirror pair", "زوج متناظر كالمرآة")} anchor="start" size={11} tone="muted" d={1000} />
        </>
      )}
      <Text x={280} y={256} text={`F = [${WORKED_F.map((c) => showC(c)).join(", ")}]`} size={11.5} mono tone="muted" d={1300} />
    </Svg>
  );
}

function Dc({ control }: { control: string }) {
  const matlab = control === "matlab";
  const bars = { x: 50, y: 64, w: 240, h: 150 };
  const mean = WORKED_F[0].re;
  const lineY = bars.y + bars.h - (mean / 4) * bars.h;
  const unit = bars.h / WORKED_SUMS[0].re;
  let base = bars.y + bars.h;
  const blocks = WORKED.map((v) => {
    const h = v * unit;
    base -= h;
    return { v, y: base, h };
  });
  return (
    <Svg>
      <Text x={170} y={30} text={bi("the samples f = [1, 2, 3, 4]", "العينات f = [1, 2, 3, 4]")} tone="heading" size={12} d={0} />
      <Bars x={bars.x} y={bars.y} w={bars.w} h={bars.h} values={[...WORKED]} labels={WORKED.map((_, i) => `f${i}`)} max={4} showValues tone="slate" d={100} />
      {blocks.map((b, i) => (
        <In key={i} d={700 + i * 200}>
          <Box x={372} y={b.y} w={58} h={b.h} r={2} label={String(b.v)} tone="outline" mono size={11} />
        </In>
      ))}
      <Text x={442} y={bars.y + 6} text={`Σ = ${fmtC(WORKED_SUMS[0])}`} anchor="start" size={12.5} mono tone="heading" d={1500} />
      {matlab ? (
        <>
          <Text x={442} y={bars.y + 34} text={bi("no division", "دون قسمة")} anchor="start" size={11} tone="danger" d={1700} />
          <Text x={280} y={250} text={`fft: X(1) = Σ f_x = ${fmtC(WORKED_SUMS[0])};   fft(1:9) → ${fmtC(MATLAB_B[0])}`} size={12} mono tone="gold" d={1900} />
        </>
      ) : (
        <>
          <Arrow pts={[[bars.x - 6, lineY], [bars.x + bars.w + 6, lineY]]} tone="gold" head={false} dashed d={1700} />
          <Text x={bars.x + 2} y={lineY - 12} text={`F0 = ${fmtC(WORKED_F[0])}`} anchor="start" size={12} mono tone="gold" d={1800} />
          <Text x={442} y={bars.y + 34} text={`÷ N = ${fmtC(WORKED_F[0])}`} anchor="start" size={12} mono tone="gold" d={1700} />
          <Text x={280} y={250} text={`F0 = (1/N)·Σ f_x·exp(0) = ${fmtC(WORKED_SUMS[0])}/${WORKED.length} = ${fmtC(WORKED_F[0])}`} size={12} mono tone="gold" d={1900} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof magPhase>>({
  polar: Polar,
  spectra: Spectra,
  dc: Dc,
});
