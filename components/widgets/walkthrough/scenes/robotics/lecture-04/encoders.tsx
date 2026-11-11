"use client";

import type { encoders } from "@/lib/walkthroughs/robotics/lecture-04";
import { CCW, CW, ENCODER_FACTS, GRAY_DEMO, READ_ANGLE, binaryToGray, bitString, countedEdges, grayDemo, positions, sectorOf, slotPitch, trackResolution, type CountMode } from "@/lib/widgets/rob-lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, In, Svg, Text, fmt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import w from "../../../../Walkthrough.module.css";
import { BiTable, Dot, Spin, Stroke, Travel, Wedge, arc, polar, squareWave } from "./local";

/** The disc's body: an opaque base, then a navy face. */
function DiscBody({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} className={w.under} />
      <circle cx={cx} cy={cy} r={r} className={`${w.shape} ${w.navy}`} />
    </>
  );
}

function Hub({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={15} className={`${w.shape} ${w.outline}`} />
      <circle cx={cx} cy={cy} r={5} style={{ fill: "var(--heading)" }} />
    </>
  );
}

// ---------- Slots and pulses ----------
const SLOTS = 60;
const TURN = 5 * slotPitch(SLOTS);

function SlottedDisc() {
  const [cx, cy, r] = [112, 140, 96];
  const levels = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
  const x0 = 254;
  const half = 27;
  const go = 700;
  const dur = 2600;
  return (
    <Svg>
      <In d={0}>
        <DiscBody cx={cx} cy={cy} r={r} />
      </In>
      <Spin cx={cx} cy={cy} deg={TURN} d={go} dur={dur}>
        <Fade d={100}>
          {Array.from({ length: SLOTS }, (_, k) => {
            const [a, b] = [polar(cx, cy, 74, k * 6), polar(cx, cy, 90, k * 6)];
            return <path key={k} d={`M${a[0].toFixed(1)},${a[1].toFixed(1)} L${b[0].toFixed(1)},${b[1].toFixed(1)}`} style={{ stroke: "var(--gold)", strokeWidth: 4.2 }} />;
          })}
          <Stroke pts={[polar(cx, cy, 20, -90), polar(cx, cy, 66, -90)]} tone="gold" width={3} />
        </Fade>
      </Spin>
      <In d={150}>
        <Hub cx={cx} cy={cy} />
      </In>
      <Fade d={300}>
        <rect x={cx + 70} y={cy - 8} width={24} height={16} rx={2} style={{ fill: "none", stroke: "var(--heading)", strokeWidth: 2 }} />
      </Fade>
      <Arrow pts={arc(cx, cy, 106, -90, -90 + TURN, 10)} tone="gold" d={go} dur={dur} />
      <Text x={polar(cx, cy, 121, -72)[0]} y={polar(cx, cy, 121, -72)[1]} text={`${TURN}°`} size={12} mono tone="gold" d={go + dur} />
      <Fade d={400}>
        <path d={`M${cx + 84},${cy - 9} L${cx + 112},${cy - 76}`} className={`${w.line} ${w.faint}`} style={{ strokeWidth: 1.2 }} />
      </Fade>
      <Text x={cx + 114} y={cy - 92} text={bi("LED behind, photodiode in front", "LED خلف القرص والثنائي الضوئي أمامه")} anchor="start" size={11} tone="muted" d={400} />
      <Arrow pts={[[cx + 98, cy], [x0 - 6, cy]]} tone="gold" d={go - 200} dur={300} />
      <Text x={390} y={92} text={bi("photodiode output", "خرج الثنائي الضوئي")} size={11.5} tone="heading" d={500} />
      <Arrow pts={squareWave(levels, x0, half, 152, 122, half / 2)} tone="navy" head={false} d={go} dur={dur} width={2.2} />
      {[0, 1, 2, 3, 4].map((k) => (
        <Text key={k} x={x0 + half + 2 * half * k} y={168} text={String(k + 1)} mono size={11} tone="gold" d={go + (dur * (2 * k + 1.5)) / 10} />
      ))}
      <Chip x={390} y={208} text={bi(`5 pulses × ${ENCODER_FACTS.slot60}° = ${TURN}°`, `5 نبضات × ${ENCODER_FACTS.slot60}° = ${TURN}°`)} tone="gold" center d={go + dur} />
      <Chip x={390} y={252} text={bi(`360° / ${SLOTS} slots = ${ENCODER_FACTS.slot60}° per pulse`, `360° / ${SLOTS} فتحة = ${ENCODER_FACTS.slot60}° لكل نبضة`)} tone="slate" center d={go + dur + 300} />
    </Svg>
  );
}

