"use client";

import type { reuse } from "@/lib/walkthroughs/software-engineering/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const PARTS = [bi("Login", "الدخول"), bi("Payments", "المدفوعات"), bi("Maps", "الخرائط"), bi("Reports", "التقارير"), bi("Rules", "قواعد العمل"), bi("Glue code", "شيفرة الربط")];
const SLOT = (i: number) => ({ x: 264 + (i % 3) * 90, y: 84 + Math.floor(i / 3) * 60 });
const SHELF = (i: number) => ({ x: 32 + (i % 2) * 92, y: 84 + Math.floor(i / 2) * 60 });

function Assemble({ control }: { control: string }) {
  const reused = control === "reuse";
  return (
    <Svg>
      {reused ? (
        <>
          {/* Under the boxes: each component slips out of the shelf and into its slot. */}
          {[0, 1, 2, 3].map((i) => (
            <Token key={i} pts={[[SHELF(i).x + 42, SHELF(i).y + 24], [SLOT(i).x + 41, SLOT(i).y + 24]]} tone="success" d={900 + i * 200} dur={800} />
          ))}
          <Box x={20} y={36} w={200} h={220} r={12} tone="ghost" dashed d={0} />
          <Text x={120} y={54} text={bi("Existing components", "مكوّنات موجودة")} size={12} tone="heading" d={0} />
          {[0, 1, 2, 3].map((i) => (
            <Box key={i} x={SHELF(i).x} y={SHELF(i).y} w={84} h={48} label={PARTS[i]} tone="success" size={12} d={150 + i * 100} />
          ))}
          <Text x={120} y={222} text={bi("integrated, not written", "تُدمج ولا تُكتب")} size={11.5} tone="success" d={1800} />
          <Arrow pts={[[222, 146], [248, 146]]} tone="gold" width={3} d={700} dur={250} />
        </>
      ) : (
        <>
          <Person x={110} y={80} label={bi("Your team", "فريقك")} d={0} />
          <Arrow pts={[[140, 104], [246, 140]]} tone="gold" d={300} />
          <Text x={120} y={196} text={bi("writes every part itself", "يكتب كل جزء بنفسه")} size={11.5} tone="muted" d={400} />
        </>
      )}
      <Box x={250} y={36} w={290} h={220} r={12} tone="ghost" dashed d={0} />
      <Text x={395} y={54} text={bi("Your system", "نظامك")} size={12} tone="heading" d={0} />
      {PARTS.map((part, i) => {
        const fromShelf = reused && i < 4;
        return (
          <Box
            key={i}
            x={SLOT(i).x}
            y={SLOT(i).y}
            w={82}
            h={48}
            label={part}
            tone={fromShelf ? "success" : "warn"}
            size={12}
            d={reused ? (fromShelf ? 1100 + i * 200 : 2000 + (i - 4) * 250) : 600 + i * 300}
          />
        );
      })}
      <Text
        x={395}
        y={222}
        text={reused ? bi("to write: 2 of 6", "للكتابة: 2 من 6") : bi("to write: 6 of 6", "للكتابة: 6 من 6")}
        size={12.5}
        tone={reused ? "success" : "danger"}
        d={reused ? 2500 : 2400}
      />
    </Svg>
  );
}

const STAGES = [
  { x: 25, y: 48, label: bi("Specify requirements", "توصيف المتطلبات") },
  { x: 205, y: 48, label: bi("Component analysis", "تحليل المكوّنات") },
  { x: 385, y: 48, label: bi("Modify requirements", "تعديل المتطلبات") },
  { x: 385, y: 178, label: bi("Design with reuse", "التصميم مع إعادة الاستخدام") },
  { x: 205, y: 178, label: bi("Develop & integrate", "التطوير والتكامل") },
  { x: 25, y: 178, label: bi("Validate system", "التحقق من صلاحية النظام") },
];

