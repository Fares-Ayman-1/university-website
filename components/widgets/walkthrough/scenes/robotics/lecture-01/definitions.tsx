"use client";

import type { definitions } from "@/lib/walkthroughs/robotics/lecture-01";
import { BODIES, CANDIDATES, CRITERIA, DEFINITIONS, FLEET, REQUIRES, meets, robotCount, type Body, type Criterion } from "@/lib/widgets/rob-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Svg, Text } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { ArmIcon, ProstheticIcon, TeleopIcon } from "./local";
import w from "../../../../Walkthrough.module.css";

const bodyOf = (control: string): Body => (BODIES as readonly string[]).includes(control) ? (control as Body) : "ria";

/* ---------- Side by side ---------- */

const TX = 252;
const LABEL_W = 132;
const COL_W = 56;
const HEAD_H = 32;
const ROW_H = 40;
const TY = 28;

function Compare({ control }: { control: string }) {
  const body = bodyOf(control);
  const def = DEFINITIONS[body];
  const col = BODIES.indexOf(body);
  const colX = (i: number) => TX + LABEL_W + i * COL_W;
  return (
    <Svg>
      <Box x={12} y={TY} w={222} h={HEAD_H + ROW_H * CRITERIA.length} r={12} tone="outline" d={0} />
      <Text x={123} y={TY + 22} text={def.abbr} mono size={17} tone="gold" d={100} />
      <Text x={123} y={TY + 44} text={def.name} size={10.5} tone="muted" d={150} />
      {def.phrases.map((p, i) => (
        <Chip key={`${body}-${i}`} x={123} y={TY + 80 + i * 42} w={204} text={p} tone={body === "raa" && i === 0 ? "gold" : "slate"} size={11} center d={300 + i * 200} />
      ))}
      {BODIES.map((b, i) => (
        <Box key={b} x={colX(i)} y={TY} w={COL_W} h={HEAD_H} r={0} label={DEFINITIONS[b].abbr} tone={b === body ? "gold" : "navy"} mono size={12} d={200} />
      ))}
      <Text x={TX + LABEL_W - 8} y={TY + 6} text={bi("its wording says…", "نصّه يذكر…")} anchor="end" size={11} tone="muted" d={200} />
      {CRITERIA.map((c, r) => {
        const y = TY + HEAD_H + r * ROW_H;
        return (
          <g key={c.id}>
            <Box x={TX} y={y} w={LABEL_W} h={ROW_H} r={0} label={c.label} tone="outline" size={11} d={400 + r * 120} />
            {BODIES.map((b, i) => (
              <g key={b}>
                <Box x={colX(i)} y={y} w={COL_W} h={ROW_H} r={0} tone="outline" d={400 + r * 120} />
                {REQUIRES[b][c.id as Criterion] ? <Mark x={colX(i) + COL_W / 2} y={y + ROW_H / 2} ok r={9} d={600 + r * 120} /> : <Text x={colX(i) + COL_W / 2} y={y + ROW_H / 2} text="—" size={13} tone="muted" d={600 + r * 120} />}
              </g>
            ))}
          </g>
        );
      })}
      <Fade d={1300}>
        <rect x={colX(col) + 1} y={TY + 1} width={COL_W - 2} height={HEAD_H + ROW_H * CRITERIA.length - 2} className={`${w.line} ${w.gold}`} style={{ strokeWidth: 2.6 }} />
      </Fade>
    </Svg>
  );
}

/* ---------- RIA's four ideas ---------- */

const IDEAS: readonly { idea: Bi; out: Bi; example: Bi }[] = [
  { idea: bi("re-programmable", "قابلة لإعادة البرمجة"), out: bi("fixed by mechanism", "سلوك تحدّده الآلية"), example: bi("a cam-driven machine", "آلة تقودها الكامات") },
  { idea: bi("multifunctional", "متعددة الوظائف"), out: bi("one operation only", "عملية واحدة فقط"), example: bi("a dedicated machine", "آلة مخصّصة") },
  { idea: bi("manipulator", "ذراع آلية"), out: bi("no arm", "بلا ذراع"), example: bi("a mobile robot", "روبوت متنقّل") },
  { idea: bi("programmed motion", "حركة مبرمجة"), out: bi("path in hardware", "مسار في العتاد"), example: bi("set by cams and stops", "تحدّده الكامات والمصدّات") },
];

function FourWords() {
  const cx = (i: number) => 72 + i * 138;
  return (
    <Svg>
      <Text x={280} y={18} text={bi("RIA: a robot must be…", "RIA: يجب أن يكون الروبوت…")} tone="heading" size={12} d={0} />
      {IDEAS.map((it, i) => (
        <g key={i}>
          <Chip x={cx(i)} y={66} w={126} text={it.idea} tone="gold" size={11} center d={150 + i * 250} />
          <Arrow pts={[[cx(i), 86], [cx(i), 132]]} tone="danger" d={350 + i * 250} dur={250} />
          <Text x={cx(i) + 8} y={104} text={bi("rules out", "تستبعد")} anchor="start" tone="danger" size={10} d={450 + i * 250} />
          <Box x={cx(i) - 63} y={136} w={126} h={70} label={it.out} sub={it.example} tone="danger" size={11} subSize={10} d={550 + i * 250} />
          <Mark x={cx(i) + 62} y={136} ok={false} r={9} d={700 + i * 250} />
        </g>
      ))}
      <Chip x={280} y={250} text={bi("a machine must meet all four to count for RIA", "يجب أن تستوفي الآلة الأربع جميعًا لتعدّها RIA روبوتًا")} tone="success" size={11} center d={1700} />
    </Svg>
  );
}

/* ---------- Is it a robot? ---------- */

