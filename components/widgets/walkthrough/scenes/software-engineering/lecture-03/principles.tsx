"use client";

import type { principles } from "@/lib/walkthroughs/software-engineering/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Fade, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function Involvement() {
  return (
    <Svg>
      <Box x={20} y={26} w={520} h={150} r={14} tone="ghost" dashed d={0} />
      <Text x={36} y={42} text={bi("One team", "فريق واحد")} anchor="start" tone="muted" size={11} d={0} />
      <Person x={110} y={78} label={bi("Customer", "العميل")} tone="gold" d={100} />
      {[410, 450, 490].map((x, i) => (
        <Person key={i} x={x} y={78} tone="slate" d={200 + i * 80} />
      ))}
      <Text x={450} y={128} text={bi("Developers", "المطورون")} tone="heading" size={11.5} d={300} />
      <Arrow pts={[[150, 94], [392, 94]]} tone="gold" d={500} label={bi("requirements and priorities", "المتطلبات والأولويات")} labelAt={[266, 68]} labelTone="gold" />
      <Arrow pts={[[392, 122], [150, 122]]} tone="success" d={900} label={bi("an increment to evaluate", "زيادة للتقييم")} labelAt={[266, 142]} labelTone="success" />
      <Token
        pts={[
          [150, 94],
          [392, 94],
          [392, 122],
          [150, 122],
          [150, 94],
          [392, 94],
          [392, 122],
          [150, 122],
          [150, 94],
        ]}
        d={1300}
        dur={5200}
      />
      <Text x={20} y={209} text={bi("Iteration", "الدورة")} anchor="start" tone="muted" size={11} d={1300} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Box key={i} x={120 + i * 70} y={192} w={56} h={34} r={6} label={`${i + 1}`} mono size={12} tone="gold" d={1400 + i * 300} />
      ))}
      <Text x={330} y={248} text={bi("the customer takes part in every one", "يشارك العميل في كل دورة")} tone="muted" size={11} d={3200} />
    </Svg>
  );
}

const FEATURES = [bi("1 · Search", "1 · البحث"), bi("2 · Cart", "2 · السلة"), bi("3 · Payment", "3 · الدفع"), bi("4 · Reviews", "4 · المراجعات"), bi("5 · Wish list", "5 · قائمة الأمنيات")];
const INCREMENTS = [
  { x: 270, adds: [0, 1] },
  { x: 380, adds: [2] },
  { x: 490, adds: [3, 4] },
];
const fy = (i: number) => 66 + i * 42;
const layerTop = (k: number) => 214 - (k + 1) * 28;

function Incremental() {
  let have = 0;
  return (
    <Svg>
      <Text x={95} y={22} text={bi("Customer's priorities", "أولويات العميل")} tone="heading" size={11.5} d={0} />
      {FEATURES.map((f, i) => (
        <Chip key={i} x={20} y={fy(i)} w={150} text={f} tone="outline" d={100 + i * 80} />
      ))}
      {INCREMENTS.map((inc, n) => {
        const d = 700 + n * 900;
        const before = have;
        have += inc.adds.length;
        const top = layerTop(have - 1);
        return (
          <g key={n}>
            {inc.adds.map((f, j) => (
              <Token key={f} pts={[[172, fy(f)], [inc.x, layerTop(before + j) + 13]]} d={d + j * 120} dur={600} />
            ))}
            {Array.from({ length: have }, (_, k) => (
              <Box key={k} x={inc.x - 45} y={layerTop(k)} w={90} h={26} r={4} label={`${k + 1}`} mono size={11} tone={k >= before ? "gold" : "slate"} d={d + 500 + k * 60} />
            ))}
            <Chip x={inc.x} y={top - 24} w={92} size={10.5} text={bi("in use", "قيد الاستخدام")} tone="success" center d={d + 800} />
            <Text x={inc.x} y={234} text={bi(`Increment ${n + 1}`, `الزيادة ${n + 1}`)} tone="heading" size={11.5} d={d + 400} />
          </g>
        );
      })}
    </Svg>
  );
}

