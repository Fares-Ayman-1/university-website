"use client";

import type { softwareProcess } from "@/lib/walkthroughs/software-engineering/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const ACTIVITIES = [bi("Specification", "التوصيف"), bi("Development", "التطوير"), bi("Validation", "التحقق من الصلاحية"), bi("Evolution", "التطور")];

function Sequence() {
  const x = (i: number) => 36 + i * 124;
  const loop: [number, number][] = [
    [460, 154],
    [460, 190],
    [88, 190],
    [88, 154],
  ];
  return (
    <Svg>
      <Chip x={88} y={56} text={bi("customer needs", "احتياجات العميل")} tone="outline" center d={0} />
      <Arrow pts={[[88, 76], [88, 98]]} tone="slate" d={200} dur={250} />
      {ACTIVITIES.map((a, i) => (
        <g key={i}>
          <Box x={x(i)} y={100} w={104} h={52} label={a} size={12} tone="navy" d={300 + i * 250} />
          {i < 3 ? <Arrow pts={[[x(i) + 106, 126], [x(i + 1) - 2, 126]]} tone="gold" d={450 + i * 250} dur={200} /> : null}
        </g>
      ))}
      <Arrow pts={[[336, 98], [336, 76]]} tone="gold" d={1300} dur={250} />
      <Chip x={336} y={56} text={bi("software product", "المنتج البرمجي")} tone="gold" center d={1400} />
      <Arrow pts={[[404, 56], [460, 56], [460, 98]]} tone="gold" d={1600} dur={400} />
      <Arrow pts={loop} tone="gold" dashed d={2000} label={bi("new needs: round again", "احتياجات جديدة: دورة أخرى")} labelAt={[274, 208]} labelTone="gold" />
      <Token pts={loop} d={2200} dur={1400} />
      <Text x={280} y={254} text={bi("every process includes these four", "كل عملية تتضمن هذه الأربعة")} tone="muted" size={11.5} d={2400} />
    </Svg>
  );
}

function Specification() {
  return (
    <Svg>
      <Person x={60} y={58} label={bi("Customer", "العميل")} d={0} />
      <Person x={60} y={168} label={bi("Engineer", "المهندس")} d={150} />
      <Arrow pts={[[90, 84], [158, 100]]} tone="slate" d={400} />
      <Arrow pts={[[90, 192], [158, 176]]} tone="slate" d={400} />
      <Box x={160} y={44} w={270} h={224} r={8} tone="outline" d={300} />
      <Text x={176} y={64} text={bi("What it should do", "ما يجب أن تفعله")} anchor="start" tone="gold" size={12} d={600} />
      <Chip x={176} y={106} text={bi("book an appointment", "حجز موعد")} tone="outline" d={800} />
      <Chip x={176} y={148} text={bi("remind the patient", "تذكير المريض")} tone="outline" d={950} />
      <Text x={176} y={186} text={bi("Constraints", "القيود")} anchor="start" tone="danger" size={12} d={1200} />
      <Chip x={176} y={228} text={bi("runs on Android", "يعمل على Android")} tone="warn" d={1400} />
      <Chip x={316} y={228} text={bi("by June", "بحلول يونيو")} tone="warn" d={1550} />
      <Chip x={495} y={110} text={bi("what, not how", "ماذا لا كيف")} tone="gold" center d={1800} />
    </Svg>
  );
}

function Development() {
  const parts = [bi("Interface", "الواجهة"), bi("Logic", "المنطق"), bi("Data", "البيانات")];
  const files = ["ui.py", "logic.py", "data.py"];
  const ys = [94, 148, 202];
  return (
    <Svg>
      <Doc x={16} y={100} w={96} h={84} label={bi("Specification", "التوصيف")} tone="gold" d={0} />
      <Arrow pts={[[114, 142], [146, 142]]} tone="gold" d={300} dur={250} />
      <Box x={148} y={46} w={170} h={214} r={12} tone="ghost" dashed d={300} />
      <Text x={233} y={64} text={bi("Design", "التصميم")} tone="heading" size={12.5} d={300} />
      <Box x={340} y={46} w={204} h={214} r={12} tone="ghost" dashed d={1000} />
      <Text x={442} y={64} text={bi("Programming", "البرمجة")} tone="heading" size={12.5} d={1000} />
      {parts.map((p, i) => (
        <g key={i}>
          <Box x={166} y={ys[i]} w={134} h={44} label={p} tone="navy" d={500 + i * 150} />
          <Arrow pts={[[302, ys[i] + 22], [356, ys[i] + 22]]} tone="slate" d={1200 + i * 150} dur={250} />
          <Token pts={[[302, ys[i] + 22], [356, ys[i] + 22]]} d={1250 + i * 150} dur={350} />
          <Box x={358} y={ys[i]} w={168} h={44} label={files[i]} mono tone="slate" d={1400 + i * 150} />
        </g>
      ))}
    </Svg>
  );
}

