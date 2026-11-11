"use client";

import type { ldr } from "@/lib/walkthroughs/robotics/lecture-03";
import { LDR_K, LIGHTS, R_FIXED, SUPPLY, adc, ldrOut, show, type Across, type Light } from "@/lib/widgets/rob-lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import type { Bi } from "../../../../types";
import { Arrow, Box, Chip, Curve, Fade, In, Svg, Text, plotAt, type PlotBox, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { bi, Ground, Lamp, Meter, Node, Rays, Resistor, Swatch, Wire, polar } from "./local";
import w from "../../../../Walkthrough.module.css";

const LIGHT_NAME: Record<Light, Bi> = { bright: bi("bright", "ساطع"), dim: bi("dim", "خافت"), dark: bi("dark", "مظلم") };
const RAYS: Record<Light, number> = { bright: 5, dim: 2, dark: 0 };
const asLight = (c: string): Light => ((LIGHTS as readonly string[]).includes(c) ? (c as Light) : "bright");

function Resistance({ control }: { control: string }) {
  const light = asLight(control);
  const r = LDR_K[light];
  const axis = { x: 420, top: 60, bottom: 220 };
  const yOf = (k: number) => axis.bottom - ((axis.bottom - axis.top) / 2) * Math.log10(k);
  return (
    <Svg>
      <Text x={90} y={30} text={LIGHT_NAME[light]} tone="heading" size={12} d={0} />
      <Lamp x={90} y={76} r={16} off={light === "dark"} d={0} />
      <Rays x={90} y={76} deg={125} n={RAYS[light]} spread={22} r0={22} r1={100} d={300} />
      <In d={200}>
        <circle cx={210} cy={160} r={28} className={w.under} />
        <circle cx={210} cy={160} r={28} className={`${w.shape} ${w.outline}`} />
      </In>
      <Resistor x={190} y={160} len={40} horizontal d={250} />
      <Wire pts={[[150, 160], [190, 160]]} d={250} dur={200} />
      <Wire pts={[[230, 160], [270, 160]]} d={250} dur={200} />
      <Node x={150} y={160} d={300} />
      <Node x={270} y={160} d={300} />
      <Text x={210} y={206} text={bi("LDR", "مقاومة ضوئية")} size={11.5} tone="heading" d={300} />
      <Text x={440} y={26} text={bi("resistance, log scale", "المقاومة بمقياس لوغاريتمي")} tone="heading" size={11.5} d={400} />
      <Arrow pts={[[axis.x, axis.bottom + 6], [axis.x, axis.top - 12]]} tone="faint" d={400} dur={300} />
      {[1, 10, 100].map((k) => (
        <g key={k}>
          <Arrow pts={[[axis.x - 4, yOf(k)], [axis.x + 4, yOf(k)]]} tone="faint" head={false} d={500} dur={100} />
          <Text x={axis.x - 10} y={yOf(k)} text={`${k} kΩ`} anchor="end" mono size={10.5} tone="muted" d={500} />
        </g>
      ))}
      <Box x={axis.x - 7} y={yOf(r) - 7} w={14} h={14} r={7} tone="gold" d={900} />
      <Chip x={486} y={yOf(r)} text={`R ≈ ${r} kΩ`} tone="gold" center d={1000} />
      <Chip
        x={210}
        y={252}
        text={light === "bright" ? bi("more light → lower resistance", "ضوء أكثر ← مقاومة أقل") : light === "dark" ? bi("darkness → high resistance", "الظلام ← مقاومة عالية") : bi("in between, on a log scale", "في المنتصف على مقياس لوغاريتمي")}
        tone="outline"
        center
        d={1200}
      />
    </Svg>
  );
}

/** The divider column at x: supply, top resistor, the V_out node, bottom resistor and ground. */
function DividerColumn({ x, top, bottom, bottomGold, ldrAt, light, d = 0 }: { x: number; top: Bi | string; bottom: Bi | string; bottomGold?: boolean; ldrAt: "top" | "bottom"; light: Light; d?: number }) {
  const lampY = ldrAt === "top" ? 74 : 168;
  return (
    <>
      <Text x={x} y={24} text={`+${SUPPLY} V`} mono size={12} tone="heading" d={d} />
      <Node x={x} y={36} d={d} />
      <Wire pts={[[x, 36], [x, 46]]} d={d + 50} dur={100} />
      <Resistor x={x} y={46} len={56} label={top} size={11} d={d + 100} />
      <Wire pts={[[x, 102], [x, 140]]} d={d + 300} dur={200} />
      <Node x={x} y={121} tone="gold" d={d + 400} />
      <Wire pts={[[x, 121], [x + 60, 121]]} tone="gold" d={d + 400} dur={250} />
      <Text x={x + 66} y={121} text="V_out" anchor="start" mono size={11.5} tone="gold" d={d + 600} />
      <Resistor x={x} y={140} len={56} label={bottom} labelTone={bottomGold ? "gold" : "heading"} size={11} d={d + 500} />
      <Wire pts={[[x, 196], [x, 212]]} d={d + 700} dur={100} />
      <Ground x={x} y={212} d={d + 750} />
      <Lamp x={x - 62} y={lampY} r={10} off={light === "dark"} d={d + 200} />
      <Rays x={x - 62} y={lampY} deg={90} n={Math.min(RAYS[light], 3)} spread={30} r0={14} r1={44} d={d + 400} />
    </>
  );
}

function Reading({ control }: { control: string }) {
  const light = asLight(control);
  const r = LDR_K[light];
  const v = ldrOut(light);
  const tail: Record<Light, Bi> = {
    bright: bi("small R₂ → low V_out", "R₂ صغيرة ← V_out منخفض"),
    dim: bi("R₂ = R₁ → half the supply", "R₂ = R₁ ← نصف جهد التغذية"),
    dark: bi("large R₂ → high V_out", "R₂ كبيرة ← V_out مرتفع"),
  };
  return (
    <Svg>
      <DividerColumn x={100} top={`R₁ = ${R_FIXED} kΩ`} bottom={bi(`LDR = ${r} kΩ`, `LDR = ${r} kΩ`)} bottomGold ldrAt="bottom" light={light} />
      <Meter x={250} y={50} h={170} w={26} value={v} max={SUPPLY} ticks={[0, SUPPLY / 2, SUPPLY]} d={600} />
      <Text x={263} y={236} text="V_out" mono size={10.5} tone="muted" d={600} />
      <Text x={310} y={56} text={`V_out = ${SUPPLY} · R₂ / (${R_FIXED} + R₂)`} anchor="start" mono size={12} d={900} />
      <Text x={310} y={96} text={`= ${SUPPLY} · ${r} / ${R_FIXED + r}`} anchor="start" mono size={12} d={1200} />
      <Text x={310} y={140} text={`≈ ${show(v)} V`} anchor="start" mono size={20} tone="gold" weight={700} d={1500} />
      <Text x={310} y={186} text={`analogRead ≈ ${adc(v)}`} anchor="start" mono size={12} tone="heading" d={1800} />
      <Chip x={420} y={248} text={tail[light]} tone="outline" center d={2000} />
    </Svg>
  );
}

function Swap({ control }: { control: string }) {
  const across: Across = control === "fixed" ? "fixed" : "ldr";
  const plot: PlotBox = { x: 320, y: 60, w: 190, h: 140, domain: [0, 2], range: [0, 5] };
  const values = LIGHTS.map((l) => ldrOut(l, across));
  const pts = values.map((v, i) => [i, v] as const);
  const fixedLabel = `R₁ = ${R_FIXED} kΩ`;
  const ldrLabel = bi("LDR", "LDR");
  return (
    <Svg>
      <DividerColumn x={90} top={across === "ldr" ? fixedLabel : ldrLabel} bottom={across === "ldr" ? ldrLabel : fixedLabel} bottomGold ldrAt={across === "ldr" ? "bottom" : "top"} light="bright" />
      <Chip x={120} y={252} text={`V_LDR + V_R₁ = ${SUPPLY} V`} tone="outline" center d={900} />
      <Curve box={plot} axes points={pts} tone="gold" yLabel="V_out" d={600} dur={800} />
      {pts.map(([i, v]) => {
        const [px, py] = plotAt(plot, i, v);
        return (
          <g key={i}>
            <Box x={px - 5} y={py - 5} w={10} h={10} r={5} tone="gold" d={1300 + i * 150} />
            <Text x={px + (i === 2 ? -10 : 10)} y={py - (i === 1 ? 14 : 0)} text={show(v)} anchor={i === 2 ? "end" : "start"} mono size={11} tone="heading" d={1400 + i * 150} />
            <Text x={px} y={plot.y + plot.h + 14} text={LIGHT_NAME[LIGHTS[i]]} size={10.5} tone="muted" d={700} />
          </g>
        );
      })}
      <Chip x={415} y={256} text={across === "ldr" ? bi("V_out rises in the dark", "V_out يرتفع في الظلام") : bi("V_out rises with light", "V_out يرتفع مع الضوء")} tone="gold" center d={1900} />
    </Svg>
  );
}

/** A soft fan of view from (x, y) between two bearings (degrees clockwise from up). */
function Cone({ x, y, a0, a1, r = 260, d = 0 }: { x: number; y: number; a0: number; a1: number; r?: number; d?: number }) {
  const n = 12;
  const pts: Pt[] = [[x, y], ...Array.from({ length: n + 1 }, (_, i) => polar(x, y, r, a0 + ((a1 - a0) * i) / n))];
  return (
    <Fade d={d}>
      <path d={`M${pts.map((p) => p.join(",")).join(" L")} Z`} style={{ fill: "var(--gold)", opacity: 0.16 }} />
      <path d={`M${polar(x, y, r, a0).join(",")} L${x},${y} L${polar(x, y, r, a1).join(",")}`} className={`${w.line} ${w.gold} ${w.dashed}`} />
    </Fade>
  );
}

/** A stacked reading bar: parts bottom-up, each a value and a tone. */
function Stack({ x, y, h, max, parts, d = 0 }: { x: number; y: number; h: number; max: number; parts: readonly { v: number; tone: "gold" | "slate" }[]; d?: number }) {
  let base = y + h;
  return (
    <>
      <Box x={x} y={y} w={28} h={h} r={4} tone="muted" d={d} />
      {parts.filter((p) => p.v > 0).map((p, i) => {
        const ph = (p.v / max) * h;
        base -= ph;
        return <Box key={i} x={x + 3} y={base} w={22} h={ph - 2} r={2} tone={p.tone} d={d + 200 + i * 200} />;
      })}
    </>
  );
}

function Shielding({ control }: { control: string }) {
  if (control === "pair") {
    const left: Pt = [240, 166];
    const right: Pt = [300, 166];
    const lamp: Pt = [420, 60];
    return (
      <Svg>
        <Text x={150} y={22} text={bi("top view", "منظر علوي")} size={11} tone="muted" d={0} />
        <Text x={150} y={54} text={bi("room light reaches both cells equally", "ضوء الغرفة يصل إلى الخليتين بالتساوي")} size={11} tone="slate" d={100} />
        <Cone x={left[0]} y={left[1]} a0={-52} a1={-6} r={150} d={300} />
        <Cone x={right[0]} y={right[1]} a0={6} a1={52} r={150} d={300} />
        <Box x={220} y={168} w={100} h={74} r={12} tone="navy" label={bi("robot", "الروبوت")} size={11.5} d={0} />
        <Lamp x={left[0]} y={left[1]} r={6} d={200} />
        <Lamp x={right[0]} y={right[1]} r={6} d={200} />
        <Lamp x={lamp[0]} y={lamp[1]} r={13} d={400} />
        <Text x={442} y={60} text={bi("lamp", "المصباح")} anchor="start" size={11} tone="heading" d={400} />
        <Arrow pts={[[lamp[0] - 10, lamp[1] + 9], [right[0] + 6, right[1] - 6]]} tone="gold" d={800} dur={400} width={2.2} />
        <Arrow pts={[[lamp[0] - 14, lamp[1] + 3], [left[0] + 7, left[1] - 5]]} tone="faint" dashed d={900} />
        <Text x={228} y={150} text="L" mono size={10} tone="heading" d={300} />
        <Text x={312} y={150} text="R" mono size={10} tone="heading" d={300} />
        <Stack x={470} y={86} h={120} max={6} parts={[{ v: 2, tone: "slate" }]} d={1000} />
        <Stack x={510} y={86} h={120} max={6} parts={[{ v: 2, tone: "slate" }, { v: 3, tone: "gold" }]} d={1000} />
        <Text x={484} y={218} text="L" mono size={11} tone="heading" d={1000} />
        <Text x={524} y={218} text="R" mono size={11} tone="heading" d={1000} />
        <Arrow pts={[[270, 160], [276, 130], [292, 108]]} tone="gold" d={1800} dur={400} width={2.6} />
        <Chip x={400} y={252} text={bi("R − L > 0 → turn right", "R − L > 0 ← انعطف يمينًا")} tone="gold" center d={1900} />
      </Svg>
    );
  }
  const tube = control === "tube";
  const ldrPt: Pt = [326, 190];
  const sources: { at: Pt; bearing: number; label: Bi; part: "gold" | "slate" }[] = [
    { at: [480, 196], bearing: 92, label: bi("target lamp", "المصباح المستهدف"), part: "gold" },
    { at: [400, 44], bearing: 26, label: bi("ceiling light", "ضوء السقف"), part: "slate" },
    { at: [534, 92], bearing: 64, label: bi("window", "النافذة"), part: "slate" },
  ];
  const [a0, a1] = tube ? [80, 104] : [8, 172];
  const seen = sources.filter((s) => s.bearing >= a0 && s.bearing <= a1);
  return (
    <Svg>
      <Arrow pts={[[10, 236], [550, 236]]} tone="faint" head={false} d={0} dur={300} />
      <Cone x={ldrPt[0]} y={ldrPt[1]} a0={a0} a1={a1} r={tube ? 230 : 250} d={300} />
      <Box x={200} y={178} w={120} h={46} r={8} tone="navy" label={bi("robot", "الروبوت")} size={11.5} d={0} />
      {[222, 298].map((cx) => (
        <In key={cx} d={50}>
          <circle cx={cx} cy={228} r={8} className={w.under} />
          <circle cx={cx} cy={228} r={8} className={`${w.shape} ${w.slate}`} />
        </In>
      ))}
      {tube ? <Box x={320} y={181} w={26} h={18} r={2} tone="slate" d={150} /> : null}
      <Lamp x={ldrPt[0]} y={ldrPt[1]} r={6} d={200} />
      <Lamp x={480} y={196} r={12} d={100} />
      <Text x={480} y={254} text={sources[0].label} size={10.5} tone="heading" d={150} />
      <Lamp x={400} y={44} r={11} d={100} />
      <Text x={418} y={44} text={sources[1].label} anchor="start" size={10.5} tone="heading" d={150} />
      <Swatch x={528} y={56} w={12} h={72} fill="#9cc9e6" d={100} />
      <Text x={520} y={144} text={sources[2].label} anchor="end" size={10.5} tone="heading" d={150} />
      {sources.map((s, i) => (
        <Arrow key={i} pts={[s.at, [ldrPt[0] + 4, ldrPt[1]]]} tone={seen.includes(s) ? "gold" : "faint"} dashed={!seen.includes(s)} d={700 + i * 150} dur={400} />
      ))}
      <Text x={64} y={38} text={bi("reading", "القراءة")} tone="heading" size={11.5} d={900} />
      <Stack x={50} y={60} h={150} max={8} parts={sources.map((s) => ({ v: seen.includes(s) ? (s.part === "gold" ? 3 : 2) : 0, tone: s.part }))} d={1000} />
      <Chip x={110} y={256} text={tube ? bi("only the lamp it should track", "المصباح المستهدف فقط") : bi("lamp + ceiling + window", "المصباح + السقف + النافذة")} tone={tube ? "success" : "danger"} center d={1600} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof ldr>>({
  resistance: Resistance,
  reading: Reading,
  swap: Swap,
  shielding: Shielding,
});