// ---------- Direction from A and B ----------
const QSLOTS = 12;
const P = slotPitch(QSLOTS);

function Quadrature({ control }: { control: string }) {
  const cw = control !== "ccw";
  const [cx, cy] = [112, 152];
  const seq = cw ? CW : CCW;
  const states = Array.from({ length: 9 }, (_, i) => seq[i % 4]);
  const a = states.map((s) => Number(s[0]));
  const b = states.map((s) => Number(s[1]));
  const [x0, q] = [250, 34];
  const centre = (i: number) => (i === 0 ? x0 + q / 4 : i === 8 ? x0 + 8 * q - q / 4 : x0 + q * i);
  const rise = cw ? x0 + q / 2 + q : x0 + q / 2;
  const bAtRise = cw ? 104 : 132;
  const detA = polar(cx, cy, 68, -90 + P / 8);
  const detB = polar(cx, cy, 68, -90 - P / 8);
  const go = 500;
  const dur = 3000;
  return (
    <Svg>
      <In d={0}>
        <DiscBody cx={cx} cy={cy} r={88} />
      </In>
      <Spin cx={cx} cy={cy} deg={cw ? 2 * P : -2 * P} d={go} dur={dur}>
        <Fade d={100}>
          {Array.from({ length: QSLOTS }, (_, k) => {
            const a0 = -90 + P / 4 + k * P;
            return <Wedge key={k} cx={cx} cy={cy} r0={56} r1={80} a0={a0} a1={a0 + P / 2} fill="var(--gold)" stroke="var(--gold-text)" />;
          })}
        </Fade>
      </Spin>
      <In d={150}>
        <Hub cx={cx} cy={cy} />
      </In>
      <Fade d={300}>
        <Stroke pts={[detA, [cx + 22, 46]]} tone="faint" width={1.2} />
        <Stroke pts={[detB, [cx - 22, 46]]} tone="faint" width={1.2} />
        <Dot at={detA} r={4} tone="navy" ring />
        <Dot at={detB} r={4} tone="navy" ring />
      </Fade>
      <Text x={cx + 28} y={38} text="A" mono size={13} tone="heading" d={300} />
      <Text x={cx - 28} y={38} text="B" mono size={13} tone="heading" d={300} />
      <Arrow pts={cw ? arc(cx, cy, 98, 20, 70, 8) : arc(cx, cy, 98, 70, 20, 8)} tone="gold" d={go} dur={600} />
      {(["A", "B", "Z"] as const).map((ch, i) => (
        <Text key={ch} x={234} y={[64, 118, 180][i]} text={ch} mono size={13} tone="heading" d={200} />
      ))}
      <Arrow pts={squareWave(a, x0, q, 78, 50, q / 2)} tone="navy" head={false} d={go} dur={dur} width={2.2} />
      <Arrow pts={squareWave(b, x0, q, 132, 104, q / 2)} tone="navy" head={false} d={go} dur={dur} width={2.2} />
      <Arrow pts={[[x0, 190], [x0 + 3.5 * q, 190], [x0 + 3.5 * q, 170], [x0 + 4.5 * q, 170], [x0 + 4.5 * q, 190], [x0 + 8 * q, 190]]} tone="slate" head={false} d={go} dur={dur} width={1.8} />
      {states.map((s, i) => (
        <Text key={i} x={centre(i)} y={150} text={s} mono size={i === 0 || i === 8 ? 9.5 : 10.5} tone="muted" d={go + (dur * i) / 9} />
      ))}
      <Fade d={go + dur * 0.35}>
        <Stroke pts={[[rise, 42], [rise, 140]]} tone="gold" width={1.6} dashed />
        <Dot at={[rise, bAtRise]} r={5} tone="gold" ring />
      </Fade>
      <Chip
        x={386}
        y={244}
        text={cw ? bi("B is high as A rises: clockwise", "B مرتفعة عندما تصعد A: مع عقارب الساعة") : bi("B is low as A rises: counter-clockwise", "B منخفضة عندما تصعد A: عكس عقارب الساعة")}
        tone={cw ? "gold" : "slate"}
        center
        d={go + dur * 0.5}
      />
    </Svg>
  );
}

