"use client";

import type { xp } from "@/lib/walkthroughs/software-engineering/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Mark, Person, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

// ---------- Release cycle ----------
const CYCLE: { x: number; y: number; label: Bi; tone: "slate" | "gold" }[] = [
  { x: 14, y: 44, label: bi("Select user stories", "اختيار قصص المستخدم"), tone: "slate" },
  { x: 201, y: 44, label: bi("Break into tasks", "التقسيم إلى مهام"), tone: "slate" },
  { x: 388, y: 44, label: bi("Plan the release", "تخطيط الإصدار"), tone: "slate" },
  { x: 388, y: 176, label: bi("Develop, integrate, test", "التطوير والدمج والاختبار"), tone: "gold" },
  { x: 201, y: 176, label: bi("Release the software", "إصدار البرمجيات"), tone: "slate" },
  { x: 14, y: 176, label: bi("Evaluate the system", "تقييم النظام"), tone: "slate" },
];
const LINKS: Pt[][] = [
  [
    [172, 66],
    [199, 66],
  ],
  [
    [359, 66],
    [386, 66],
  ],
  [
    [467, 88],
    [467, 174],
  ],
  [
    [388, 198],
    [361, 198],
  ],
  [
    [201, 198],
    [174, 198],
  ],
  [
    [93, 176],
    [93, 90],
  ],
];

function ReleaseCycle() {
  return (
    <Svg>
      {CYCLE.map((c, i) => (
        <Box key={i} x={c.x} y={c.y} w={158} h={44} label={c.label} tone={c.tone} size={11} d={i * 200} />
      ))}
      {LINKS.map((pts, i) => (
        <Arrow key={i} pts={pts} tone="muted" d={150 + i * 200} dur={250} />
      ))}
      <Token
        pts={[
          [93, 132],
          [93, 66],
          [467, 66],
          [467, 198],
          [93, 198],
          [93, 132],
        ]}
        d={1400}
        dur={4200}
      />
      <Chip x={280} y={112} text={bi("New builds: several times a day", "بناء نسخ جديدة: عدة مرات في اليوم")} tone="slate" size={11} center d={1500} />
      <Chip x={280} y={152} text={bi("Release: about every 2 weeks", "الإصدار: كل أسبوعين تقريبًا")} tone="gold" size={11} center d={1700} />
      <Chip x={392} y={248} text={bi("A build is accepted only if all tests pass", "لا يُقبل البناء إلا إذا نجحت كل الاختبارات")} tone="success" size={11} center d={1900} />
      <Mark x={228} y={248} ok d={2100} />
    </Svg>
  );
}

// ---------- User stories ----------
const TASKS = [
  { label: bi("Store the approved-drug list", "تخزين قائمة الأدوية المعتمدة"), days: 2 },
  { label: bi("Pick a drug from the list", "اختيار دواء من القائمة"), days: 1 },
  { label: bi("Check the dose range", "فحص نطاق الجرعة"), days: 3 },
];
const daysAr = (n: number) => (n === 1 ? "يوم واحد" : n === 2 ? "يومان" : `${n} أيام`);
const daysBi = (n: number) => bi(n === 1 ? "1 day" : `${n} days`, daysAr(n));
const TOTAL_DAYS = TASKS.reduce((s, t) => s + t.days, 0);

function Stories() {
  const card = [bi("As a: doctor", "بصفتي: طبيبًا"), bi("I want: a list of approved drugs", "أريد: قائمة بالأدوية المعتمدة"), bi("So that: doses are checked", "حتى: تُفحص الجرعات")];
  return (
    <Svg>
      <Text x={132} y={26} text={bi("Story card", "بطاقة القصة")} tone="heading" size={12} d={0} />
      <Box x={14} y={50} w={236} h={124} r={6} tone="outline" d={0} />
      {card.map((line, i) => (
        <Text key={i} x={28} y={74 + i * 34} text={line} anchor="start" size={11.5} tone={i === 1 ? "heading" : "text"} d={200 + i * 200} />
      ))}
      {TASKS.map((t, i) => {
        const y = 40 + i * 58;
        return (
          <g key={i}>
            <Arrow pts={[[252, 112], [288, y + 22]]} tone="gold" d={900 + i * 150} dur={300} />
            <Box x={290} y={y} w={210} h={44} label={t.label} tone="slate" size={11.5} d={1000 + i * 150} />
            <Text x={526} y={y + 16} text={daysBi(t.days)} tone="gold" size={11} d={1600 + i * 150} />
          </g>
        );
      })}
      <Text x={395} y={222} text={bi(`Estimate: ${TOTAL_DAYS} days`, `التقدير: ${daysAr(TOTAL_DAYS)}`)} tone="gold" size={12.5} d={2200} />
      <Person x={50} y={196} label={bi("Customer", "العميل")} tone="gold" d={2500} />
      <Text x={80} y={214} text={bi("picks it for the next release", "يختارها للإصدار التالي")} anchor="start" tone="heading" size={11} d={2700} />
    </Svg>
  );
}

