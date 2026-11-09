"use client";

import type { dft1d } from "@/lib/walkthroughs/image-processing/lecture-04";
import { INVERSE_N, inverseAt, inverseTerms, SIGNALS, SPECTRA, type SignalId } from "@/lib/widgets/ip-lecture-04";
import { dftTerms, fmtC, fmtNum, omegaPow, pretty, sumText } from "@/lib/widgets/ip-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Svg, Table, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { NumGrid, SignedBars } from "./local";

const N = 4;
/** (−i)^(kn), the kernel of the 4-point DFT, printed with a true minus sign. */
const KERNEL = Array.from({ length: N }, (_, k) => Array.from({ length: N }, (_, n) => pretty(fmtC(omegaPow(N, k * n)))));

function Formula() {
  const boxes = [
    { x: 24, cx: 104, from: 168, label: "F[k]", sub: bi("weight of frequency k", "وزن التردد k") },
    { x: 200, cx: 280, from: 250, label: "f[n]", sub: bi("input sample n", "عينة الدخل n") },
    { x: 376, cx: 456, from: 352, label: "e^(−i2πkn/N)", sub: bi("k cycles over N samples", "k دورة على N عينة") },
  ];
  return (
    <Svg>
      <Text x={280} y={26} text="F[k] = Σ f[n] · e^(−i2πkn/N)" size={15} mono tone="gold" d={0} />
      {boxes.map((b, i) => (
        <g key={i}>
          <Arrow pts={[[b.from, 38], [b.cx, 58]]} tone="muted" d={300 + i * 200} dur={250} />
          <Box x={b.x} y={60} w={160} h={58} label={b.label} sub={b.sub} mono size={12} tone={i === 2 ? "gold" : "outline"} d={350 + i * 200} />
        </g>
      ))}
      <Text x={150} y={134} text={bi("N = 4: the values of (−i)^(kn)", "قيم النواة عندما N = 4")} size={11.5} tone="heading" d={1000} />
      <Table
        x={40}
        y={160}
        cols={["k \\ n", "0", "1", "2", "3"]}
        rows={KERNEL.map((row, k) => [String(k), ...row])}
        cw={[52, 42, 42, 42, 42]}
        rh={21}
        d={1100}
        cell={(_, c) => (c === 0 ? "muted" : undefined)}
        size={11}
      />
      <Text x={420} y={176} text={bi("row k = the wave of frequency k", "الصف k = موجة التردد k")} size={11} tone="muted" d={1700} />
      <Text x={420} y={212} text={bi("only 1, −i, −1 and i appear,", "لا تظهر إلا أربع قيم: الواحد وسالبه، و i وسالبها،")} size={11} tone="muted" d={1900} />
      <Text x={420} y={244} text={bi("so a 4-point DFT is easy by hand", "لذا يسهل حساب DFT من 4 نقاط يدويًا")} size={11} tone="muted" d={2000} />
    </Svg>
  );
}

function Worked({ control }: { control: string }) {
  const id: SignalId = control === "alternating" ? "alternating" : "smooth";
  const f = SIGNALS[id];
  const F = SPECTRA[id].map((c) => c.re);
  const name = id === "smooth" ? "f" : "g";
  const big = id === "smooth" ? "F" : "G";
  const lines = Array.from({ length: N }, (_, k) => `${sumText(dftTerms(f, k))} = ${pretty(fmtNum(F[k]))}`);
  return (
    <Svg>
      <Text x={92} y={26} text={`${name} = [${f.join(", ")}]`} size={12} mono tone="heading" d={0} />
      <Bars x={26} y={60} w={132} h={130} values={f} labels={f.map((_, n) => `n=${n}`)} max={4} showValues gap={0.35} tone="slate" d={100} />
      <Text x={290} y={26} text={`${big}[k] = Σ ${name}[n] · (−i)^(kn)`} size={12} mono tone="heading" d={500} />
      {lines.map((l, k) => (
        <g key={k}>
          <Box x={186} y={56 + k * 34} w={46} h={28} r={4} label={`k=${k}`} mono size={11} tone="muted" d={600 + k * 160} />
          <Text x={240} y={70 + k * 34} text={l} anchor="start" size={11} mono tone={F[k] !== 0 && k > 0 ? "gold" : "text"} d={650 + k * 160} />
        </g>
      ))}
      <Text x={478} y={26} text={`${big}[k]`} size={12} mono tone="heading" d={1300} />
      <SignedBars x={418} y={52} w={124} h={150} values={F} max={8} labels={F.map((_, k) => `k=${k}`)} texts={F.map((v) => pretty(fmtNum(v)))} barTone={(k) => (k === 0 ? "navy" : "gold")} d={1400} />
      <Chip
        x={280}
        y={250}
        text={id === "smooth" ? bi("weight at k = 1 and 3: one slow cycle, a low frequency", "الوزن عند k = 1 و 3: دورة بطيئة واحدة، تردد منخفض") : bi("all at k = 2 = N/2: the highest frequency", "كله عند k = 2 = N/2: أعلى تردد")}
        tone={id === "smooth" ? "slate" : "warn"}
        center
        d={2000}
      />
    </Svg>
  );
}

function Inverse() {
  const F = SPECTRA.smooth;
  const n = INVERSE_N;
  const powers = Array.from({ length: N }, (_, k) => pretty(fmtC(omegaPow(N, k * n, 1))));
  const terms = inverseTerms(F, n).map((c) => pretty(fmtC(c)));
  const total = inverseTerms(F, n).reduce((s, c) => s + c.re, 0);
  const rows = [F.map((c) => pretty(fmtC(c))), powers, terms];
  const labels = ["F[k]", `× i^k`, "="];
  const cw = 58;
  const x0 = 120;
  return (
    <Svg>
      <Text x={280} y={26} text={`f[${n}] = (1/4) Σ F[k] · e^(i2πk·${n}/4)`} size={13} mono tone="gold" d={0} />
      <NumGrid x={x0} y={56} cells={[["k=0", "k=1", "k=2", "k=3"]]} cw={cw} ch={24} tone={() => "muted"} size={10.5} d={100} />
      {rows.map((row, r) => (
        <g key={r}>
          <Text x={x0 - 12} y={96 + r * 44} text={labels[r]} anchor="end" size={12} mono tone="heading" d={300 + r * 400} />
          <NumGrid x={x0} y={82 + r * 44} cells={[row]} cw={cw} ch={28} tone={() => (r === 2 ? "gold" : "outline")} size={11.5} d={300 + r * 400} />
        </g>
      ))}
      <Arrow pts={[[x0 + 4 * cw + 12, 184], [x0 + 4 * cw + 52, 184]]} tone="gold" d={1500} dur={250} />
      <Box x={x0 + 4 * cw + 58} y={160} w={130} h={48} label={`Σ = ${fmtNum(total)}`} sub={`÷ 4 = ${fmtNum(inverseAt(F, n))}`} mono tone="gold" d={1600} />
      <Text x={280} y={238} text={bi(`f[${n}] = ${fmtNum(inverseAt(F, n))}: the second sample of f = [4, 2, 0, 2] is back`, `f[${n}] = ${fmtNum(inverseAt(F, n))}: عادت العينة الثانية من f = [4, 2, 0, 2]`)} size={11.5} tone="success" d={1900} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof dft1d>>({
  formula: Formula,
  worked: Worked,
  inverse: Inverse,
});