// ---------- ×1, ×2, ×4 ----------
const EDGES_TEXT = {
  1: bi("rising edges of A", "الحواف الصاعدة لـ A"),
  2: bi("both edges of A", "حافتا A كلتاهما"),
  4: bi("both edges of A and B", "حواف A و B كلها"),
} as const;

function Counting({ control }: { control: string }) {
  const mode = Number(control.slice(1)) as CountMode;
  const states = Array.from({ length: 9 }, (_, i) => CW[i % 4]);
  const a = states.map((s) => Number(s[0]));
  const b = states.map((s) => Number(s[1]));
  const [x0, q] = [40, 38];
  const edges = countedEdges(a, b, mode).sort((m, n) => m.at - n.at || (m.ch < n.ch ? -1 : 1));
  const res = fmt(360 / (500 * mode));
  const formula = mode === 1 ? `360° / 500 = ${res}°` : `360° / (${mode} × 500) = ${res}°`;
  return (
    <Svg>
      <Text x={22} y={68} text="A" mono size={13} tone="heading" d={0} />
      <Text x={22} y={128} text="B" mono size={13} tone="heading" d={0} />
      <Arrow pts={squareWave(a, x0, q, 84, 52)} tone="navy" head={false} d={0} dur={900} width={2.2} />
      <Arrow pts={squareWave(b, x0, q, 144, 112)} tone="navy" head={false} d={0} dur={900} width={2.2} />
      {edges.map((e, k) => {
        const x = x0 + e.at * q;
        const y = e.ch === "A" ? 68 : 128;
        return (
          <Fade key={`${e.at}${e.ch}`} d={1000 + k * 160}>
            <Stroke pts={[[x, 44], [x, 152]]} tone="faint" width={1} dashed />
            <Dot at={[x, y]} r={5} tone="gold" />
            <Text x={x} y={164} text={String(k + 1)} mono size={11} tone="gold" />
          </Fade>
        );
      })}
      <Arrow pts={[[x0, 184], [x0 + 4 * q, 184]]} tone="muted" both d={700} dur={400} />
      <Text x={x0 + 2 * q} y={198} text={bi("one slot pitch", "خطوة فتحة واحدة")} size={11} tone="muted" d={800} />
      <Text x={475} y={62} text={String(mode)} mono size={34} tone="gold" weight={700} d={900} />
      <Text x={475} y={100} text={bi("counts per slot", "عدّات لكل فتحة")} size={12} tone="heading" d={1000} />
      <Text x={475} y={142} text={EDGES_TEXT[mode]} size={11} tone="muted" d={1100} />
      <Text x={280} y={230} text={formula} mono size={13} tone="gold" d={1000 + edges.length * 160} />
      <Text x={280} y={253} text={bi("per count, on a 500-slot disc", "لكل عدّة، في قرص ذي 500 فتحة")} size={11} tone="muted" d={1100 + edges.length * 160} />
    </Svg>
  );
}

