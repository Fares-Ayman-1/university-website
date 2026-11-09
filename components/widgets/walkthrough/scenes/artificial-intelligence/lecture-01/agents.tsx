"use client";

import type { agents } from "@/lib/walkthroughs/artificial-intelligence/lecture-01";
import { ACTIONS, REFLEX_RUN, TABLE_ROWS, agentFunction, showPercept, tableSize } from "@/lib/widgets/ai-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Bars, Box, Chip, Fade, In, Person, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { BiTable, Dirt, Glide, Robot, Square, Vanish } from "./local";

type Example = { name: Bi; sensors: Bi; actuators: Bi };
const EXAMPLES: Record<string, Example> = {
  human: { name: bi("Human", "الإنسان"), sensors: bi("eyes, ears, skin", "العينان والأذنان والجلد"), actuators: bi("hands, legs, voice", "اليدان والساقان والصوت") },
  robot: { name: bi("Robot", "الروبوت"), sensors: bi("cameras, bump sensors", "الكاميرات ومستشعرات الاصطدام"), actuators: bi("motors, wheels", "المحركات والعجلات") },
  softbot: { name: bi("Software bot", "برنامج آلي"), sensors: bi("keystrokes, files, packets", "ضغطات المفاتيح والملفات والحزم"), actuators: bi("display, files, packets", "العرض والملفات والحزم") },
  thermostat: { name: bi("Thermostat", "منظِّم الحرارة"), sensors: bi("temperature sensor", "مستشعر الحرارة"), actuators: bi("heater switch", "مفتاح المدفأة") },
};

function AgentIcon({ kind, x, y }: { kind: string; x: number; y: number }) {
  if (kind === "human") return <Person x={x} y={y - 24} tone="outline" />;
  if (kind === "robot") return <Robot x={x} y={y} r={20} tone="slate" />;
  if (kind === "softbot") return <Box x={x - 30} y={y - 20} w={60} h={40} r={6} label="{ }" mono tone="outline" size={15} />;
  return <Box x={x - 30} y={y - 20} w={60} h={40} r={20} label="21°" mono tone="outline" size={14} />;
}

function Loop({ control }: { control: string }) {
  const ex = EXAMPLES[control] ?? EXAMPLES.human;
  return (
    <Svg>
      <Box x={12} y={40} w={110} h={200} tone="slate" label={bi("Environment", "البيئة")} size={12} d={0} />
      <Box x={438} y={40} w={110} h={200} tone="outline" d={100} />
      <In d={200}>
        <AgentIcon kind={control} x={493} y={110} />
      </In>
      <Box x={446} y={176} w={94} h={52} tone="navy" label={ex.name} size={11.5} d={300} />
      <Box x={184} y={58} w={192} h={72} tone="outline" label={bi("Sensors", "المستشعرات")} sub={ex.sensors} size={12} subSize={10.5} d={400} />
      <Box x={184} y={154} w={192} h={72} tone="outline" label={bi("Actuators", "المشغِّلات")} sub={ex.actuators} size={12} subSize={10.5} d={500} />
      <Arrow pts={[[124, 94], [182, 94]]} tone="gold" d={700} dur={300} label={bi("percepts", "الإدراكات")} labelAt={[153, 66]} labelTone="gold" />
      <Arrow pts={[[378, 94], [436, 94]]} tone="gold" d={900} dur={300} />
      <Token pts={[[70, 94], [182, 94]]} d={800} dur={600} />
      <Token pts={[[378, 94], [470, 94]]} d={1300} dur={500} />
      <Arrow pts={[[436, 190], [378, 190]]} tone="slate" d={1700} dur={300} />
      <Arrow pts={[[182, 190], [124, 190]]} tone="slate" d={1900} dur={300} label={bi("actions", "الأفعال")} labelAt={[153, 214]} labelTone="slate" />
      <Token pts={[[470, 190], [378, 190]]} d={1800} dur={500} tone="navy" />
      <Token pts={[[182, 190], [70, 190]]} d={2200} dur={600} tone="navy" />
    </Svg>
  );
}