function Process() {
  return (
    <Svg>
      {/* Under the stages, so it shows only on the arrows between them. */}
      <Token pts={STAGES.map((s) => [s.x + 75, s.y + 24] as const)} d={2000} dur={4000} />
      {STAGES.map((s, i) => (
        <Box key={i} x={s.x} y={s.y} w={150} h={48} label={s.label} tone={i === 1 || i === 2 ? "gold" : "navy"} size={12} d={i * 250} />
      ))}
      <Arrow pts={[[177, 72], [203, 72]]} d={150} dur={200} />
      <Arrow pts={[[357, 72], [383, 72]]} d={400} dur={200} />
      <Arrow pts={[[470, 98], [470, 176]]} d={650} dur={300} />
      <Arrow pts={[[383, 202], [357, 202]]} d={900} dur={200} />
      <Arrow pts={[[203, 202], [177, 202]]} d={1150} dur={200} />
      <Arrow
        pts={[[420, 98], [420, 124], [290, 124], [290, 100]]}
        tone="gold"
        dashed
        d={1500}
        label={bi("no exact match? search again", "لا تطابق تام؟ ابحث مجددًا")}
        labelAt={[355, 142]}
        labelTone="gold"
      />
      <Text x={280} y={252} text={bi("the requirements adapt to the components found", "تتكيّف المتطلبات مع المكوّنات التي عُثر عليها")} size={11.5} tone="muted" d={1800} />
    </Svg>
  );
}

function Kinds() {
  return (
    <Svg>
      <Token pts={[[330, 174], [404, 214]]} tone="navy" r={5} d={1700} dur={800} />
      <Token pts={[[388, 216], [322, 162]]} tone="success" r={5} d={2600} dur={800} />
      <Box x={205} y={104} w={150} h={68} label={bi("Your system", "نظامك")} sub={bi("integrates all three", "يدمج الثلاثة")} tone="navy" d={0} />
      <Box x={16} y={36} w={160} h={68} label="COTS" sub={bi("stand-alone application", "تطبيق مستقل")} tone="slate" d={300} />
      <Chip x={96} y={128} text={bi("configured", "مُهيَّأ")} tone="gold" center d={600} />
      <Arrow pts={[[178, 74], [203, 114]]} tone="slate" d={700} dur={300} />
      <Box x={390} y={24} w={150} h={102} r={10} tone="ghost" dashed d={800} />
      <Text x={465} y={40} text=".NET / J2EE" mono size={11} tone="muted" d={800} />
      {[0, 1, 2].map((i) => (
        <Box key={i} x={402 + i * 44} y={54} w={38} h={26} r={4} label="obj" mono size={10} tone="slate" d={900 + i * 100} />
      ))}
      <Text x={465} y={96} text={bi("collection of objects", "مجموعة من الكائنات")} size={11} tone="heading" d={1000} />
      <Arrow pts={[[388, 100], [357, 116]]} tone="slate" d={1200} dur={300} />
      <Box x={390} y={186} w={150} h={68} label={bi("Web service", "خدمة ويب")} sub={bi("on a remote server", "على خادم بعيد")} tone="outline" d={1300} />
      <Arrow pts={[[330, 174], [388, 206]]} tone="slate" dashed both d={1500} />
      <Text x={300} y={228} text={bi("remote call", "استدعاء عن بُعد")} size={11} tone="muted" d={1600} />
      <Text x={20} y={232} text={bi("COTS: commercial off-the-shelf", "COTS: منتجات تجارية جاهزة")} anchor="start" size={11} tone="muted" d={2000} />
    </Svg>
  );
}