// ---------- Absolute disc ----------
function Absolute({ control }: { control: string }) {
  const n = control === "t4" ? 4 : 3;
  const [cx, cy, rIn, rOut] = [124, 144, 26, 100];
  const N = positions(n);
  const S = trackResolution(n);
  const rw = (rOut - rIn) / n;
  const read = sectorOf(READ_ANGLE, n);
  const bits = read.word.split("");
  const lampW = 46;
  const lampsX = 410 - (n * lampW + (n - 1) * 6) / 2;
  const rows = ([[3, ENCODER_FACTS.res3], [4, ENCODER_FACTS.res4], [10, ENCODER_FACTS.res10], [12, ENCODER_FACTS.res12]] as const).map(([t, res]) => [String(t), String(positions(t)), `${t >= 10 ? "≈ " : ""}${res}°`]);
  const stop = 300 + 1600;
  return (
    <Svg>
      <In d={0}>
        <circle cx={cx} cy={cy} r={rOut} className={w.under} />
        {Array.from({ length: N }, (_, s) =>
          Array.from({ length: n }, (_, k) => {
            const on = (s >> (n - 1 - k)) & 1;
            return <Wedge key={`${s}-${k}`} cx={cx} cy={cy} r0={rIn + k * rw} r1={rIn + (k + 1) * rw} a0={-90 + s * S} a1={-90 + (s + 1) * S} fill={on ? "var(--gold)" : "var(--surface)"} />;
          }),
        )}
        <circle cx={cx} cy={cy} r={rIn} className={`${w.shape} ${w.outline}`} />
      </In>
      {Array.from({ length: N }, (_, s) => {
        const [x, y] = polar(cx, cy, rOut + 11, -90 + (s + 0.5) * S);
        return <Text key={s} x={x} y={y} text={String(s)} mono size={10} tone="muted" d={100} />;
      })}
      <Fade d={stop + 100}>
        <path d={`M${polar(cx, cy, rOut, -90 + read.from)} A${rOut},${rOut} 0 0 1 ${polar(cx, cy, rOut, -90 + read.to)} L${polar(cx, cy, rIn, -90 + read.to)} A${rIn},${rIn} 0 0 0 ${polar(cx, cy, rIn, -90 + read.from)} Z`} style={{ fill: "none", stroke: "var(--heading)", strokeWidth: 3 }} />
      </Fade>
      <Spin cx={cx} cy={cy} deg={READ_ANGLE} d={300} dur={1600}>
        <Fade d={200}>
          <path d={`M${cx},${cy} L${cx},${cy - rOut - 4}`} style={{ stroke: "var(--danger)", strokeWidth: 2.6, strokeLinecap: "round" }} />
          <polygon points={`${cx},${cy - rOut - 8} ${cx - 5},${cy - rOut + 3} ${cx + 5},${cy - rOut + 3}`} style={{ fill: "var(--danger)" }} />
          <circle cx={cx} cy={cy} r={6} style={{ fill: "var(--danger)" }} />
        </Fade>
      </Spin>
      <Text x={410} y={24} text={bi("The detectors read", "تقرأ الكواشف")} size={11.5} tone="heading" d={stop} />
      {bits.map((bit, k) => (
        <Box key={k} x={lampsX + k * (lampW + 6)} y={48} w={lampW} h={28} r={6} label={bit === "1" ? "ON" : "OFF"} tone={bit === "1" ? "gold" : "outline"} size={11} mono d={stop + 100 + k * 120} />
      ))}
      <Chip
        x={410}
        y={104}
        text={bi(`${read.word} = sector ${read.sector}: ${fmt(read.from)}°–${fmt(read.to)}°`, `${read.word} = القطاع ${read.sector}: ${fmt(read.from)}°–${fmt(read.to)}°`)}
        tone="gold"
        center
        d={stop + 200 + n * 120}
      />
      <BiTable
        x={280}
        y={136}
        cols={[bi("Tracks", "المسارات"), bi("Positions", "المواضع"), bi("Resolution", "الاستبانة")]}
        rows={rows}
        cw={[70, 86, 104]}
        rh={22}
        headH={34}
        d={600}
        stagger={110}
        cell={(r) => ((r === 0 && n === 3) || (r === 1 && n === 4) ? "gold" : undefined)}
      />
    </Svg>
  );
}

