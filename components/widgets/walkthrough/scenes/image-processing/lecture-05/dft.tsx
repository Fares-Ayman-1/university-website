"use client";

import type { dftWalk } from "@/lib/walkthroughs/image-processing/lecture-05";
import {
  add,
  cx,
  dft,
  dftOps,
  dftTerms,
  fmtC,
  fmtNum,
  idft,
  idftTerms,
  MATLAB_B,
  omegaPow,
  pretty,
  showC,
  SQUARE8,
  SQUARE8_PARTS,
  sumText,
  tightC,
  WORKED,
  WORKED_F,
  WORKED_SUMS,
  type C,
} from "@/lib/widgets/ip-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Curve, plotAt, Svg, Text, type LineTone, type PlotBox } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { arc, CGrid, Dot, fitBox, Plane, Seg, Stems } from "./local";

/** One colour per power of ω for N = 4, used for the matrix cells, the dots and the arrows. */
const powerTone = (w: C): "gold" | "slate" | "danger" | "success" => (w.re === 1 ? "gold" : w.im === -1 ? "slate" : w.re === -1 ? "danger" : "success");

function Samples() {
  const parts = [SQUARE8, ...SQUARE8_PARTS];
  const F = dft(SQUARE8);
  const wave = (u: number) => (x: number) => 2 * (F[u].re * Math.cos((2 * Math.PI * u * x) / 8) - F[u].im * Math.sin((2 * Math.PI * u * x) / 8));
  const titles = [bi("samples", "العينات"), bi("1 cycle", "دورة واحدة"), bi("3 cycles", "3 دورات")];
  const xs = [20, 205, 390];
  const n2 = (v: number) => pretty(fmtNum(v, 2));
  const check = (x: number) => `x = ${x}:  ${sumText([cx(Number(SQUARE8_PARTS[0][x].toFixed(2))), cx(Number(SQUARE8_PARTS[1][x].toFixed(2)))], 2)} = ${n2(SQUARE8[x])}`;
  return (
    <Svg>
      {parts.map((values, i) => {
        const box: PlotBox = { x: xs[i], y: 78, w: 150, h: 124, domain: [-0.5, 7.5], range: [-1.45, 1.45] };
        return (
          <g key={i}>
            <Text x={xs[i] + 75} y={48} text={titles[i]} tone="heading" size={12} d={i * 500} />
            {i === 0 ? (
              <Curve box={box} points={[[-0.5, 1], [3.5, 1], [3.5, -1], [7.5, -1]]} tone="faint" dashed width={1.4} d={0} />
            ) : (
              <Curve box={box} fn={wave(i === 1 ? 1 : 3)} samples={120} tone="faint" width={1.4} d={i * 500} dur={600} />
            )}
            <Stems box={box} values={values} tone={i === 0 ? "gold" : "slate"} line={i === 0 ? "gold" : "slate"} d={i * 500} stagger={45} />
          </g>
        );
      })}
      <Text x={187} y={140} text="=" size={20} tone="muted" d={450} />
      <Text x={372} y={140} text="+" size={20} tone="muted" d={950} />
      <Text x={280} y={232} text={check(1)} size={11.5} mono tone="gold" d={1600} />
      <Text x={280} y={256} text={check(4)} size={11.5} mono tone="gold" d={1800} />
    </Svg>
  );
}

