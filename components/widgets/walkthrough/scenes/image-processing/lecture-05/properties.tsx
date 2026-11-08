"use client";

import type { properties } from "@/lib/walkthroughs/image-processing/lecture-05";
import {
  abs,
  circTerms,
  CONV_LIN,
  CONV_X,
  CONV_Y,
  CONV_Z,
  dft,
  fmtList,
  LIN_COMBINED,
  LIN_G,
  LIN_H,
  LIN_HF,
  LIN_P,
  LIN_Q,
  pretty,
  SHIFT_X,
  SHIFT_X1,
  SHIFT_X1F,
  SHIFT_XF,
  showC,
  THEOREM_X,
  THEOREM_Y,
  THEOREM_Z,
  tightC,
  WORKED,
  WORKED_F,
} from "@/lib/widgets/ip-lecture-05";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Fade, In, Mark, Svg, Text, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { CGrid } from "./local";

const list = (xs: readonly number[]) => pretty(fmtList(xs));
const clist = (cs: Parameters<typeof tightC>[0][]) => `[${cs.map((c) => tightC(c)).join(", ")}]`;

function Linearity() {
  const G = dft(LIN_G);
  const rows = [
    { label: "f", sig: WORKED, spec: WORKED_F },
    { label: "g", sig: LIN_G, spec: G },
    { label: `h = ${LIN_P}f + ${LIN_Q === 1 ? "" : LIN_Q}g`, sig: LIN_H, spec: LIN_HF },
  ];
  return (
    <Svg>
      <Text x={198} y={30} text={bi("signal", "الإشارة")} tone="heading" size={12} d={0} />
      <Text x={412} y={30} text="DFT" tone="heading" size={12} d={0} />
      {rows.map((r, i) => (
        <g key={i}>
          <Text x={120} y={74 + i * 36} text={r.label} anchor="end" size={12} mono tone="heading" d={i * 450} />
          <CGrid x={130} y={60 + i * 36} cells={[r.sig.map(String)]} cw={34} ch={28} size={11.5} tone={() => (i === 2 ? "navy" : "outline")} d={i * 450} />
          <CGrid x={284} y={60 + i * 36} cells={[r.spec.map((c) => tightC(c))]} cw={64} ch={28} size={10.5} tone={() => (i === 2 ? "gold" : "outline")} d={150 + i * 450} />
        </g>
      ))}
      <Arrow pts={[[24, 176], [540, 176]]} tone="faint" head={false} d={1400} dur={300} />
      <Text x={120} y={202} text={`${LIN_P}F + ${LIN_Q === 1 ? "" : LIN_Q}G`} anchor="end" size={12} mono tone="heading" d={1500} />
      <CGrid x={284} y={188} cells={[LIN_COMBINED.map((c) => tightC(c))]} cw={64} ch={28} size={10.5} tone={() => "gold"} d={1600} />
      <Mark x={266} y={202} ok d={2000} />
      <Text x={198} y={202} text={bi("the same", "النتيجة نفسها")} size={11} tone="success" d={2000} />
      <Text x={280} y={248} text={`H = pF + qG   (p = ${LIN_P}, q = ${LIN_Q})`} size={12.5} mono tone="gold" d={2200} />
    </Svg>
  );
}

function Shifting({ control }: { control: string }) {
  const swapped = control === "x1";
  const sig = swapped ? SHIFT_X1 : SHIFT_X;
  const X = swapped ? SHIFT_X1F : SHIFT_XF;
  const mags = X.map(abs);
  const origin = (i: number) => (swapped ? (i + 4) % 8 : i);
  return (
    <Svg>
      <Text x={96} y={64} text={swapped ? "(−1)^n·x" : "x"} anchor="end" size={12} mono tone="heading" d={0} />
      <CGrid x={104} y={50} cells={[sig.map((v) => pretty(String(v)))]} cw={44} ch={28} size={12} tone={(_, c) => (sig[c] < 0 ? "danger" : "outline")} d={0} />
      <Arrow pts={[[280, 82], [280, 104]]} tone="gold" d={500} dur={200} label="fft" labelAt={[300, 93]} />
      <Bars x={70} y={116} w={420} h={96} values={mags} labels={mags.map((_, k) => `X${k}`)} max={36} showValues d={700} barTone={(i) => (origin(i) < 4 ? "gold" : "slate")} />
      <Chip x={170} y={256} text={bi("left half of fft(x)", "النصف الأيسر من fft(x)")} tone="gold" center d={1400} />
      <Chip x={390} y={256} text={bi("right half of fft(x)", "النصف الأيمن من fft(x)")} tone="slate" center d={1500} />
    </Svg>
  );
}