// ---------- XP practices ----------
type Principle = "increments" | "customer" | "people" | "change" | "simplicity";
const PRINCIPLE: Record<Principle, Bi> = {
  increments: bi("Incremental delivery", "التسليم التزايدي"),
  customer: bi("Customer involvement", "مشاركة العميل"),
  people: bi("People, not process", "الأشخاص لا العملية"),
  change: bi("Embrace change", "تقبُّل التغيير"),
  simplicity: bi("Maintain simplicity", "الحفاظ على البساطة"),
};
/** Each toggle option: a group of practices and the principle(s) they serve. */
const GROUPS: Record<string, Principle[]> = {
  planning: ["increments", "customer"],
  team: ["people"],
  code: ["change", "simplicity"],
};
const PRACTICES: { label: Bi; side: -1 | 1; row: number; serves: Principle[] }[] = [
  { label: bi("Incremental planning", "التخطيط التزايدي"), side: -1, row: 0, serves: ["increments"] },
  { label: bi("Small releases", "الإصدارات الصغيرة"), side: -1, row: 1, serves: ["increments", "change"] },
  { label: bi("On-site customer", "العميل في الموقع"), side: -1, row: 2, serves: ["customer"] },
  { label: bi("Sustainable pace", "الإيقاع المستدام"), side: -1, row: 3, serves: ["people"] },
  { label: bi("Simple design", "التصميم البسيط"), side: -1, row: 4, serves: ["simplicity"] },
  { label: bi("Test-first", "الاختبار أولًا"), side: 1, row: 0, serves: ["change"] },
  { label: bi("Refactoring", "إعادة الهيكلة"), side: 1, row: 1, serves: ["change", "simplicity"] },
  { label: bi("Continuous integration", "التكامل المستمر"), side: 1, row: 2, serves: ["change"] },
  { label: bi("Pair programming", "البرمجة الثنائية"), side: 1, row: 3, serves: ["people"] },
  { label: bi("Collective ownership", "الملكية الجماعية"), side: 1, row: 4, serves: ["people"] },
];
const CHIP = 11;
const chipW = (l: Bi) => l.en.length * CHIP * 0.6 + 22;
const rowY = (row: number) => 40 + row * 50;

function Practices({ control }: { control: string }) {
  const group = GROUPS[control] ?? GROUPS.planning;
  // One principle sits in the middle; two are stacked above and below it.
  const boxY = group.length === 1 ? [112] : [80, 152];
  let arrow = 0;
  return (
    <Svg>
      {PRACTICES.map((x, i) => {
        const on = x.serves.some((p) => group.includes(p));
        return <Chip key={i} x={x.side < 0 ? 100 : 460} y={rowY(x.row)} text={x.label} size={CHIP} tone={on ? "gold" : "muted"} center d={on ? 1100 + i * 60 : i * 50} />;
      })}
      {group.map((p, g) => {
        const midY = boxY[g] + 28;
        return (
          <g key={p}>
            {PRACTICES.filter((x) => x.serves.includes(p)).map((x) => {
              const cx = x.side < 0 ? 100 : 460;
              const edge = cx - x.side * (chipW(x.label) / 2 + 3);
              const d = 600 + arrow++ * 150;
              return <Arrow key={x.label.en} pts={[[x.side < 0 ? 200 : 360, midY], [edge, rowY(x.row)]]} tone="gold" d={d} dur={350} />;
            })}
            <Box x={200} y={boxY[g]} w={160} h={56} label={PRINCIPLE[p]} tone="navy" size={12} d={200 + g * 200} />
          </g>
        );
      })}
    </Svg>
  );
}

// ---------- Refactoring ----------
const CLASSES = ["Patient", "Doctor", "Nurse"];
const BARS = { patch: [18, 32, 52, 80, 116], refactor: [18, 22, 24, 26, 28] };