function Sequence() {
  const seq = REFLEX_RUN.slice(0, 4).map((s) => s.percept);
  const xs = seq.map((_, i) => 100 + i * 120);
  return (
    <Svg>
      {seq.map((p, i) => (
        <g key={i}>
          <Text x={xs[i]} y={26} text={`t = ${i + 1}`} mono size={11} tone="muted" d={i * 350} />
          <Token pts={[[xs[i], 4], [xs[i], 66]]} d={i * 350} dur={400} tone="navy" r={4} />
          <Chip x={xs[i]} y={66} text={showPercept(p)} tone={i === seq.length - 1 ? "gold" : "outline"} center d={i * 350 + 300} />
        </g>
      ))}
      <Box x={36} y={44} w={488} h={44} r={12} tone="ghost" dashed d={1500} />
      <Text x={280} y={108} text={bi("the percept sequence so far", "تسلسل الإدراكات حتى الآن")} tone="gold" size={12} d={1600} />
      <Arrow pts={[[280, 134], [280, 160]]} tone="gold" d={1800} dur={300} />
      <Box x={190} y={162} w={180} h={50} tone="navy" label="f : P* → A" mono size={14} d={1900} />
      <Text x={104} y={180} text={bi("agent function", "دالة الوكيل")} tone="heading" size={12} d={2000} />
      <Arrow pts={[[372, 187], [428, 187]]} tone="gold" d={2200} dur={300} />
      <Token pts={[[280, 134], [280, 187], [428, 187]]} d={2100} dur={700} />
      <Chip x={474} y={187} text={agentFunction(seq)} tone="gold" center d={2600} />
      <Text x={474} y={220} text={bi("the next action", "الفعل التالي")} tone="heading" size={11.5} d={2700} />
    </Svg>
  );
}

function Vacuum() {
  return (
    <Svg>
      <Square x={24} y={50} w={180} h={150} name="A" d={0} />
      <Square x={214} y={50} w={180} h={150} name="B" d={100} />
      <Dirt x={114} y={160} d={300} />
      <Dirt x={300} y={150} d={400} />
      <Robot x={114} y={116} r={18} d={500} />
      <Fade d={900}>
        <rect x={30} y={56} width={168} height={138} rx={6} fill="none" stroke="var(--gold)" strokeWidth={2} strokeDasharray="5 4" />
      </Fade>
      <Text x={209} y={226} text={bi("it senses only the square it is on", "لا يستشعر إلا المربع الذي يقف عليه")} tone="gold" size={11.5} d={1000} />
      <Text x={480} y={40} text={bi("Percept", "الإدراك")} tone="heading" size={12} d={1100} />
      <Chip x={480} y={76} text={showPercept(["A", "Dirty"])} tone="gold" center d={1200} />
      <Text x={480} y={108} text={bi("Actions", "الأفعال")} tone="heading" size={12} d={1400} />
      {ACTIONS.map((a, i) => (
        <Chip key={a} x={480} y={148 + i * 30} w={76} text={a} tone="outline" center d={1500 + i * 120} />
      ))}
    </Svg>
  );
}

const SQ = { A: 85, B: 225 } as const;
const STEP_MS = 650;