function Conjugate({ control }: { control: string }) {
  const k = Number(control) || 1;
  const m = 8 - k;
  const mags = SHIFT_XF.map(abs);
  const bars = { x: 60, y: 138, w: 440, h: 80 };
  const slot = bars.w / 8;
  const top = (i: number): Pt => [bars.x + i * slot + slot / 2, bars.y + bars.h - (mags[i] / 36) * bars.h - 5];
  return (
    <Svg>
      <Box x={22} y={48} w={204} h={40} label={`X${k} = ${showC(SHIFT_XF[k])}`} tone="gold" mono size={12} d={0} />
      <Box x={334} y={48} w={204} h={40} label={`X${m} = ${showC(SHIFT_XF[m])}`} tone="gold" mono size={12} d={300} />
      <Text x={280} y={60} text="↔" size={18} tone="gold" d={500} />
      <Text x={280} y={82} text={bi("conjugates", "مترافقان")} size={11} tone="heading" d={500} />
      <Arrow pts={[[124, 90], top(k)]} tone="gold" dashed d={700} />
      <Arrow pts={[[436, 90], top(m)]} tone="gold" dashed d={800} />
      <Bars x={bars.x} y={bars.y} w={bars.w} h={bars.h} values={mags} labels={mags.map((_, i) => `X${i}`)} max={36} d={200} barTone={(i) => (i === k || i === m ? "gold" : i === 0 || i === 4 ? "navy" : "muted")} />
      <Chip
        x={280}
        y={258}
        text={bi(`X0 = ${SHIFT_XF[0].re} and X4 = ${SHIFT_XF[4].re} are real: each is its own mirror`, `X0 = ${SHIFT_XF[0].re} و X4 = ${SHIFT_XF[4].re} حقيقيان: كلٌّ منهما مرآة نفسه`)}
        tone="navy"
        center
        d={1200}
      />
    </Svg>
  );
}

