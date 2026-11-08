"use client";

import type { attributes } from "@/lib/walkthroughs/software-engineering/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Fade, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const ATTRIBUTES = [bi("Maintainability", "قابلية الصيانة"), bi("Dependability", "الاعتمادية"), bi("Efficiency", "الكفاءة"), bi("Acceptability", "القبول")];

function Baseline() {
  return (
    <Svg>
      <Box x={40} y={216} w={480} h={46} label={bi("Functionality and performance", "الوظائف والأداء")} tone="slate" d={0} />
      {ATTRIBUTES.map((a, i) => (
        <Box key={i} x={40 + i * 123} y={102} w={112} h={106} label={a} tone="navy" size={12} d={400 + i * 220} />
      ))}
      <Box x={40} y={48} w={480} h={46} label={bi("Good software", "البرمجيات الجيدة")} tone="gold" d={1400} />
    </Svg>
  );
}

const MODULES = [bi("Interface", "الواجهة"), bi("Tax", "الضرائب"), bi("Orders", "الطلبات"), bi("Invoices", "الفواتير"), bi("Reports", "التقارير"), bi("Users", "المستخدمون")];
const mx = (i: number) => 50 + (i % 3) * 170;
const my = (i: number) => 84 + Math.floor(i / 3) * 86;

function Maintainability({ control }: { control: string }) {
  const tangled = control === "tangled";
  const pairs: [number, number][] = [];
  for (let a = 0; a < MODULES.length; a++) for (let b = a + 1; b < MODULES.length; b++) pairs.push([a, b]);
  const centre = (i: number): [number, number] => [mx(i) + 65, my(i) + 23];
  return (
    <Svg>
      <Chip x={20} y={30} text={bi("Change: a new tax rule", "تغيير: قاعدة ضريبة جديدة")} tone="gold" d={0} />
      {tangled
        ? pairs.map(([a, b], k) => <Arrow key={k} pts={[centre(a), centre(b)]} tone="faint" head={false} d={100 + k * 20} dur={300} />)
        : null}
      {MODULES.map((m, i) => (
        <Box key={i} x={mx(i)} y={my(i)} w={130} h={46} label={m} tone="outline" d={100 + i * 80} />
      ))}
      <Arrow pts={[[196, 30], [285, 30], [285, 82]]} tone="gold" d={700} dur={400} />
      <Token pts={[[196, 30], [285, 30], [285, 82]]} d={700} dur={600} />
      <Fade d={1200}>
        <Box x={mx(1)} y={my(1)} w={130} h={46} label={MODULES[1]} tone="gold" />
      </Fade>
      {tangled ? (
        <>
          {MODULES.map((m, i) =>
            i === 1 ? null : (
              <Fade key={i} d={1500 + i * 180}>
                <Box x={mx(i)} y={my(i)} w={130} h={46} label={m} tone="danger" />
              </Fade>
            ),
          )}
          <Chip x={190} y={248} text={bi("6 modules changed", "تغيير 6 وحدات")} tone="danger" center d={2600} />
          <Chip x={390} y={248} text={bi("slow and costly", "بطيء ومكلف")} tone="danger" center d={2800} />
        </>
      ) : (
        <>
          <Mark x={mx(1) + 130} y={my(1)} ok d={1500} />
          <Chip x={190} y={248} text={bi("1 module changed", "تغيير وحدة واحدة")} tone="success" center d={1700} />
          <Chip x={390} y={248} text={bi("quick and cheap", "سريع ورخيص")} tone="success" center d={1900} />
        </>
      )}
    </Svg>
  );
}

function Dependability() {
  const cols = [
    { x: 100, head: bi("Reliability", "الموثوقية"), event: bi("heavy use", "استخدام كثيف"), eventTone: "outline" as const, out: bi("keeps working", "تستمر في العمل") },
    { x: 280, head: bi("Security", "الأمن"), event: bi("an attack", "هجوم"), eventTone: "danger" as const, out: bi("attack blocked", "صدّ الهجوم") },
    { x: 460, head: bi("Safety", "السلامة"), event: bi("a failure", "عطل"), eventTone: "warn" as const, out: bi("no damage done", "لا أضرار") },
  ];
  return (
    <Svg>
      {cols.map((c, i) => {
        const d = i * 500;
        return (
          <g key={i}>
            <Box x={c.x - 75} y={46} w={150} h={46} label={c.head} tone="navy" d={d} />
            <Arrow pts={[[c.x, 94], [c.x, 112]]} d={d + 150} dur={200} />
            <Chip x={c.x} y={132} text={c.event} tone={c.eventTone} center d={d + 250} />
            <Arrow pts={[[c.x, 152], [c.x, 176]]} tone="success" d={d + 350} dur={200} />
            <Token pts={[[c.x, 94], [c.x, 176]]} tone={c.eventTone === "danger" ? "danger" : "gold"} d={d + 250} dur={500} />
            <Box x={c.x - 75} y={178} w={150} h={46} label={c.out} tone="success" d={d + 450} />
            <Mark x={c.x + 75} y={178} ok d={d + 600} />
          </g>
        );
      })}
      <Text x={280} y={250} text={bi("users can trust it", "يستطيع المستخدمون الوثوق بها")} tone="gold" size={12.5} d={1800} />
    </Svg>
  );
}

