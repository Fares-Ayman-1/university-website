"use client";

import type { whatIsRobot } from "@/lib/walkthroughs/robotics/lecture-01";
import { FACULTIES, STA_MACHINES, passesSta, type Faculty } from "@/lib/widgets/rob-lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { AlarmIcon, ArmIcon, WasherIcon } from "./local";

const VERB: Record<Faculty, Bi> = { senses: bi("Sense", "يستشعر"), thinks: bi("Think", "يفكّر"), acts: bi("Act", "يتصرّف") };
const PART: Record<Faculty, Bi> = { senses: bi("Sensors", "المستشعرات"), thinks: bi("Processing", "المعالجة"), acts: bi("Actuators", "المشغِّلات") };

function Loop() {
  const xs = [132, 248, 364];
  const by = 84;
  const bh = 48;
  const mid = by + bh / 2;
  const cx = xs.map((x) => x + 46);
  return (
    <Svg>
      <Box x={114} y={36} w={346} h={112} r={14} tone="ghost" dashed d={0} />
      <Text x={460} y={12} text={bi("the robot", "الروبوت")} anchor="end" tone="muted" size={11} d={0} />
      {FACULTIES.map((f, i) => (
        <g key={f}>
          <Text x={cx[i]} y={58} text={VERB[f]} tone="gold" size={12.5} d={150 + i * 250} />
          <Box x={xs[i]} y={by} w={92} h={bh} label={PART[f]} tone={i === 1 ? "navy" : "outline"} size={12} d={200 + i * 250} />
        </g>
      ))}
      <Arrow pts={[[224, mid], [246, mid]]} tone="slate" d={500} dur={200} />
      <Arrow pts={[[340, mid], [362, mid]]} tone="slate" d={750} dur={200} />
      <Box x={40} y={196} w={480} h={40} tone="slate" label={bi("Environment", "البيئة")} size={12} d={900} />
      <Arrow pts={[[cx[0], 196], [cx[0], by + bh + 2]]} tone="gold" d={1100} dur={300} label={bi("state", "الحالة")} labelAt={[cx[0] - 34, 166]} labelTone="gold" />
      <Arrow pts={[[cx[2], by + bh + 2], [cx[2], 194]]} tone="gold" d={1300} dur={300} label={bi("action", "الفعل")} labelAt={[cx[2] + 36, 166]} labelTone="gold" />
      <Token pts={[[cx[0], 216], [cx[0], mid], [cx[2], mid], [cx[2], 216], [cx[0], 216]]} d={1700} dur={3200} />
      <Text x={280} y={254} text={bi("acting changes what is sensed next", "الفعل يغيّر ما سيُستشعَر بعد ذلك")} tone="heading" size={12} d={2000} />
    </Svg>
  );
}

type TestCase = { name: Bi; notes: Record<Faculty, Bi> };
const CASES: Record<keyof typeof STA_MACHINES, TestCase> = {
  washer: {
    name: bi("Timer washing machine", "غسّالة بمؤقّت"),
    notes: { senses: bi("very little", "القليل جدًا"), thinks: bi("no decision", "لا قرار"), acts: bi("spins the drum", "تُدير الحوض") },
  },
  alarm: {
    name: bi("Alarm system", "نظام إنذار"),
    notes: { senses: bi("detects an intruder", "يكتشف متسلّلًا"), thinks: bi("decides to ring", "يقرّر الرنين"), acts: bi("no physical action", "لا فعل مادي") },
  },
  robot: {
    name: bi("Robot arm", "ذراع روبوتية"),
    notes: { senses: bi("sees the part", "يرى القطعة"), thinks: bi("plans the grasp", "يخطّط للقبض"), acts: bi("moves the arm", "يحرّك الذراع") },
  },
};

function Test({ control }: { control: string }) {
  const id = (control in STA_MACHINES ? control : "washer") as keyof typeof STA_MACHINES;
  const machine = STA_MACHINES[id];
  const c = CASES[id];
  const robot = passesSta(machine);
  return (
    <Svg>
      {id === "washer" ? <WasherIcon x={110} y={176} d={0} /> : id === "alarm" ? <AlarmIcon x={110} y={176} d={0} /> : <ArmIcon x={104} y={176} s={2} tool="gripper" d={0} />}
      <Text x={110} y={200} text={c.name} tone="heading" size={12} d={200} />
      {FACULTIES.map((f, i) => {
        const y = 52 + i * 62;
        return (
          <g key={f}>
            <Box x={236} y={y - 22} w={104} h={44} label={VERB[f]} tone={machine[f] ? "success" : "muted"} size={12.5} d={300 + i * 300} />
            <Mark x={362} y={y} ok={machine[f]} d={500 + i * 300} />
            <Text x={384} y={y} text={c.notes[f]} anchor="start" tone={machine[f] ? "heading" : "muted"} size={11.5} d={550 + i * 300} />
          </g>
        );
      })}
      <Chip x={280} y={252} text={robot ? bi("all three, in a loop: a robot", "الثلاثة في حلقة: روبوت") : bi("missing one: not a robot", "ينقصها واحد: ليست روبوتًا")} tone={robot ? "success" : "danger"} size={11.5} center d={1500} />
    </Svg>
  );
}