function WrapIndex({ control }: { control: string }) {
  const k = Number(control) || 0;
  const terms = circTerms(CONV_X, CONV_Y, k);
  const cw = 66;
  const x0 = 150;
  const centre = (n: number) => x0 + n * cw + cw / 2;
  const ring = { x: 494, y: 154, r: 36 };
  const angle = (j: number) => -Math.PI / 2 + (j * Math.PI) / 2;
  const at = (j: number, r: number): Pt => [ring.x + r * Math.cos(angle(j)), ring.y + r * Math.sin(angle(j))];
  const sweep = Array.from({ length: 13 }, (_, i) => {
    const a = angle(k) - 0.35 - (i / 12) * (Math.PI * 1.5 - 0.3);
    return [ring.x + 19 * Math.cos(a), ring.y + 19 * Math.sin(a)] as Pt;
  });
  return (
    <Svg>
      {terms.map((t) => (
        <Text key={t.n} x={centre(t.n)} y={50} text={`n = ${t.n}`} size={10.5} mono tone="muted" d={0} />
      ))}
      <Text x={140} y={77} text="x_n" anchor="end" size={12} mono tone="heading" d={0} />
      <CGrid x={x0} y={62} cells={[CONV_X.map(String)]} cw={cw} ch={30} size={12} tone={() => "navy"} d={0} />
      <Text x={140} y={137} text="y_(k−n)" anchor="end" size={12} mono tone="heading" d={300} />
      {terms.map((t) => (
        <Text key={t.n} x={centre(t.n)} y={110} text={k - t.n >= 0 ? `y${k - t.n}` : `y${pretty(String(k - t.n))} = y${t.m}`} size={10.5} mono tone={k - t.n >= 0 ? "slate" : "gold"} d={300 + t.n * 200} />
      ))}
      <CGrid x={x0} y={122} cells={[terms.map((t) => String(CONV_Y[t.m]))]} cw={cw} ch={30} size={12} tone={(_, c) => (k - c < 0 ? "warn" : "slate")} d={300} />
      <Text x={140} y={191} text="x_n·y_(k−n)" anchor="end" size={11} mono tone="heading" d={1200} />
      <CGrid x={x0} y={176} cells={[terms.map((t) => String(t.value))]} cw={cw} ch={30} size={12} tone={() => "gold"} d={1200} />
      <Text x={282} y={238} text={`z${k} = ${terms.map((t) => t.value).join(" + ")} = ${CONV_Z[k]}`} size={13} mono tone="gold" d={1700} />
      <Text x={ring.x} y={50} text={bi("y, read backwards", "y تُقرأ عكسيًا")} size={10.5} tone="muted" d={600} />
      {CONV_Y.map((v, j) => {
        const [bx, by] = at(j, ring.r);
        const [lx, ly] = at(j, ring.r + 19);
        return (
          <In key={j} d={600 + j * 80}>
            <Box x={bx - 13} y={by - 11} w={26} h={22} r={6} label={String(v)} tone={j === k ? "gold" : "outline"} mono size={11} />
            <Text x={lx} y={ly} text={`y${j}`} size={10} mono tone="muted" />
          </In>
        );
      })}
      <Fade d={1000}>
        <Arrow pts={sweep} tone="gold" d={0} dur={500} />
      </Fade>
    </Svg>
  );
}

function LinearCircular({ control }: { control: string }) {
  const circular = control === "circular";
  const N = CONV_X.length;
  const max = 70;
  const area = { y: 84, h: 130 };
  const slot = 62;
  const x0 = 46;
  const barW = 40;
  const bx = (i: number) => x0 + i * slot + (slot - barW) / 2;
  const cxOf = (i: number) => x0 + i * slot + slot / 2;
  const hOf = (v: number) => (v / max) * area.h;
  const base = area.y + area.h;
  if (!circular) {
    return (
      <Svg>
        <Text x={cxOf(1.5)} y={50} text={bi(`inside N = ${N}`, `داخل N = ${N}`)} size={11} tone="gold" d={0} />
        <Text x={cxOf(5)} y={50} text={bi(`past the end of N = ${N}`, `بعد نهاية N = ${N}`)} size={11} tone="slate" d={0} />
        <Bars x={x0} y={area.y} w={slot * CONV_LIN.length} h={area.h} values={CONV_LIN} labels={CONV_LIN.map((_, i) => `u${i}`)} max={max} showValues gap={1 - barW / slot} d={200} barTone={(i) => (i >= N ? "slate" : "gold")} />
        <Arrow pts={[[x0 + N * slot, 66], [x0 + N * slot, 222]]} tone="gold" head={false} dashed d={1000} />
        <Text x={280} y={250} text={`p(u)·q(u) → ${list(CONV_LIN)}`} size={12} mono tone="heading" d={1200} />
      </Svg>
    );
  }
  const folds = CONV_Z.map((_, i) => (i + N < CONV_LIN.length ? `${CONV_LIN[i]} + ${CONV_LIN[i + N]}` : `${CONV_LIN[i]}`)).join(", ");
  return (
    <Svg>
      <Text x={280} y={22} text={bi("the tail wraps round onto the start", "يلتف الذيل على البداية")} tone="heading" size={12} d={0} />
      <Arrow pts={[[x0 - 4, base], [x0 + slot * CONV_LIN.length + 4, base]]} tone="faint" head={false} d={0} dur={300} />
      {CONV_Z.map((z, i) => {
        const own = CONV_LIN[i];
        return (
          <In key={i} d={150 + i * 90}>
            <Box x={bx(i)} y={base - hOf(own)} w={barW} h={hOf(own)} r={3} tone="gold" />
            <Text x={cxOf(i)} y={base + 12} text={`z${i}`} size={10} mono tone="muted" />
          </In>
        );
      })}
      {CONV_LIN.slice(N).map((v, j) => (
        <In key={j} d={150 + (N + j) * 90}>
          <Box x={bx(N + j)} y={base - hOf(v)} w={barW} h={hOf(v)} r={3} tone="ghost" dashed />
          <Text x={cxOf(N + j)} y={base - hOf(v) + 12} text={String(v)} size={10.5} mono tone="slate" />
        </In>
      ))}
      {CONV_LIN.slice(N).map((v, j) => {
        const lane = 48 + j * 8;
        const from = cxOf(N + j) + 6;
        const to = cxOf(j) + 6;
        const stackTop = base - hOf(CONV_Z[j]);
        return (
          <g key={j}>
            <Arrow pts={[[from, base - hOf(v) - 4], [from, lane], [to, lane], [to, stackTop - 18]]} tone="slate" d={900 + j * 450} dur={600} />
            <Fade d={1350 + j * 450}>
              <Box x={bx(j)} y={stackTop} w={barW} h={hOf(v)} r={3} tone="slate" />
            </Fade>
          </g>
        );
      })}
      {CONV_Z.map((z, i) => (
        <Text key={i} x={cxOf(i) - 10} y={base - hOf(z) - 9} text={String(z)} size={10.5} mono tone="heading" d={2400 + i * 80} />
      ))}
      <Text x={280} y={250} text={`${folds} → ${list(CONV_Z)}`} size={12} mono tone="gold" d={2700} />
    </Svg>
  );
}