function Tradeoffs({ control }: { control: string }) {
  if (control === "costs") {
    const rows = ["R1", "R2", "R3", "R4"];
    return (
      <Svg>
        <Text x={140} y={22} text={bi("Requirements compromise", "تنازل في المتطلبات")} size={12} tone="heading" d={0} />
        <Text x={75} y={58} text={bi("Users need", "يحتاج المستخدمون")} size={11} tone="muted" d={0} />
        <Text x={205} y={58} text={bi("Component has", "يوفّره المكوّن")} size={11} tone="muted" d={100} />
        {rows.map((r, k) => {
          const y = 84 + k * 36;
          const covered = k < 3;
          return (
            <g key={r}>
              <Box x={30} y={y} w={90} h={28} r={6} label={r} mono size={11.5} tone="slate" d={200 + k * 120} />
              <Box x={160} y={y} w={90} h={28} r={6} label={covered ? r : "—"} mono size={11.5} tone={covered ? "success" : "ghost"} dashed={!covered} d={500 + k * 120} />
              {covered ? <Arrow pts={[[122, y + 14], [158, y + 14]]} tone="success" head={false} d={800 + k * 120} dur={200} /> : <Mark x={140} y={y + 14} ok={false} r={9} d={1300} />}
            </g>
          );
        })}
        <Text x={140} y={246} text={bi("R4 is dropped or worked around", "R4 يُحذف أو يُلتف عليه")} size={11} tone="danger" d={1500} />
        <Arrow pts={[[280, 36], [280, 256]]} tone="faint" dashed head={false} d={0} />
        <Text x={420} y={22} text={bi("Loss of control", "فقدان السيطرة")} size={12} tone="heading" d={1600} />
        <Box x={300} y={46} w={120} h={48} label={bi("Vendor", "المورّد")} tone="slate" d={1700} />
        <Text x={432} y={70} text={bi("decides releases", "يقرر الإصدارات")} anchor="start" size={11} tone="muted" d={1800} />
        <Arrow pts={[[332, 96], [332, 112]]} tone="slate" d={1900} dur={200} />
        {["v1", "v2", "v3"].map((v, i) => (
          <Box key={v} x={300 + i * 88} y={114} w={64} h={32} r={6} label={v} mono size={12} tone={i ? "gold" : "outline"} d={2000 + i * 250} />
        ))}
        <Arrow pts={[[366, 130], [386, 130]]} d={2200} dur={150} />
        <Arrow pts={[[454, 130], [474, 130]]} d={2450} dur={150} />
        <Box x={300} y={200} w={240} h={48} label={bi("Your system must follow", "نظامك مضطر إلى المتابعة")} tone="warn" size={12} d={2200} />
        <Arrow pts={[[420, 148], [420, 198]]} tone="danger" dashed d={2600} />
        <Arrow pts={[[508, 148], [508, 198]]} tone="danger" dashed d={2800} />
        <Text x={360} y={174} text={bi("must adapt", "يجب أن يتكيّف")} size={11} tone="danger" d={2900} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Chip x={150} y={24} w={130} text={bi("from scratch", "من الصفر")} tone="muted" center d={0} />
      <Chip x={330} y={24} w={150} text={bi("with reuse", "مع إعادة الاستخدام")} tone="success" center d={0} />
      <Text x={20} y={70} text={bi("Software to develop", "البرمجيات المطلوب تطويرها")} anchor="start" size={12} tone="heading" d={100} />
      <Box x={20} y={98} w={480} h={18} r={4} tone="muted" d={300} />
      <Box x={20} y={120} w={150} h={18} r={4} tone="success" d={600} />
      <Text x={180} y={129} text={bi("lower cost and risk", "تكلفة ومخاطر أقل")} anchor="start" size={11} tone="success" d={900} />
      <Text x={20} y={170} text={bi("Time to delivery", "الوقت حتى التسليم")} anchor="start" size={12} tone="heading" d={1000} />
      <Box x={20} y={198} w={480} h={18} r={4} tone="muted" d={1200} />
      <Box x={20} y={220} w={240} h={18} r={4} tone="success" d={1500} />
      <Text x={270} y={229} text={bi("faster delivery", "تسليم أسرع")} anchor="start" size={11} tone="success" d={1800} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof reuse>>({
  assemble: Assemble,
  process: Process,
  kinds: Kinds,
  tradeoffs: Tradeoffs,
});
