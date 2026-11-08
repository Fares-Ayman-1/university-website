"use client";

import type { engineering } from "@/lib/walkthroughs/software-engineering/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const STAGES = [bi("Specify", "التوصيف"), bi("Design", "التصميم"), bi("Code", "البرمجة"), bi("Test", "الاختبار"), bi("Deploy", "النشر"), bi("Maintain", "الصيانة")];
const sx = (i: number) => 20 + i * 88;

function AllAspects({ control }: { control: string }) {
  const se = control === "se";
  return (
    <Svg>
      <Text x={280} y={22} text={se ? bi("What software engineering covers", "ما تغطيه هندسة البرمجيات") : bi("What programming covers", "ما تغطيه البرمجة")} tone="heading" size={12.5} d={0} />
      {STAGES.map((s, i) => (
        <Box key={i} x={sx(i)} y={110} w={80} h={48} label={s} size={12} tone={se ? "navy" : i === 2 ? "gold" : "muted"} d={100 + i * 120} />
      ))}
      <Arrow pts={[[20, 178], [548, 178]]} tone="faint" d={200} dur={700} />
      {se ? (
        <>
          <Arrow pts={[[20, 102], [20, 92], [540, 92], [540, 102]]} tone="gold" head={false} d={900} dur={700} />
          <Token pts={[[20, 178], [540, 178]]} d={1000} dur={1600} />
          <Text x={20} y={196} text={bi("first idea", "الفكرة الأولى")} anchor="start" tone="muted" size={11} d={1100} />
          <Text x={540} y={196} text={bi("system in use", "النظام قيد الاستخدام")} anchor="end" tone="muted" size={11} d={1300} />
          <Chip x={280} y={248} text={bi("from the first idea to maintenance after release", "من الفكرة الأولى إلى الصيانة بعد الإصدار")} tone="gold" center d={1700} />
        </>
      ) : (
        <>
          <Arrow pts={[[196, 102], [196, 92], [276, 92], [276, 102]]} tone="gold" head={false} d={900} dur={400} />
          <Chip x={236} y={226} text={bi("one stage of many", "مرحلة واحدة من مراحل كثيرة")} tone="warn" center d={1200} />
        </>
      )}
    </Svg>
  );
}

function Systematic() {
  const inputs = [bi("Problem", "المشكلة"), bi("Constraints", "القيود"), bi("Resources", "الموارد")];
  const ys = [50, 116, 182];
  return (
    <Svg>
      {inputs.map((label, i) => (
        <g key={i}>
          <Box x={20} y={ys[i]} w={130} h={46} label={label} tone="slate" d={i * 150} />
          <Arrow pts={[[152, ys[i] + 23], [198, 140]]} tone="gold" d={500 + i * 120} />
          <Token pts={[[152, ys[i] + 23], [198, 140]]} d={600 + i * 120} dur={500} />
        </g>
      ))}
      <Box x={200} y={104} w={180} h={72} label={bi("Systematic approach", "نهج منهجي")} sub={bi("chosen tools and techniques", "أدوات وتقنيات مختارة")} tone="navy" d={900} />
      <Arrow pts={[[382, 140], [410, 140]]} tone="gold" d={1300} dur={250} />
      <Token pts={[[382, 140], [410, 140]]} d={1400} dur={400} />
      <Box x={412} y={104} w={132} h={72} label={bi("Product", "المنتج")} sub={bi("effective, reliable", "فعّال وموثوق")} tone="success" d={1500} />
      <Chip x={290} y={236} text={bi("not trial and error", "لا تجربة وخطأ")} tone="muted" center d={1800} />
    </Svg>
  );
}