function Efficiency({ control }: { control: string }) {
  const efficient = control === "efficient";
  const rows = [
    { y: 60, label: bi("Memory", "الذاكرة"), waste: 0.88, eff: 0.3, text: ["88 %", "30 %"] },
    { y: 120, label: bi("Processor", "المعالج"), waste: 0.92, eff: 0.25, text: ["92 %", "25 %"] },
    { y: 180, label: bi("Response time", "زمن الاستجابة"), waste: 1, eff: 0.125, text: ["2.4 s", "0.3 s"] },
  ];
  const tone = efficient ? "success" : "danger";
  return (
    <Svg>
      <Box
        x={20}
        y={92}
        w={136}
        h={72}
        label={bi("Same job", "المهمة نفسها")}
        sub={efficient ? bi("efficient code", "شيفرة كفؤة") : bi("wasteful code", "شيفرة مُهدِرة")}
        tone={efficient ? "navy" : "slate"}
        d={0}
      />
      {rows.map((r, i) => {
        const p = efficient ? r.eff : r.waste;
        return (
          <g key={i}>
            <Text x={176} y={r.y + 11} text={r.label} anchor="start" tone="heading" size={12} d={100 + i * 120} />
            <Box x={290} y={r.y} w={200} h={22} r={4} tone="muted" d={100 + i * 120} />
            <Box x={290} y={r.y} w={Math.max(200 * p, 8)} h={22} r={4} tone={tone} d={500 + i * 250} />
            <Text x={500} y={r.y + 11} text={efficient ? r.text[1] : r.text[0]} anchor="start" mono size={11.5} tone={efficient ? "success" : "danger"} d={600 + i * 250} />
          </g>
        );
      })}
      <Chip
        x={340}
        y={246}
        text={efficient ? bi("room left for other programs", "مساحة متبقية للبرامج الأخرى") : bi("little left for other programs", "لا يبقى إلا القليل للبرامج الأخرى")}
        tone={tone}
        center
        d={1400}
      />
    </Svg>
  );
}

function Acceptability() {
  return (
    <Svg>
      <Person x={80} y={96} label={bi("Intended user", "المستخدم المستهدف")} d={0} />
      <Arrow pts={[[112, 120], [198, 120]]} tone="slate" both d={300} />
      <Box x={200} y={100} w={160} h={56} label={bi("The software", "البرمجيات")} tone="navy" d={200} />
      <Box x={420} y={56} w={120} h={46} label={bi("Email", "البريد الإلكتروني")} tone="outline" d={600} />
      <Box x={420} y={162} w={120} h={46} label={bi("Spreadsheet", "جداول البيانات")} tone="outline" d={700} />
      <Arrow pts={[[362, 116], [418, 82]]} tone="success" both d={900} />
      <Arrow pts={[[362, 140], [418, 182]]} tone="success" both d={1000} />
      <Token pts={[[362, 116], [418, 82]]} tone="success" d={1100} dur={500} />
      <Token pts={[[362, 140], [418, 182]]} tone="success" d={1200} dur={500} />
      <Text x={480} y={130} text={bi("compatible", "متوافقة")} tone="success" size={11.5} d={1300} />
      <Chip x={190} y={226} w={130} text={bi("understandable", "مفهومة")} tone="outline" center d={1500} />
      <Mark x={256} y={210} ok d={1700} />
      <Chip x={336} y={226} w={120} text={bi("usable", "سهلة الاستخدام")} tone="outline" center d={1700} />
      <Mark x={397} y={210} ok d={1900} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof attributes>>({
  baseline: Baseline,
  maintainability: Maintainability,
  dependability: Dependability,
  efficiency: Efficiency,
  acceptability: Acceptability,
});