const RIA_TESTS: readonly Criterion[] = ["manipulator", "reprogrammable", "multifunctional"];
const JARA_TESTS: readonly { label: Bi; key: "lifelike" | "onCommand" }[] = [
  { label: bi("lifelike motion", "حركة كالكائن الحي"), key: "lifelike" },
  { label: bi("on human command", "بأمر الإنسان"), key: "onCommand" },
];

function MachineIcon({ id, x, y, d }: { id: string; x: number; y: number; d?: number }) {
  if (id === "prosthetic") return <ProstheticIcon x={x} y={y} s={1.3} d={d} />;
  if (id === "teleop") return <TeleopIcon x={x} y={y} s={1.3} d={d} />;
  return <ArmIcon x={x - 10} y={y} s={1.7} tool="torch" d={d} />;
}

function Verdict({ control }: { control: string }) {
  const id = (control in CANDIDATES ? control : "arm") as keyof typeof CANDIDATES;
  const c = CANDIDATES[id];
  const ria = meets("ria", c.traits);
  const jara = meets("jara", c.traits);
  const label = (id: Criterion) => CRITERIA.find((x) => x.id === id)?.label ?? bi(id, id);
  return (
    <Svg>
      <MachineIcon id={id} x={280} y={150} d={0} />
      <Text x={280} y={174} text={c.name} tone="heading" size={12.5} d={150} />
      <Box x={12} y={24} w={190} h={190} r={12} tone="outline" d={200} />
      <Text x={107} y={44} text="RIA" mono size={15} tone="gold" d={250} />
      {RIA_TESTS.map((t, i) => (
        <g key={t}>
          <Text x={30} y={84 + i * 40} text={label(t)} anchor="start" size={11} tone={c.traits[t] ? "heading" : "muted"} d={400 + i * 200} />
          <Mark x={184} y={84 + i * 40} ok={c.traits[t]} r={9} d={500 + i * 200} />
        </g>
      ))}
      <Box x={358} y={24} w={190} h={190} r={12} tone="outline" d={300} />
      <Text x={453} y={44} text="JARA" mono size={15} tone="gold" d={350} />
      {JARA_TESTS.map((t, i) => (
        <g key={t.key}>
          <Text x={376} y={84 + i * 40} text={t.label} anchor="start" size={11} tone={c.traits[t.key] ? "heading" : "muted"} d={1100 + i * 200} />
          <Mark x={530} y={84 + i * 40} ok={c.traits[t.key]} r={9} d={1200 + i * 200} />
        </g>
      ))}
      <Chip x={107} y={244} w={170} text={ria ? bi("a robot for RIA", "روبوت بحسب RIA") : bi("not a robot for RIA", "ليس روبوتًا بحسب RIA")} tone={ria ? "success" : "danger"} size={11} center d={1700} />
      <Chip x={453} y={244} w={170} text={jara ? bi("a robot for JARA", "روبوت بحسب JARA") : bi("not a robot for JARA", "ليس روبوتًا بحسب JARA")} tone={jara ? "success" : "danger"} size={11} center d={1900} />
    </Svg>
  );
}

/* ---------- Counting robots ---------- */

function FleetIcon({ id, x, y }: { id: string; x: number; y: number }) {
  if (id === "prosthetic") return <ProstheticIcon x={x} y={y} s={0.95} />;
  if (id === "teleop") return <TeleopIcon x={x} y={y} s={0.95} />;
  return <ArmIcon x={x - 8} y={y} s={1.15} tool={id === "painter" ? "spray" : id === "palletiser" ? "box" : "torch"} />;
}

function Statistics({ control }: { control: string }) {
  const body: Body = control === "jara" ? "jara" : "ria";
  const xs = FLEET.map((_, i) => 64 + i * 108);
  let n = 0;
  const count = robotCount(body);
  return (
    <Svg>
      <Text x={280} y={18} text={bi("one shop floor", "أرضية مصنع واحدة")} tone="muted" size={11} d={0} />
      {FLEET.map((m, i) => {
        const counted = meets(body, m.traits);
        if (counted) n += 1;
        const k = n;
        return (
          <g key={m.id}>
            <g opacity={counted ? 1 : 0.45}>
              <Fade d={150 + i * 120}>
                <FleetIcon id={m.id} x={xs[i]} y={140} />
              </Fade>
            </g>
            {counted ? <Box x={xs[i] - 42} y={144} w={84} h={6} r={3} tone="gold" d={900 + k * 250} /> : <Box x={xs[i] - 42} y={144} w={84} h={6} r={3} tone="muted" d={200 + i * 120} />}
            <Text x={xs[i]} y={168} text={m.name} size={10.5} tone={counted ? "heading" : "muted"} d={200 + i * 120} />
            {counted ? (
              <Fade d={900 + k * 250}>
                <circle cx={xs[i] + 34} cy={52} r={11} style={{ fill: "var(--gold)", stroke: "var(--surface)", strokeWidth: 2 }} />
                <text x={xs[i] + 34} y={52} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} className={`${w.mono}`} style={{ fill: "var(--navy)" }}>
                  {k}
                </text>
              </Fade>
            ) : (
              <Mark x={xs[i] + 34} y={52} ok={false} r={10} d={900} />
            )}
          </g>
        );
      })}
      <Text x={280} y={210} text={bi(`${DEFINITIONS[body].abbr} counts ${count} robots`, `تعدّ ${DEFINITIONS[body].abbr} ${count} روبوتات`)} tone="gold" size={16} d={900 + count * 250 + 200} />
      <Text x={280} y={254} text={bi(`out of the same ${FLEET.length} machines`, `من الآلات الخمس نفسها`)} tone="muted" size={11.5} d={900 + count * 250 + 400} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof definitions>>({
  compare: Compare,
  "four-words": FourWords,
  verdict: Verdict,
  statistics: Statistics,
});