function Refactoring({ control }: { control: string }) {
  const refactor = control === "refactor";
  const bars = refactor ? BARS.refactor : BARS.patch;
  return (
    <Svg>
      {refactor ? (
        <>
          <Box x={96} y={40} w={98} h={30} r={0} label="Person" mono size={11.5} tone="navy" d={600} />
          <Box x={96} y={70} w={98} h={28} r={0} label="validate()" mono size={11} tone="gold" d={700} />
          {CLASSES.map((c, i) => (
            <Box key={c} x={20 + i * 86} y={150} w={78} h={30} r={0} label={c} mono size={11.5} tone="slate" d={i * 120} />
          ))}
          <Arrow pts={[[59, 148], [59, 124], [231, 124], [231, 148]]} tone="slate" head={false} d={900} dur={400} />
          <Arrow pts={[[145, 148], [145, 100]]} tone="slate" d={1000} dur={300} />
          <Text x={145} y={206} text={bi("one copy, shared by all three", "نسخة واحدة يتشاركها الثلاثة")} tone="success" size={11.5} d={1400} />
          <Chip x={145} y={252} text={bi("same behaviour: tests still pass", "السلوك نفسه: الاختبارات ما زالت تنجح")} tone="success" size={10.5} center d={1700} />
        </>
      ) : (
        <>
          {CLASSES.map((c, i) => (
            <g key={c}>
              <Box x={20 + i * 86} y={56} w={78} h={30} r={0} label={c} mono size={11.5} tone="slate" d={i * 120} />
              <Box x={20 + i * 86} y={86} w={78} h={28} r={0} label="validate()" mono size={11} tone="danger" d={400 + i * 200} />
            </g>
          ))}
          <Arrow pts={[[231, 116], [231, 136], [145, 136], [145, 118]]} tone="danger" dashed d={1100} />
          <Text x={145} y={172} text={bi("the same code, copied 3 times", "الشيفرة نفسها منسوخة 3 مرات")} tone="danger" size={11.5} d={1200} />
          <Text x={145} y={214} text={bi("every fix must be made 3 times", "كل إصلاح يجب أن يتم 3 مرات")} tone="muted" size={11} d={1400} />
        </>
      )}
      <Text x={423} y={26} text={bi("Effort per change, increments 1–5", "جهد كل تغيير في الزيادات 1–5")} tone="heading" size={11.5} d={0} />
      <Arrow pts={[[304, 226], [546, 226]]} tone="faint" head={false} d={100} dur={300} />
      {bars.map((h, i) => (
        <g key={i}>
          <Box x={316 + i * 46} y={226 - h} w={30} h={h} r={3} tone={refactor ? "success" : "danger"} d={300 + i * 250} />
          <Text x={331 + i * 46} y={240} text={`${i + 1}`} mono size={10.5} tone="muted" d={200} />
        </g>
      ))}
    </Svg>
  );
}

// ---------- Test-first ----------
function TestFirst({ control }: { control: string }) {
  if (control === "first") {
    return (
      <Svg>
        <Box x={190} y={28} w={180} h={68} label={bi("Write a failing test", "اكتب اختبارًا يفشل")} sub="test_dose.py" tone="danger" size={12} d={0} />
        <Box x={360} y={176} w={186} h={68} label={bi("Write code until it passes", "اكتب الشيفرة حتى ينجح")} sub="check_dose()" tone="success" size={12} d={200} />
        <Box x={14} y={176} w={176} h={68} label={bi("Refactor", "أعد الهيكلة")} sub={bi("tests stay green", "الاختبارات تبقى ناجحة")} tone="navy" size={12} d={400} />
        <Arrow pts={[[370, 62], [453, 62], [453, 174]]} tone="danger" d={600} />
        <Arrow pts={[[360, 210], [192, 210]]} tone="success" d={900} />
        <Arrow pts={[[102, 174], [102, 62], [188, 62]]} tone="navy" d={1200} />
        <Mark x={453} y={118} ok={false} d={1000} />
        <Text x={470} y={118} text={bi("run: fails", "تشغيل: يفشل")} anchor="start" tone="danger" size={11} d={1000} />
        <Text x={276} y={186} text={bi("run: passes", "تشغيل: ينجح")} tone="success" size={11} d={1300} />
        <Mark x={276} y={230} ok d={1300} />
        <Text x={94} y={118} text={bi("next test", "الاختبار التالي")} anchor="end" tone="muted" size={11} d={1500} />
        <Box x={150} y={110} w={260} h={26} r={6} label="check_dose(single_mg, per_day, safe)" mono size={11} tone="outline" d={1600} />
        <Text x={280} y={150} text={bi("the test defines the interface", "الاختبار يحدد الواجهة")} tone="muted" size={11} d={1700} />
        <Token
          pts={[
            [330, 210],
            [102, 210],
            [102, 62],
            [453, 62],
            [453, 210],
            [330, 210],
          ]}
          d={1900}
          dur={4200}
        />
      </Svg>
    );
  }
  const stories = [0, 1, 2, 3];
  return (
    <Svg>
      <Text x={40} y={82} text={bi("Code", "الشيفرة")} tone="heading" size={12} d={0} />
      <Text x={40} y={160} text={bi("Tests", "الاختبارات")} tone="heading" size={12} d={0} />
      {stories.map((i) => (
        <Box key={i} x={80 + i * 100} y={60} w={90} h={44} label={bi(`Story ${i + 1}`, `القصة ${i + 1}`)} tone="slate" size={11.5} d={i * 350} />
      ))}
      <Box x={280} y={138} w={90} h={44} label={bi("Tests 1", "اختبارات 1")} tone="outline" size={11.5} d={900} />
      <Box x={380} y={138} w={90} h={44} label={bi("Tests 2", "اختبارات 2")} tone="outline" size={11.5} d={1250} />
      <Box x={480} y={138} w={66} h={44} label="3, 4 ?" mono size={11.5} tone="ghost" dashed d={1500} />
      <Arrow pts={[[125, 200], [325, 200]]} tone="danger" both d={1700} label={bi("test lag", "تأخر الاختبار")} labelAt={[225, 218]} labelTone="danger" />
      <Chip x={440} y={248} text={bi("bugs found late", "أخطاء تُكتشف متأخرًا")} tone="danger" center d={2100} />
      <Mark x={524} y={248} ok={false} d={2300} />
    </Svg>
  );
}