function Validation({ control }: { control: string }) {
  const fail = control === "fail";
  const reqs = [bi("Book an appointment", "حجز موعد"), bi("Remind the patient", "تذكير المريض"), bi("Print a report", "طباعة تقرير")];
  const ys = [50, 102, 154];
  return (
    <Svg>
      <Text x={315} y={22} text={bi("Requirements from the specification", "المتطلبات من التوصيف")} tone="heading" size={12} d={0} />
      <Box x={20} y={104} w={120} h={60} label={bi("Software", "البرمجيات")} sub="v1.0" tone="navy" d={0} />
      {reqs.map((r, i) => (
        <g key={i}>
          <Box x={200} y={ys[i]} w={230} h={44} label={r} tone="outline" d={150 + i * 120} />
          <Arrow pts={[[142, 134], [198, ys[i] + 22]]} tone="faint" dashed head={false} d={500} />
          <Token pts={[[142, 134], [198, ys[i] + 22]]} d={600 + i * 300} dur={400} />
          <Mark x={452} y={ys[i] + 22} ok={!(fail && i === 1)} d={1000 + i * 300} />
        </g>
      ))}
      {fail ? (
        <>
          <Box x={20} y={210} w={150} h={44} label={bi("Back to development", "العودة إلى التطوير")} tone="danger" d={2000} />
          <Arrow pts={[[466, 124], [530, 124], [530, 232], [172, 232]]} tone="danger" d={1900} dur={800} label={bi("fix, then test again", "أصلِح ثم اختبر مجددًا")} labelAt={[350, 250]} labelTone="danger" />
          <Token pts={[[466, 124], [530, 124], [530, 232], [172, 232]]} tone="danger" d={2000} dur={1000} />
        </>
      ) : (
        <>
          <Arrow pts={[[452, 190], [452, 218]]} tone="success" d={2000} dur={250} />
          <Box x={377} y={220} w={150} h={44} label={bi("Deliver", "التسليم")} tone="success" d={2100} />
        </>
      )}
    </Svg>
  );
}

function Evolution() {
  const row = [
    { x: 60, label: ACTIVITIES[0] },
    { x: 215, label: ACTIVITIES[1] },
    { x: 370, label: ACTIVITIES[2] },
  ];
  return (
    <Svg>
      <Box x={20} y={206} w={120} h={60} label="v1.0" mono sub={bi("in use", "قيد الاستخدام")} tone="slate" d={0} />
      <Chip x={125} y={64} text={bi("new need", "حاجة جديدة")} tone="gold" center d={300} />
      <Arrow pts={[[125, 84], [125, 116]]} tone="gold" d={500} dur={250} />
      <Arrow pts={[[80, 204], [80, 166]]} tone="slate" d={500} dur={250} />
      {row.map((r, i) => (
        <g key={i}>
          <Box x={r.x} y={118} w={130} h={46} label={r.label} size={12} tone="navy" d={700 + i * 250} />
          {i < 2 ? <Arrow pts={[[r.x + 132, 141], [row[i + 1].x - 2, 141]]} tone="gold" d={850 + i * 250} dur={200} /> : null}
        </g>
      ))}
      <Arrow pts={[[435, 166], [480, 204]]} tone="success" d={1500} dur={300} />
      <Box x={420} y={206} w={120} h={60} label="v2.0" mono sub={bi("released", "صدر")} tone="success" d={1700} />
      <Token pts={[[125, 84], [125, 141], [435, 141], [435, 166], [480, 204]]} d={600} dur={1600} />
      <Text x={280} y={236} text={bi("each change runs the cycle again", "كل تغيير يشغّل الدورة من جديد")} tone="muted" size={11.5} d={2000} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof softwareProcess>>({
  sequence: Sequence,
  specification: Specification,
  development: Development,
  validation: Validation,
  evolution: Evolution,
});