function Run() {
  const run = REFLEX_RUN;
  const t0 = STEP_MS;
  const stops: Pt[] = [[SQ[run[0].before.at], 112]];
  const at: number[] = [];
  const cleanAt: Record<string, number> = {};
  run.forEach((s, k) => {
    const when = t0 + k * STEP_MS + 200;
    if (s.after.at !== s.before.at) {
      stops.push([SQ[s.after.at], 112]);
      at.push(when);
    }
    if (s.action === "Suck" && s.before.dirty[s.before.at]) cleanAt[s.before.at] = when + 100;
  });
  const done = t0 + run.length * STEP_MS;
  return (
    <Svg>
      <Square x={20} y={50} w={130} h={120} name="A" d={0} />
      <Square x={160} y={50} w={130} h={120} name="B" d={0} />
      {(["A", "B"] as const).map((sq) =>
        run[0].before.dirty[sq] ? (
          <Vanish key={sq} at={cleanAt[sq] ?? 99999}>
            <Dirt x={SQ[sq]} y={148} d={100} />
          </Vanish>
        ) : null,
      )}
      <Glide stops={stops} at={at} move={420}>
        <Robot x={stops[0][0]} y={112} r={17} d={200} />
      </Glide>
      <BiTable
        x={310}
        y={34}
        cols={["t", bi("Percept", "الإدراك"), bi("Action", "الفعل")]}
        rows={run.map((s) => [String(s.t), showPercept(s.percept), s.action])}
        cw={[34, 118, 78]}
        rh={26}
        d={0}
        stagger={STEP_MS}
        cell={(_, c) => (c === 2 ? "gold" : undefined)}
      />
      <Chip x={155} y={204} text={bi("both clean after step 3", "المربعان نظيفان بعد الخطوة 3")} tone="success" size={11} center d={t0 + 3 * STEP_MS} />
      <Chip x={155} y={250} text={bi("then it shuttles forever", "ثم يتنقل بلا توقف")} tone="warn" size={11} center d={done} />
    </Svg>
  );
}

const CODE = [
  "def reflex_vacuum_agent(percept):",
  "    location, status = percept",
  '    if status == "Dirty":',
  '        return "Suck"',
  '    if location == "A":',
  '        return "Right"',
  '    return "Left"',
];

function TableProgram({ control }: { control: string }) {
  if (control === "program") {
    return (
      <Svg>
        <Box x={16} y={20} w={300} h={176} r={8} tone="outline" d={0} />
        {CODE.map((line, i) => (
          <Text key={i} x={30} y={42 + i * 22} text={line} anchor="start" mono size={11.5} weight={500} tone={i === 0 ? "gold" : "text"} d={150 + i * 110} />
        ))}
        <Arrow pts={[[166, 198], [166, 218]]} tone="slate" d={1000} dur={200} />
        <Box x={16} y={220} w={300} h={48} tone="slate" label={bi("Architecture (the hardware)", "البنية (العتاد)")} size={12} d={1000} />
        <Box x={368} y={36} w={170} h={48} tone="navy" label={bi("Agent", "الوكيل")} size={13} d={1300} />
        <Text x={453} y={104} text="=" mono size={20} tone="muted" d={1450} />
        <Box x={368} y={124} w={170} h={48} tone="slate" label={bi("Architecture", "البنية")} size={12} d={1550} />
        <Text x={453} y={192} text="+" mono size={20} tone="muted" d={1700} />
        <Box x={368} y={212} w={170} h={48} tone="outline" label={bi("Program", "البرنامج")} size={12} d={1800} />
      </Svg>
    );
  }
  const sizes = [1, 2, 3].map(tableSize);
  return (
    <Svg>
      <BiTable
        x={16}
        y={22}
        cols={[bi("Percept sequence", "تسلسل الإدراكات"), bi("Action", "الفعل")]}
        rows={TABLE_ROWS.map((seq) => [seq.map(showPercept).join(", "), agentFunction(seq)])}
        cw={[206, 70]}
        rh={26}
        d={0}
        stagger={140}
        size={11}
        cell={(_, c) => (c === 1 ? "gold" : undefined)}
      />
      <Text x={154} y={232} text="⋮" size={18} tone="muted" d={1100} />
      <Text x={154} y={254} text={bi("and it never ends", "ولا ينتهي أبدًا")} tone="muted" size={11.5} d={1200} />
      <Text x={434} y={24} text={bi("rows for sequences up to length T", "الصفوف للتسلسلات حتى الطول T")} tone="heading" size={11.5} d={1300} />
      <Bars x={330} y={70} w={210} h={130} values={sizes} labels={["T = 1", "T = 2", "T = 3"]} showValues tone="gold" d={1400} stagger={250} />
      <Text x={434} y={240} text={bi(`T = 10: ${tableSize(10).toLocaleString("en-US")} rows`, `${tableSize(10).toLocaleString("en-US")} صفًّا عند الطول 10`)} tone="danger" size={12} d={2200} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof agents>>({
  loop: Loop,
  sequence: Sequence,
  vacuum: Vacuum,
  run: Run,
  "table-program": TableProgram,
});