function Omega() {
  const box: PlotBox = { x: 36, y: 44, w: 222, h: 222, domain: [-1.5, 1.5], range: [-1.5, 1.5] };
  const powers = [0, 1, 2, 3].map((k) => omegaPow(4, k));
  // ω^0 and ω^3 outside the circle, ω^1 and ω^2 inside it, clear of the clockwise arcs.
  const place = [
    { dx: 8, dy: -13, anchor: "start" as const },
    { dx: -10, dy: -13, anchor: "end" as const },
    { dx: 10, dy: -13, anchor: "start" as const },
    { dx: 8, dy: -13, anchor: "start" as const },
  ];
  return (
    <Svg>
      <Plane box={box} unit d={0} />
      {[0, 1, 2].map((k) => {
        const a0 = (-k * Math.PI) / 2 - 0.18;
        const a1 = (-(k + 1) * Math.PI) / 2 + 0.18;
        return <Arrow key={k} pts={arc(0, 0, 1.22, a0, a1, 12).map(([x, y]) => plotAt(box, x, y))} tone="muted" d={700 + k * 400} dur={350} />;
      })}
      {powers.map((w, k) => {
        const [x, y] = plotAt(box, w.re, w.im);
        return (
          <g key={k}>
            <Dot x={x} y={y} r={5.5} tone={powerTone(w)} d={500 + k * 400} />
            <Text x={x + place[k].dx} y={y + place[k].dy} text={`ω^${k} = ${tightC(w)}`} anchor={place[k].anchor} size={12} mono tone={powerTone(w)} d={550 + k * 400} />
          </g>
        );
      })}
      <Text x={296} y={64} text="ω = exp(−2πi/N)" anchor="start" size={12.5} mono tone="heading" d={0} />
      <Text x={296} y={96} text="N = 4:  ω = exp(−πi/2)" anchor="start" size={12} mono tone="text" d={300} />
      <Text x={296} y={120} text="= cos(−π/2) + i sin(−π/2)" anchor="start" size={12} mono tone="text" d={400} />
      <Text x={296} y={144} text="= −i" anchor="start" size={13} mono tone="gold" d={500} />
      <Text x={296} y={186} text={bi("clockwise, a quarter turn per power", "باتجاه عقارب الساعة، ربع دورة لكل قوة")} anchor="start" size={11} tone="muted" d={1900} />
      <Text x={296} y={232} text="ω^4 = ω^0 = 1,  ω^5 = ω^1, …" anchor="start" size={11.5} mono tone="muted" d={2100} />
    </Svg>
  );
}

function Matrix() {
  const M = WORKED.map((_, m) => WORKED.map((__, n) => omegaPow(4, m * n)));
  const rowD = (r: number) => 300 + r * 260;
  return (
    <Svg>
      <Text x={184} y={50} text="ω^(mn), N = 4" size={10.5} mono tone="muted" d={0} />
      <Text x={310} y={50} text="f" size={11} mono tone="muted" d={0} />
      <Text x={440} y={50} text="row · f" size={10.5} mono tone="muted" d={0} />
      <Text x={94} y={130} text="F = 1/4 ·" anchor="end" size={13} mono tone="heading" d={0} />
      {M.map((row, r) => (
        <CGrid key={r} x={100} y={66 + r * 32} cells={[row.map((w) => tightC(w))]} cw={42} ch={32} size={12} tone={(_, c) => (powerTone(row[c]) === "gold" ? "outline" : powerTone(row[c]))} d={rowD(r)} />
      ))}
      <Text x={281} y={130} text="·" size={16} mono tone="heading" d={100} />
      <CGrid x={292} y={66} cells={WORKED.map((v) => [String(v)])} cw={36} ch={32} size={12} tone={() => "navy"} d={150} stagger={60} />
      <Text x={336} y={130} text="= 1/4 ·" anchor="start" size={13} mono tone="heading" d={200} />
      {WORKED_SUMS.map((s, r) => (
        <CGrid key={r} x={398} y={66 + r * 32} cells={[[tightC(s)]]} cw={90} ch={32} size={12} tone={() => "gold"} d={rowD(r) + 180} />
      ))}
      <Text x={280} y={226} text={`F = [${WORKED_F.map((c) => showC(c)).join(", ")}]`} size={12.5} mono tone="gold" d={1500} />
      <Text x={280} y={252} text={bi("each row of the matrix times f gives one coefficient", "كل صف من المصفوفة مضروبًا في f يعطي معاملًا واحدًا")} size={11} tone="muted" d={1700} />
    </Svg>
  );
}