function People({ control }: { control: string }) {
  if (control === "chosen") {
    const menu = [
      { label: bi("Pair programming", "البرمجة الثنائية"), keep: true },
      { label: bi("Test-first", "الاختبار أولًا"), keep: true },
      { label: bi("Daily meeting", "اجتماع يومي"), keep: true },
      { label: bi("Detailed weekly report", "تقرير أسبوعي مفصّل"), keep: false },
    ];
    return (
      <Svg>
        {[70, 120, 170].map((x, i) => (
          <Person key={i} x={x} y={84} tone="slate" d={i * 100} />
        ))}
        <Text x={120} y={134} text={bi("Team", "الفريق")} tone="heading" size={12} d={200} />
        {menu.map((m, i) => {
          const y = 46 + i * 50;
          return (
            <g key={i}>
              {m.keep ? <Arrow pts={[[192, 102], [306, y]]} tone="gold" d={900 + i * 250} /> : null}
              <Chip x={310} y={y} w={200} text={m.label} tone={m.keep ? "gold" : "muted"} d={m.keep ? 1100 + i * 250 : 300 + i * 100} />
              <Mark x={530} y={y} ok={m.keep} d={1300 + i * 250} />
            </g>
          );
        })}
        <Text x={280} y={250} text={bi("the team keeps what works for it", "يحتفظ الفريق بما ينجح معه")} tone="success" size={12} d={2300} />
      </Svg>
    );
  }
  const people = [
    { x: 290, skill: bi("good at UI", "بارع في الواجهات") },
    { x: 390, skill: bi("good at data", "بارع في البيانات") },
    { x: 490, skill: bi("good at tests", "بارع في الاختبارات") },
  ];
  return (
    <Svg>
      <Doc x={24} y={50} w={110} h={150} label={bi("Process manual", "دليل العملية")} tone="outline" size={11.5} d={0} />
      <Arrow pts={[[138, 160], [236, 160]]} tone="muted" d={700} label={bi("prescribes", "يفرض")} labelAt={[187, 132]} />
      {people.map((p, i) => (
        <g key={i}>
          <Person x={p.x} y={30} label={p.skill} size={11} tone="slate" d={200 + i * 120} />
          {[0, 1, 2].map((s) => (
            <Box key={s} x={p.x - 30} y={122 + s * 38} w={60} h={30} r={6} label={`${s + 1}`} mono size={12} tone="muted" d={900 + s * 200} />
          ))}
        </g>
      ))}
      <Text x={390} y={250} text={bi("the same steps for everyone", "الخطوات نفسها للجميع")} tone="danger" size={12} d={1700} />
    </Svg>
  );
}

const MODULES = [bi("Cart", "السلة"), bi("Checkout", "إتمام الشراء"), bi("Invoices", "الفواتير"), bi("Refunds", "المبالغ المستردة")];

function Change({ control }: { control: string }) {
  const ready = control === "ready";
  return (
    <Svg>
      <Chip x={280} y={26} text={bi("New: pay by mobile wallet", "جديد: الدفع بالمحفظة الإلكترونية")} tone="gold" center d={0} />
      {ready ? (
        <>
          <Box x={14} y={100} w={120} h={44} label={MODULES[0]} tone="slate" size={12} d={200} />
          <Box x={150} y={100} w={120} h={44} label={MODULES[1]} tone="slate" size={12} d={300} />
          <Box x={300} y={100} w={146} h={44} label={bi("Payment interface", "واجهة الدفع")} tone="navy" size={12} d={400} />
          <Arrow pts={[[134, 122], [148, 122]]} tone="muted" d={500} dur={150} />
          <Arrow pts={[[270, 122], [298, 122]]} tone="muted" d={600} dur={200} />
          <Arrow pts={[[340, 146], [334, 194]]} tone="muted" d={700} dur={300} />
          <Box x={280} y={196} w={110} h={44} label={bi("Card", "البطاقة")} tone="outline" size={12} d={800} />
          <Arrow pts={[[410, 146], [460, 194]]} tone="gold" d={1100} dur={300} />
          <Box x={406} y={196} w={140} h={44} label={bi("Wallet (new)", "المحفظة (جديدة)")} tone="gold" size={12} d={1300} />
          <Mark x={134} y={100} ok d={1700} />
          <Mark x={270} y={100} ok d={1800} />
          <Mark x={390} y={196} ok d={1900} />
          <Text x={140} y={200} text={bi("only 1 new module", "وحدة جديدة واحدة فقط")} tone="success" size={12.5} d={2100} />
        </>
      ) : (
        <>
          {MODULES.map((m, i) => {
            const x = 14 + i * 136;
            return (
              <g key={i}>
                <Arrow pts={[[280, 46], [x + 60, 96]]} tone="danger" d={500 + i * 150} />
                <Box x={x} y={98} w={124} h={68} label={m} sub={bi("card logic", "منطق البطاقة")} tone="slate" size={12} d={150 + i * 100} />
                <Fade d={1200 + i * 180}>
                  <Box x={x} y={98} w={124} h={68} label={m} sub={bi("must change", "يجب تعديلها")} tone="danger" size={12} />
                </Fade>
              </g>
            );
          })}
          <Text x={280} y={212} text={bi("4 modules to edit and test again", "4 وحدات يجب تعديلها واختبارها من جديد")} tone="danger" size={12.5} d={2000} />
        </>
      )}
    </Svg>
  );
}