const ROWS: readonly { robot: Bi; agent: Bi }[] = [
  { robot: bi("Sensors", "المستشعرات"), agent: bi("percepts in", "الإدراكات تدخل") },
  { robot: bi("Controller", "المتحكِّم"), agent: bi("agent program", "برنامج الوكيل") },
  { robot: bi("Actuators", "المشغِّلات"), agent: bi("actions out", "الأفعال تخرج") },
];

function Agent() {
  const ys = [56, 124, 192];
  return (
    <Svg>
      <Text x={150} y={24} text={bi("Robot", "الروبوت")} tone="gold" size={13} d={0} />
      <Text x={410} y={24} text={bi("AI agent", "وكيل الذكاء الاصطناعي")} tone="gold" size={13} d={0} />
      {ROWS.map((r, i) => (
        <g key={i}>
          <Box x={60} y={ys[i]} w={180} h={46} label={r.robot} tone={i === 1 ? "navy" : "outline"} size={12} d={150 + i * 350} />
          <Arrow pts={[[244, ys[i] + 23], [316, ys[i] + 23]]} tone="slate" both d={350 + i * 350} dur={300} />
          <Box x={320} y={ys[i]} w={180} h={46} label={r.agent} tone="slate" size={12} d={450 + i * 350} />
        </g>
      ))}
      <Chip x={280} y={262} text={bi("same loop; the robot's actions move real things", "الحلقة نفسها، وأفعال الروبوت تحرّك أشياء حقيقية")} tone="gold" size={11} center d={2100} />
    </Svg>
  );
}

const WORK: readonly Bi[] = [bi("welding", "اللحام"), bi("painting", "الطلاء"), bi("assembly", "التجميع")];

function BlackBox({ control }: { control: string }) {
  const open = control === "open";
  const inner = [
    { x: 160, label: bi("Sensors", "المستشعرات") },
    { x: 246, label: bi("Controller", "المتحكِّم") },
    { x: 332, label: bi("Actuators", "المشغِّلات") },
  ];
  return (
    <Svg>
      <Text x={56} y={26} text={bi("human directions", "توجيهات الإنسان")} tone="gold" size={11.5} d={0} />
      <Person x={56} y={60} tone="slate" d={100} />
      <Arrow pts={[[90, 120], [148, 120]]} tone="gold" d={400} dur={300} label={bi("input", "المُدخل")} labelAt={[118, 146]} labelTone="muted" />
      {open ? (
        <>
          <Box x={150} y={64} w={260} h={112} r={12} tone="ghost" dashed d={200} />
          {inner.map((b, i) => (
            <Box key={i} x={b.x} y={88} w={74} h={44} label={b.label} tone={i === 1 ? "navy" : "outline"} size={11} d={400 + i * 200} />
          ))}
          <Arrow pts={[[234, 110], [246, 110]]} tone="slate" d={800} dur={150} />
          <Arrow pts={[[320, 110], [332, 110]]} tone="slate" d={900} dur={150} />
          <Text x={280} y={152} text={bi("robot system", "النظام الروبوتي")} tone="muted" size={10.5} d={250} />
        </>
      ) : (
        <Box x={150} y={64} w={260} h={112} r={12} tone="navy" label={bi("Robot system", "النظام الروبوتي")} sub={bi("how it works is hidden", "طريقة عمله مخفيّة")} size={14} d={200} />
      )}
      <Arrow pts={[[412, 120], [432, 120]]} tone="gold" d={1000} dur={200} />
      <Token pts={[[56, 120], [432, 120]]} d={1100} dur={1600} />
      <Text x={490} y={26} text={bi("many types of work", "أنواع كثيرة من العمل")} tone="gold" size={11.5} d={1200} />
      {WORK.map((t, i) => (
        <Chip key={i} x={492} y={74 + i * 44} w={104} text={t} tone="outline" size={11} center d={1400 + i * 150} />
      ))}
      {open ? (
        <>
          <Arrow pts={[[492, 184], [492, 224], [197, 224], [197, 134]]} tone="gold" dashed d={2000} />
          <Token pts={[[492, 184], [492, 224], [197, 224], [197, 134]]} d={2300} dur={1600} tone="navy" />
          <Fade d={2200}>
            <Text x={344} y={244} text={bi("the loop outside the box", "الحلقة خارج الصندوق")} tone="heading" size={12} />
          </Fade>
        </>
      ) : (
        <Text x={280} y={232} text={bi("done automatically", "يُنجَز آليًا")} tone="heading" size={12} d={1900} />
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof whatIsRobot>>({
  loop: Loop,
  test: Test,
  agent: Agent,
  "black-box": BlackBox,
});