/** Head-to-tail arrows of `terms` in a plane fitted to their path; terms on the real line get their own lanes. */
function Chain({ terms, tones, area, d = 0, endLabel, labels = true }: { terms: readonly C[]; tones: readonly LineTone[]; area: { x: number; y: number; w: number; h: number }; d?: number; endLabel: string; labels?: boolean }) {
  const collinear = terms.every((t) => t.im === 0);
  const lane = (i: number) => (collinear ? 0.55 * (i + 1) * (Math.max(...terms.map((t) => Math.abs(t.re))) / 3) : 0);
  const starts: C[] = [];
  let at = cx(0);
  for (const t of terms) {
    starts.push(at);
    at = add(at, t);
  }
  const end = at;
  // Label the end on the side the last arrow does not come from.
  const last = terms[terms.length - 1];
  const above = end.im !== 0 ? end.im > 0 : last.im >= 0;
  const xs = [0, ...starts.map((s) => s.re), end.re];
  const ys = [0, ...starts.map((s, i) => s.im + lane(i)), end.im, ...(collinear ? [lane(terms.length - 1)] : [])];
  const pad = 0.6;
  // Extra room on the right keeps an end label clear of the axis's "Re".
  const box = fitBox(area, Math.min(...xs) - pad, Math.max(...xs) + pad + 0.5, Math.min(...ys) - pad, Math.max(...ys) + pad);
  return (
    <>
      <Plane box={box} d={d} />
      {terms.map((t, i) => {
        const a: [number, number] = [starts[i].re, starts[i].im + lane(i)];
        const b: [number, number] = [starts[i].re + t.re, starts[i].im + t.im + lane(i)];
        const p = plotAt(box, a[0], a[1]);
        const q = plotAt(box, b[0], b[1]);
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
        const nx = -(q[1] - p[1]) / len;
        const ny = (q[0] - p[0]) / len;
        const mid: [number, number] = [p[0] + (q[0] - p[0]) * 0.4 + nx * 11, p[1] + (q[1] - p[1]) * 0.4 + ny * 11];
        return (
          <g key={i}>
            {collinear && i > 0 ? <Seg box={box} a={[starts[i].re, lane(i - 1)]} b={a} tone="faint" head={false} dashed d={d + 300 + i * 380} /> : null}
            <Seg box={box} a={a} b={b} tone={tones[i]} width={2.4} d={d + 300 + i * 380} dur={340} />
            {labels ? <Text x={mid[0]} y={mid[1]} text={tightC(t)} size={10.5} mono tone="heading" d={d + 450 + i * 380} /> : null}
          </g>
        );
      })}
      <Seg box={box} a={[0, 0]} b={[end.re, end.im]} tone="gold" dashed d={d + 300 + terms.length * 380} />
      {(() => {
        const [x, y] = plotAt(box, end.re, end.im);
        return (
          <>
            <Dot x={x} y={y} r={4.5} tone="gold" d={d + 400 + terms.length * 380} />
            <Text x={x} y={y + (above ? -14 : 15)} text={endLabel} size={11} mono tone="gold" d={d + 450 + terms.length * 380} />
          </>
        );
      })()}
    </>
  );
}

const textTone = (w: C) => powerTone(w);

/** ω^(−k), written plainly: ω^0 for no turn, ω^(−u) rather than ω^(−1u). */
const back = (k: number, unit = "") => (k === 0 ? "ω^0" : `ω^(−${k === 1 && unit ? "" : k}${unit})`);

function Terms({ control }: { control: string }) {
  const u = Number(control) || 0;
  const terms = dftTerms(WORKED, u);
  const powers = WORKED.map((_, x) => omegaPow(4, x * u));
  return (
    <Svg>
      <Text x={22} y={40} text={bi(`row ${u} of the matrix times f`, `الصف ${u} من المصفوفة مضروبًا في f`)} anchor="start" size={11} tone="muted" d={0} />
      {terms.map((t, x) => (
        <Text key={x} x={22} y={78 + x * 27} text={`${WORKED[x]}·ω^${x * u} = ${WORKED[x]}·(${tightC(powers[x])}) = ${tightC(t)}`} anchor="start" size={11.5} mono tone={textTone(powers[x])} d={300 + x * 380} />
      ))}
      <Arrow pts={[[22, 176], [214, 176]]} tone="faint" head={false} d={1800} dur={300} />
      <Text x={22} y={196} text={`Σ = ${showC(WORKED_SUMS[u])}`} anchor="start" size={12} mono tone="heading" d={1900} />
      <Text x={22} y={224} text={`F${u} = Σ/4 = ${showC(WORKED_F[u])}`} anchor="start" size={12.5} mono tone="gold" d={2100} />
      <Chain terms={terms} tones={powers.map(powerTone)} area={{ x: 244, y: 40, w: 300, h: 220 }} endLabel={`Σ = ${tightC(WORKED_SUMS[u])}`} />
    </Svg>
  );
}