function Theorem({ control }: { control: string }) {
  const viaConv = control !== "multiply";
  const live = (yes: boolean) => (yes ? "gold" : "faint") as "gold" | "faint";
  const d0 = 300;
  const top = viaConv ? d0 : 2200;
  const bottom = viaConv ? 2200 : d0;
  return (
    <Svg>
      <Box x={14} y={104} w={132} h={32} label={`x = ${list(CONV_X)}`} tone="navy" mono size={11.5} d={0} />
      <Box x={14} y={146} w={132} h={32} label={`y = ${list(CONV_Y)}`} tone="navy" mono size={11.5} d={100} />
      <Arrow pts={[[148, 112], [188, 80]]} tone={live(viaConv)} d={top} />
      <Box x={190} y={46} w={196} h={60} label={`z = ${list(CONV_Z)}`} sub={bi("circular convolution", "الالتفاف الدائري")} tone={viaConv ? "slate" : "muted"} mono size={12} d={top + 300} />
      <Arrow pts={[[388, 80], [428, 116]]} tone={live(viaConv)} d={top + 700} label="fft" labelAt={[420, 88]} />
      <Arrow pts={[[148, 170], [188, 192]]} tone={live(!viaConv)} d={bottom} label="fft" labelAt={[160, 196]} />
      <Box x={190} y={166} w={196} h={30} label={`X = ${clist(THEOREM_X)}`} tone={viaConv ? "muted" : "slate"} mono size={11} d={bottom + 300} />
      <Box x={190} y={200} w={196} h={30} label={`Y = ${clist(THEOREM_Y)}`} tone={viaConv ? "muted" : "slate"} mono size={11} d={bottom + 400} />
      <Text x={288} y={248} text={bi("multiply pair by pair: X·Y", "الضرب زوجًا بزوج: X·Y")} size={10.5} tone={viaConv ? "muted" : "heading"} d={bottom + 500} />
      <Arrow pts={[[388, 198], [428, 168]]} tone={live(!viaConv)} d={bottom + 700} label="X·Y" labelAt={[424, 198]} />
      <Box x={430} y={112} w={124} h={58} label={clist(THEOREM_Z)} sub={bi("Z, both ways", "Z بالطريقين")} tone="gold" mono size={11} d={Math.min(top, bottom) + 1000} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof properties>>({
  linearity: Linearity,
  shifting: Shifting,
  conjugate: Conjugate,
  "wrap-index": WrapIndex,
  "linear-circular": LinearCircular,
  theorem: Theorem,
});