// ---------- Binary or Gray ----------
function Gray({ control }: { control: string }) {
  const gray = control === "gray";
  const demo = grayDemo();
  const { from, to, bits } = GRAY_DEMO;
  const left = gray ? demo.from.gray : demo.from.binary;
  const right = gray ? demo.to.gray : demo.to.binary;
  const reads = gray ? demo.misread.gray : demo.misread.binary;
  const readSector = gray ? [from, to].find((s) => bitString(binaryToGray(s), bits) === reads) : demo.misread.binaryValue;
  const flips = gray ? demo.flips.gray : demo.flips.binary;
  const rowY = (i: number) => 66 + i * 32;
  const detX = (i: number) => 186 - 14 * i;
  const ok = gray;
  return (
    <Svg>
      <Text x={110} y={36} text={bi(`sector ${from}`, `القطاع ${from}`)} size={11.5} tone="heading" d={0} />
      <Text x={250} y={36} text={bi(`sector ${to}`, `القطاع ${to}`)} size={11.5} tone="heading" d={0} />
      {left.split("").map((bit, i) => (
        <In key={i} d={100 + i * 60}>
          <Text x={24} y={rowY(i) + 16} text={`b${bits - 1 - i}`} mono size={10} tone="muted" />
          <Box x={40} y={rowY(i)} w={140} h={32} r={0} tone={bit === "1" ? "gold" : "outline"} label={bit} mono size={12} />
          <Box x={180} y={rowY(i)} w={140} h={32} r={0} tone={right[i] === "1" ? "gold" : "outline"} label={right[i]} mono size={12} />
        </In>
      ))}
      <Fade d={500}>
        <Stroke pts={[[180, 62], [180, 198]]} tone="navy" width={1.6} dashed />
        {left.split("").map((bit, i) => (bit !== right[i] ? <Stroke key={i} pts={[[180, rowY(i) + 3], [180, rowY(i) + 29]]} tone="danger" width={4} /> : null))}
      </Fade>
      <Text x={110} y={214} text={left} mono size={14} tone="heading" d={400} />
      <Text x={250} y={214} text={right} mono size={14} tone="heading" d={400} />
      <Travel pts={[[-110, 0], [0, 0]]} d={700} dur={1300}>
        <Stroke pts={[[detX(0) + 4, 64], [detX(3) - 4, 196]]} tone="navy" width={1.4} />
        {left.split("").map((_, i) => (
          <Dot key={i} at={[detX(i), rowY(i) + 16]} r={5} tone="navy" ring />
        ))}
      </Travel>
      <Text x={364} y={38} text={bi("reads", "يقرأ")} size={11} tone="heading" d={2000} />
      {reads.split("").map((bit, i) => (
        <Box key={i} x={350} y={rowY(i) + 2} w={28} h={28} r={4} tone={bit === "1" ? "gold" : "outline"} label={bit} mono size={12} d={2100 + i * 100} />
      ))}
      <Box x={420} y={96} w={104} h={36} r={8} tone={ok ? "success" : "danger"} label={reads} mono size={17} d={2600} />
      <Text x={472} y={152} text={bi(`= sector ${readSector}`, `= القطاع ${readSector}`)} size={12} tone={ok ? "success" : "danger"} d={2700} />
      <Text
        x={472}
        y={186}
        text={ok ? bi("a true neighbour", "جار حقيقي") : bi("half a turn away", "على بُعد نصف دورة")}
        size={11}
        tone="muted"
        d={2800}
      />
      <Chip
        x={180}
        y={250}
        text={flips === 1 ? bi("only 1 bit flips", "لا ينقلب إلا بِت واحد") : bi(`${flips} bits flip at once`, `تنقلب ${flips} بتات دفعة واحدة`)}
        tone={ok ? "success" : "danger"}
        center
        d={900}
      />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof encoders>>({
  "slotted-disc": SlottedDisc,
  quadrature: Quadrature,
  counting: Counting,
  absolute: Absolute,
  gray: Gray,
});