function Simplicity({ control }: { control: string }) {
  const process = control === "process";
  return (
    <Svg>
      <Text x={140} y={22} text={bi("Before", "قبل")} tone="heading" size={12} d={0} />
      <Text x={420} y={22} text={bi("After", "بعد")} tone="heading" size={12} d={0} />
      <Arrow pts={[[280, 14], [280, 266]]} tone="faint" dashed head={false} d={0} />
      {process ? (
        <>
          {[
            { y: 44, h: 40, label: bi("Approvals", "الموافقات"), tone: "warn" as const },
            { y: 84, h: 40, label: bi("Reports", "التقارير"), tone: "warn" as const },
            { y: 124, h: 40, label: bi("Meetings", "الاجتماعات"), tone: "muted" as const },
            { y: 164, h: 64, label: bi("Building software", "بناء البرمجيات"), tone: "gold" as const },
          ].map((s, i) => (
            <Box key={i} x={80} y={s.y} w={120} h={s.h} r={0} label={s.label} tone={s.tone} size={11} d={i * 150} />
          ))}
          <Text x={140} y={248} text={bi("a week of work", "أسبوع من العمل")} tone="muted" size={11.5} d={700} />
          <Box x={360} y={44} w={120} h={40} r={0} label={bi("Meetings", "الاجتماعات")} tone="muted" size={11} d={900} />
          <Box x={360} y={84} w={120} h={144} r={0} label={bi("Building software", "بناء البرمجيات")} tone="gold" size={11} d={1050} />
          <Text x={420} y={248} text={bi("most of the week builds software", "معظم الأسبوع لبناء البرمجيات")} tone="success" size={11.5} d={1400} />
        </>
      ) : (
        <>
          {[
            [90, 114, 69, 90],
            [190, 114, 208, 90],
            [90, 158, 69, 182],
            [190, 158, 208, 182],
          ].map(([x1, y1, x2, y2], i) => (
            <Arrow key={i} pts={[[x1, y1], [x2, y2]]} tone="faint" head={false} d={300 + i * 100} dur={250} />
          ))}
          <Box x={14} y={44} w={110} h={44} label={bi("Plug-ins", "الإضافات")} tone="muted" dashed size={11.5} d={400} />
          <Box x={150} y={44} w={116} h={44} label={bi("Config engine", "محرك الإعدادات")} tone="muted" dashed size={11.5} d={500} />
          <Box x={14} y={184} w={110} h={44} label={bi("Cache", "التخزين المؤقت")} tone="muted" dashed size={11.5} d={600} />
          <Box x={150} y={184} w={116} h={44} label={bi("5 export formats", "5 صيغ للتصدير")} tone="muted" dashed size={11.5} d={700} />
          <Box x={70} y={114} w={140} h={44} label={bi("Order form", "نموذج الطلب")} tone="navy" size={12} d={0} />
          <Text x={140} y={248} text={bi("built just in case", "بُني احتياطًا")} tone="danger" size={11.5} d={1000} />
          <Box x={350} y={114} w={140} h={44} label={bi("Order form", "نموذج الطلب")} tone="navy" size={12} d={1200} />
          <Mark x={490} y={114} ok d={1500} />
          <Text x={420} y={248} text={bi("only what is needed now", "ما يلزم الآن فقط")} tone="success" size={11.5} d={1600} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof principles>>({
  involvement: Involvement,
  incremental: Incremental,
  people: People,
  change: Change,
  simplicity: Simplicity,
});
