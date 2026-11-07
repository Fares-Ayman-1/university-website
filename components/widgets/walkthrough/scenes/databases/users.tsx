"use client";

import type { users } from "@/lib/walkthroughs/databases/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../types";
import { Arrow, Box, Chip, Cylinder, In, Person, Svg, Text, Token } from "../../primitives";
import { sceneSet } from "../../scene-set";

function Stage() {
  const cast: [Bi, number][] = [
    [bi("DBA", "مدير القاعدة"), 60],
    [bi("Designers", "المصممون"), 150],
    [bi("Programmers", "المبرمجون"), 240],
    [bi("End users", "المستخدمون"), 330],
  ];
  return (
    <Svg>
      <Text x={195} y={22} text={bi("Actors on the scene", "الممثلون على المسرح")} tone="heading" size={13} d={0} />
      {cast.map(([label, x], i) => (
        <Person key={i} x={x} y={72} label={label} tone="gold" d={150 + i * 160} />
      ))}
      <Box x={16} y={176} w={360} h={14} r={4} tone="navy" d={0} />
      <Cylinder x={150} y={206} w={90} h={60} tone="navy" label="DB" d={900} />
      <Arrow pts={[[195, 190], [195, 204]]} tone="faint" head={false} d={900} dur={200} />
      <Box x={396} y={46} w={150} h={222} r={14} tone="muted" dashed d={1100} />
      <Text x={471} y={22} text={bi("Behind the scene", "خلف الكواليس")} tone="muted" size={13} d={1100} />
      <Person x={471} y={56} label={bi("DBMS designers", "مصممو النظام")} tone="slate" d={1300} />
      <Person x={471} y={150} label={bi("Tool developers", "مطوّرو الأدوات")} tone="slate" d={1450} />
    </Svg>
  );
}

function Handoff() {
  const steps: { who: Bi; makes: Bi; sub: Bi }[] = [
    { who: bi("Designer", "المصمم"), makes: bi("Schema", "المخطط"), sub: bi("structure, constraints", "البنية والقيود") },
    { who: bi("Programmer", "المبرمج"), makes: bi("Canned transactions", "معاملات جاهزة"), sub: bi("written and tested", "تُكتب وتُختبر") },
    { who: bi("DBA", "مدير القاعدة"), makes: bi("Access and tuning", "الصلاحيات والضبط"), sub: bi("grant, monitor, tune", "منح ومراقبة وضبط") },
    { who: bi("End users", "المستخدمون"), makes: bi("Daily work", "العمل اليومي"), sub: bi("queries, updates", "استعلامات وتحديثات") },
  ];
  return (
    <Svg>
      {steps.map((s, i) => {
        const x = 70 + i * 140;
        const d = i * 500;
        return (
          <g key={i}>
            <Person x={x} y={28} label={s.who} tone={i === 3 ? "gold" : "slate"} d={d} />
            <Box x={x - 67} y={136} w={134} h={66} label={s.makes} sub={s.sub} tone="outline" size={12} d={d + 200} />
            {i < 3 ? <Arrow pts={[[x + 34, 52], [x + 106, 52]]} tone="gold" d={d + 350} /> : null}
          </g>
        );
      })}
      <Text x={280} y={240} text={bi("design → build → run → use", "تصميم ← بناء ← تشغيل ← استخدام")} tone="muted" size={12} d={2100} />
    </Svg>
  );
}

const WHO: Record<string, Bi> = {
  casual: bi("Manager", "مدير"),
  parametric: bi("Bank teller", "صرّاف بنك"),
  sophisticated: bi("Analyst", "محلل"),
  standalone: bi("Taxpayer", "دافع ضرائب"),
};

function EndUsers({ control }: { control: string }) {
  const db = <Cylinder x={440} y={76} w={104} h={116} tone="navy" label={bi("Database", "قاعدة البيانات")} d={100} />;
  return (
    <Svg>
      <Person x={70} y={84} label={WHO[control] ?? WHO.parametric} tone="gold" d={0} />
      {control === "casual" ? (
        <>
          {db}
          <Arrow pts={[[96, 116], [176, 116]]} tone="gold" d={300} />
          <Box x={180} y={84} w={190} h={64} label="SELECT … WHERE … ?" mono sub={bi("a different question each time", "سؤال مختلف كل مرة")} tone="outline" d={400} />
          <Arrow pts={[[370, 116], [436, 128]]} tone="slate" dashed d={800} />
          <Chip x={275} y={214} text={bi("occasionally", "من حين لآخر")} tone="muted" center d={1000} />
        </>
      ) : null}
      {control === "parametric" ? (
        <>
          {db}
          <Arrow pts={[[96, 116], [172, 116]]} tone="gold" d={300} />
          <In d={400}>
            <Box x={176} y={56} w={168} h={124} r={10} tone="slate" />
            <Text x={260} y={74} text={bi("Deposit screen", "شاشة الإيداع")} tone="heading" size={11.5} />
            <Box x={192} y={98} w={136} h={20} r={4} tone="outline" label="account: 1042" mono size={10} />
            <Box x={192} y={124} w={136} h={20} r={4} tone="outline" label="amount: 500" mono size={10} />
            <Box x={236} y={150} w={48} h={20} r={10} tone="gold" label="OK" size={10} />
          </In>
          <Arrow pts={[[344, 118], [436, 128]]} tone="gold" d={700} label={bi("canned transaction", "معاملة جاهزة")} labelAt={[404, 34]} labelTone="gold" />
          {[0, 1, 2].map((k) => (
            <Token key={k} pts={[[344, 118], [436, 128]]} d={1000 + k * 600} dur={500} />
          ))}
          <Chip x={260} y={214} text={bi("all day, the same screen", "طوال اليوم، الشاشة نفسها")} tone="muted" center d={1200} />
        </>
      ) : null}
      {control === "sophisticated" ? (
        <>
          {db}
          <Arrow pts={[[96, 108], [176, 82]]} tone="gold" d={300} />
          <Arrow pts={[[96, 124], [176, 160]]} tone="gold" d={300} />
          <Box x={180} y={50} w={180} h={62} label="WITH … GROUP BY …" mono sub={bi("own complex queries", "استعلاماته المعقدة")} tone="outline" d={400} />
          <Box x={180} y={128} w={180} h={62} label={bi("Analysis tools", "أدوات التحليل")} sub={bi("statistics, charts", "إحصاءات ورسوم بيانية")} tone="slate" d={550} />
          <Arrow pts={[[360, 82], [436, 118]]} tone="slate" d={800} />
          <Arrow pts={[[360, 160], [436, 140]]} tone="slate" d={900} />
          <Chip x={270} y={222} text={bi("knows the system well", "يعرف النظام جيدًا")} tone="muted" center d={1100} />
        </>
      ) : null}
      {control === "standalone" ? (
        <>
          <Arrow pts={[[96, 116], [196, 116]]} tone="gold" d={300} />
          <Box x={200} y={46} w={300} h={152} r={12} tone="outline" d={300} />
          <Box x={300} y={198} w={100} h={10} r={3} tone="muted" d={300} />
          <Text x={350} y={68} text={bi("Tax program", "برنامج الضرائب")} tone="heading" size={12} d={500} />
          <Cylinder x={302} y={90} w={96} h={90} tone="gold" label={bi("Personal DB", "قاعدة شخصية")} d={700} />
          <Chip x={350} y={238} text={bi("no server, one user", "بلا خادم، ومستخدم واحد")} tone="muted" center d={1000} />
        </>
      ) : null}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof users>>({
  stage: Stage,
  handoff: Handoff,
  "end-users": EndUsers,
});