// ---------- Pair programming ----------
function Pairs({ control }: { control: string }) {
  if (control === "team") {
    const days = [
      ["A + B", "C + D"],
      ["A + C", "B + D"],
      ["A + D", "B + C"],
    ];
    return (
      <Svg>
        {days.map((pairs, i) => {
          const x = 110 + i * 170;
          return (
            <g key={i}>
              <Text x={x} y={26} text={bi(`Day ${i + 1}`, `اليوم ${i + 1}`)} tone="heading" size={12} d={i * 500} />
              {pairs.map((p, j) => (
                <Box key={j} x={x - 60} y={56 + j * 50} w={120} h={40} label={p} mono size={13} tone="slate" d={i * 500 + 100 + j * 100} />
              ))}
            </g>
          );
        })}
        <Arrow pts={[[172, 101], [218, 101]]} tone="muted" d={450} dur={250} />
        <Arrow pts={[[342, 101], [388, 101]]} tone="muted" d={950} dur={250} />
        <Box x={60} y={168} w={440} h={44} label={bi("Everyone has paired with everyone", "كل فرد عمل مع الجميع")} tone="success" size={12.5} d={1700} />
        <Mark x={500} y={168} ok d={1900} />
        <Chip x={160} y={248} text={bi("Collective ownership", "الملكية الجماعية")} tone="gold" center d={2100} />
        <Chip x={400} y={248} text={bi("Knowledge spreads", "تنتشر المعرفة")} tone="gold" center d={2300} />
      </Svg>
    );
  }
  const code = ["def check_dose(mg, n, safe):", "    total = mg * n", "    lo, hi = safe", "    return lo <= total <= hi"];
  return (
    <Svg>
      <Box x={200} y={30} w={220} h={140} r={8} tone="outline" d={0} />
      <Box x={290} y={170} w={40} h={12} r={2} tone="muted" d={0} />
      {code.map((line, i) => (
        <g key={i}>
          <Text x={214} y={54 + i * 28} text={line} anchor="start" mono size={11} tone="text" d={300 + i * 400} />
          <Mark x={436} y={54 + i * 28} ok r={8} d={500 + i * 400} />
        </g>
      ))}
      <Person x={275} y={196} label="A" size={12} d={100} />
      <Person x={345} y={196} label="B" size={12} d={150} />
      <Chip x={500} y={110} w={84} text={bi("seen by 2", "يراه اثنان")} tone="success" center d={2200} />
      <Chip x={100} y={70} text={bi("Review", "المراجعة")} tone="gold" center d={2300} />
      <Chip x={100} y={124} text={bi("Idea sharing", "تبادل الأفكار")} tone="gold" center d={2450} />
      <Chip x={100} y={200} text={bi("cheaper than inspections", "أرخص من الفحوص الرسمية")} tone="muted" size={10.5} center d={2600} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof xp>>({
  "release-cycle": ReleaseCycle,
  stories: Stories,
  practices: Practices,
  refactoring: Refactoring,
  "test-first": TestFirst,
  pairs: Pairs,
});