function EngineerDeveloper({ control }: { control: string }) {
  if (control === "engineer") {
    const parts = [
      { x: 372, y: 96, label: bi("Software", "البرمجيات"), tone: "slate" as const },
      { x: 456, y: 96, label: bi("Hardware", "العتاد"), tone: "warn" as const },
      { x: 372, y: 148, label: bi("Database", "البيانات"), tone: "slate" as const },
      { x: 456, y: 148, label: bi("Network", "الشبكة"), tone: "slate" as const },
    ];
    return (
      <Svg>
        {[50, 90, 130].map((x, i) => (
          <Person key={i} x={x} y={52} d={i * 100} />
        ))}
        <Text x={90} y={110} text={bi("Engineering team", "فريق هندسي")} tone="heading" size={12} d={300} />
        <Arrow pts={[[152, 76], [184, 76]]} tone="gold" d={500} dur={300} />
        <Box x={186} y={54} w={140} h={46} label={bi("Creates tools", "ينشئ الأدوات")} tone="gold" d={600} />
        <Arrow pts={[[328, 77], [358, 77]]} tone="gold" d={900} dur={300} />
        <Box x={360} y={46} w={184} h={158} r={12} tone="ghost" dashed d={900} />
        <Text x={452} y={64} text={bi("Large system", "نظام كبير")} tone="heading" size={12} d={1000} />
        {parts.map((p, i) => (
          <Box key={i} x={p.x} y={p.y} w={76} h={44} label={p.label} size={12} tone={p.tone} d={1100 + i * 120} />
        ))}
        <Chip x={100} y={240} text={bi("team work", "عمل جماعي")} tone="success" center d={1700} />
        <Chip x={280} y={240} text={bi("hardware too", "العتاد أيضًا")} tone="success" center d={1850} />
        <Chip x={460} y={240} text={bi("much larger scale", "نطاق أكبر بكثير")} tone="success" center d={2000} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Person x={80} y={70} label={bi("Developer", "المطوّر")} d={0} />
      <Arrow pts={[[112, 94], [168, 94]]} tone="slate" d={300} dur={300} />
      <Box x={170} y={71} w={150} h={46} label={bi("Ready-made tools", "أدوات جاهزة")} tone="slate" d={400} />
      <Arrow pts={[[322, 94], [378, 94]]} tone="slate" d={700} dur={300} />
      <Token pts={[[112, 94], [168, 94], [322, 94], [378, 94]]} d={800} dur={900} />
      <Box x={380} y={71} w={160} h={46} label={bi("A complete program", "برنامج كامل")} tone="outline" d={900} />
      <Chip x={100} y={240} text={bi("mostly solitary", "فردي في الغالب")} tone="muted" center d={1300} />
      <Chip x={280} y={240} text={bi("uses existing tools", "يستخدم أدوات موجودة")} tone="muted" center d={1450} />
      <Chip x={460} y={240} text={bi("limited scale", "نطاق محدود")} tone="muted" center d={1600} />
    </Svg>
  );
}

function WhereItFits({ control }: { control: string }) {
  if (control === "systems") {
    const parts = [
      { x: 50, y: 96, label: bi("Hardware", "العتاد"), tone: "outline" as const },
      { x: 50, y: 178, label: bi("People", "الأشخاص"), tone: "outline" as const },
      { x: 290, y: 178, label: bi("Procedures", "الإجراءات"), tone: "outline" as const },
    ];
    return (
      <Svg>
        <Box x={30} y={46} w={500} h={214} r={14} tone="ghost" dashed d={0} />
        <Text x={280} y={66} text={bi("A computer-based system: system engineering", "نظام قائم على الحاسوب: هندسة النظم")} tone="heading" size={12} d={0} />
        {parts.map((p, i) => (
          <Box key={i} x={p.x} y={p.y} w={220} h={68} label={p.label} tone={p.tone} d={200 + i * 200} />
        ))}
        <Box x={290} y={96} w={220} h={68} label={bi("Software", "البرمجيات")} sub={bi("software engineering", "هندسة البرمجيات")} tone="gold" d={900} />
      </Svg>
    );
  }
  const columns = [
    { x: 40, top: bi("Software engineering", "هندسة البرمجيات"), topSub: bi("practice: build and deliver", "التطبيق: البناء والتسليم"), base: bi("Computer science", "علوم الحاسب"), baseSub: bi("theory and fundamentals", "النظرية والأساسيات") },
    { x: 310, top: bi("Electrical engineering", "الهندسة الكهربائية"), topSub: bi("practice", "التطبيق"), base: bi("Physics", "الفيزياء"), baseSub: bi("theory", "النظرية") },
  ];
  return (
    <Svg>
      {columns.map((c, i) => {
        const d = i * 900;
        return (
          <g key={i}>
            <Box x={c.x} y={178} w={210} h={68} label={c.base} sub={c.baseSub} tone="slate" d={d} />
            <Arrow pts={[[c.x + 105, 176], [c.x + 105, 122]]} tone="gold" d={d + 300} label={bi("foundation", "الأساس")} labelAt={[c.x + 156, 144]} labelTone="gold" />
            <Box x={c.x} y={52} w={210} h={68} label={c.top} sub={c.topSub} tone="navy" d={d + 500} />
          </g>
        );
      })}
      <Text x={280} y={148} text={bi("as", "كما")} tone="gold" size={15} d={1900} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof engineering>>({
  "all-aspects": AllAspects,
  systematic: Systematic,
  "engineer-developer": EngineerDeveloper,
  "where-it-fits": WhereItFits,
});