function Inverse({ control }: { control: string }) {
  const x = Number(control) || 0;
  const terms = idftTerms(WORKED_F, x);
  const powers = WORKED_F.map((_, u) => omegaPow(4, x * u, 1));
  const f = idft(WORKED_F).map((v) => v.re);
  return (
    <Svg>
      <Text
        x={22}
        y={40}
        text={x === 0 ? bi("sample 0: nothing turns, just add the F_u", "العينة 0: لا يدور شيء، اجمع F_u فقط") : bi(`sample ${x}: each F_u turned back by ${back(x, "u")}`, `العينة ${x}: كل F_u مُدار عكسيًا بمقدار ${back(x, "u")}`)}
        anchor="start"
        size={11}
        tone="muted"
        d={0}
      />
      {terms.map((t, u) => (
        <Text key={u} x={22} y={74 + u * 25} text={`F${u}·${back(x * u)} = ${tightC(t)}`} anchor="start" size={11.5} mono tone={textTone(powers[u])} d={300 + u * 380} />
      ))}
      <Text x={22} y={178} text={`f${x} = Σ = ${fmtNum(f[x])}`} anchor="start" size={12.5} mono tone="gold" d={1900} />
      <Bars x={40} y={196} w={150} h={50} values={f} labels={f.map((_, i) => `f${i}`)} max={4} d={2000} barTone={(i) => (i === x ? "gold" : "muted")} />
      <Chain terms={terms} tones={powers.map(powerTone)} area={{ x: 244, y: 40, w: 300, h: 220 }} endLabel={`f${x} = ${fmtNum(f[x])}`} labels={false} />
    </Svg>
  );
}

function Fft({ control }: { control: string }) {
  if (control === "speed") {
    const ops = dftOps(1024);
    const ratio = Math.round(ops.direct / ops.fft);
    const comma = (n: number) => n.toLocaleString("en-US");
    return (
      <Svg>
        <Text x={196} y={30} text={bi("operations for one DFT of N = 1024 samples", "عدد العمليات لتحويل DFT واحد من N = 1024 عينة")} tone="heading" size={12} d={0} />
        <Bars x={86} y={72} w={220} h={150} values={[ops.direct, ops.fft]} labels={["N²", "N log₂N"]} max={ops.direct} gap={0.45} d={200} barTone={(i) => (i === 0 ? "danger" : "success")} />
        <Text x={378} y={104} text={`N² = ${comma(ops.direct)}`} anchor="start" size={12} mono tone="danger" d={600} />
        <Text x={378} y={134} text={`N log₂N = ${comma(ops.fft)}`} anchor="start" size={12} mono tone="success" d={800} />
        <Text x={378} y={178} text={bi(`${ratio} times fewer`, `أقل بـ ${ratio} مرة`)} anchor="start" size={12.5} tone="gold" d={1100} />
        <Text x={378} y={222} text={bi("same result, exactly", "النتيجة نفسها تمامًا")} anchor="start" size={11} tone="muted" d={1300} />
      </Svg>
    );
  }
  const scaled = WORKED_F;
  const matlab = dft(WORKED, "matlab");
  return (
    <Svg>
      <Text x={112} y={78} text={bi("lecture F", "F في المحاضرة")} anchor="end" size={11.5} tone="heading" d={0} />
      <CGrid x={124} y={64} cells={[scaled.map((c) => tightC(c))]} cw={100} ch={30} size={11.5} d={100} />
      <Arrow pts={[[324, 98], [324, 124]]} tone="gold" d={500} dur={250} label="× N = 4" labelAt={[372, 111]} />
      <Text x={112} y={140} text="fft([1 2 3 4])" anchor="end" size={11} mono tone="heading" d={600} />
      <CGrid x={124} y={126} cells={[matlab.map((c) => tightC(c))]} cw={100} ch={30} size={11.5} tone={() => "gold"} d={700} />
      <Arrow pts={[[24, 176], [536, 176]]} tone="faint" head={false} d={1000} dur={300} />
      <Text x={24} y={198} text={`b = fft(1:9):  b(1) = ${fmtC(MATLAB_B[0])} = 1 + 2 + … + 9`} anchor="start" size={11.5} mono tone="text" d={1100} />
      <Text x={24} y={222} text={`b(2) = ${pretty(fmtC(MATLAB_B[1], 2, true))}, …    ifft(b) → 1 2 3 4 5 6 7 8 9`} anchor="start" size={11.5} mono tone="text" d={1300} />
      <Text x={24} y={250} text={bi("fft does not divide by N; ifft does, so the round trip is exact", "لا تقسم fft على N، أما ifft فتقسم عليه، لذا تكون رحلة الذهاب والعودة دقيقة")} anchor="start" size={11} tone="muted" d={1500} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof dftWalk>>({
  samples: Samples,
  omega: Omega,
  matrix: Matrix,
  terms: Terms,
  inverse: Inverse,
  fft: Fft,
});

