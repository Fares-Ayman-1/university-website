"use client";

import type { reProcess } from "@/lib/walkthroughs/software-engineering/lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Fade, Mark, Person, Svg, Text, Token, type Pt, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

const FEASIBILITY = bi("Feasibility study", "دراسة الجدوى");
const ELICITATION = bi("Elicitation and analysis", "الاستنباط والتحليل");
const SPECIFICATION = bi("Specification", "التوصيف");
const VALIDATION = bi("Validation", "التحقق من الصلاحية");

/** Points on a circular arc (degrees, clockwise on screen), for drawing a curved arrow. */
function arc(cx: number, cy: number, r: number, from: number, to: number, step = 15): Pt[] {
  const pts: Pt[] = [];
  for (let a = from; a <= to; a += step) pts.push([cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)]);
  return pts;
}

function Process({ control }: { control: string }) {
  if (control === "iterative") {
    const loop: Pt[] = [
      [298, 48],
      [455, 48],
      [455, 222],
      [135, 222],
      [135, 100],
      [250, 100],
      [250, 48],
    ];
    return (
      <Svg>
        <Box x={16} y={26} w={150} h={44} label={FEASIBILITY} tone="slate" size={12} d={0} />
        <Arrow pts={[[168, 48], [196, 48]]} tone="slate" d={200} dur={250} />
        <Box x={200} y={26} w={196} h={44} label={ELICITATION} tone="navy" size={12} d={300} />
        <Box x={370} y={200} w={170} h={44} label={SPECIFICATION} tone="navy" size={12} d={450} />
        <Box x={50} y={200} w={170} h={44} label={VALIDATION} tone="navy" size={12} d={600} />
        <Arrow pts={[[398, 48], [455, 48], [455, 196]]} tone="gold" d={700} />
        <Arrow pts={[[368, 222], [222, 222]]} tone="gold" d={900} />
        <Arrow pts={[[135, 198], [135, 100], [250, 100], [250, 74]]} tone="gold" d={1100} />
        <Text x={128} y={150} text={bi("gap found", "فجوة مكتشفة")} anchor="end" tone="danger" size={11} d={1300} />
        <Box x={270} y={112} w={120} h={68} label={bi("Document", "الوثيقة")} sub={bi("draft 1", "المسودة 1")} tone="outline" size={12} d={600} />
        <Fade d={3300}>
          <Box x={270} y={112} w={120} h={68} label={bi("Document", "الوثيقة")} sub={bi("draft 2", "المسودة 2")} tone="outline" size={12} />
        </Fade>
        <Fade d={5800}>
          <Box x={270} y={112} w={120} h={68} label={bi("Document", "الوثيقة")} sub={bi("draft 3", "المسودة 3")} tone="gold" size={12} />
        </Fade>
        <Token pts={[...loop, ...loop, [298, 48], [455, 48], [455, 130]]} d={800} dur={5600} />
      </Svg>
    );
  }
  const steps: [Bi, Bi][] = [
    [FEASIBILITY, bi("Feasibility report", "تقرير الجدوى")],
    [ELICITATION, bi("System models", "نماذج النظام")],
    [SPECIFICATION, bi("User and system requirements", "متطلبات المستخدم والنظام")],
    [VALIDATION, bi("Requirements document", "وثيقة المتطلبات")],
  ];
  const ys = [14, 80, 146, 212];
  return (
    <Svg>
      {steps.map(([activity, output], i) => (
        <g key={i}>
          <Box x={40} y={ys[i]} w={210} h={44} label={activity} tone="navy" size={12} d={i * 450} />
          {i < 3 ? <Arrow pts={[[145, ys[i] + 46], [145, ys[i + 1] - 2]]} tone="gold" d={i * 450 + 250} dur={200} /> : null}
          <Arrow pts={[[252, ys[i] + 22], [316, ys[i] + 22]]} tone="faint" d={i * 450 + 150} dur={250} />
          <Box x={320} y={ys[i]} w={220} h={44} label={output} tone={i === 3 ? "gold" : "outline"} size={12} d={i * 450 + 300} />
        </g>
      ))}
      <Token pts={[[145, 36], [145, 234], [316, 234]]} d={300} dur={1800} />
    </Svg>
  );
}

function Elicitation() {
  const steps: { x: number; y: number; label: Bi; sub: Bi }[] = [
    { x: 30, y: 22, label: bi("1 · Discovery", "1 · الاكتشاف"), sub: bi("from stakeholders", "من أصحاب المصلحة") },
    { x: 340, y: 22, label: bi("2 · Classify, organize", "2 · التصنيف والتنظيم"), sub: bi("related ones into clusters", "المترابطة في مجموعات") },
    { x: 340, y: 190, label: bi("3 · Prioritize, negotiate", "3 · الترتيب والتفاوض"), sub: bi("rank, settle conflicts", "الترتيب وحسم التعارضات") },
    { x: 30, y: 190, label: bi("4 · Document", "4 · التوثيق"), sub: bi("input to the next round", "مُدخل للجولة التالية") },
  ];
  const round: Pt[] = [
    [125, 56],
    [435, 56],
    [435, 224],
    [125, 224],
  ];
  return (
    <Svg>
      {steps.map((s, i) => (
        <Box key={i} x={s.x} y={s.y} w={190} h={68} label={s.label} sub={s.sub} tone={i === 0 ? "gold" : "slate"} size={12} d={i * 300} />
      ))}
      <Arrow pts={[[222, 56], [336, 56]]} tone="gold" d={300} />
      <Arrow pts={[[435, 92], [435, 186]]} tone="gold" d={600} />
      <Arrow pts={[[338, 224], [224, 224]]} tone="gold" d={900} />
      <Arrow pts={[[125, 188], [125, 94]]} tone="gold" d={1200} />
      <Arrow pts={arc(280, 140, 32, -50, 235)} tone="muted" d={1400} dur={700} />
      <Text x={280} y={134} text={bi("repeat", "كرّر")} tone="gold" size={12} d={1600} />
      <Token pts={[...round, ...round, [125, 56], [280, 56]]} d={1500} dur={6300} />
    </Svg>
  );
}

function Interviews() {
  const closed = [bi("How many patients a day?", "كم مريضًا في اليوم؟"), bi("Which clinics will use it?", "ما العيادات التي ستستخدمه؟")];
  const open = [bi("Describe a normal day.", "صِف يوم عمل عاديًا."), bi("Why is that step slow?", "لماذا تتأخر هذه الخطوة؟")];
  return (
    <Svg>
      <Person x={60} y={26} label={bi("Analyst", "المحلل")} d={0} />
      <Person x={500} y={26} label={bi("Stakeholder", "صاحب المصلحة")} d={150} />
      <Arrow pts={[[90, 48], [470, 48]]} tone="gold" both d={300} />
      <Text x={180} y={118} text={bi("Closed: a fixed list", "مغلقة: قائمة ثابتة")} tone="heading" size={12} d={500} />
      <Text x={420} y={118} text={bi("Open: explore issues", "مفتوحة: استكشاف القضايا")} tone="heading" size={12} d={900} />
      {closed.map((q, i) => (
        <Chip key={i} x={180} y={160 + i * 42} w={200} text={q} tone="slate" center d={650 + i * 150} />
      ))}
      {open.map((q, i) => (
        <Chip key={i} x={420} y={160 + i * 42} w={200} text={q} tone="outline" center d={1050 + i * 150} />
      ))}
      <Chip x={280} y={252} w={190} text={bi("usually a mix of both", "عادةً مزيج من الاثنين")} tone="gold" center d={1500} />
    </Svg>
  );
}

function Scenarios() {
  const rows: [Bi, Bi][] = [
    [bi("1 · Start", "1 · البداية"), bi("Patient registered; a nurse is logged on", "المريض مسجَّل، والممرضة مسجِّلة الدخول")],
    [bi("2 · Normal flow", "2 · المسار الطبيعي"), bi("Find the patient by name, add the history", "البحث عن المريض بالاسم وإضافة تاريخه الطبي")],
    [bi("3 · What can go wrong", "3 · ما قد يحدث من خطأ"), bi("No record found? The nurse creates one", "لا يوجد سجل؟ تُنشئ الممرضة سجلًا جديدًا")],
    [bi("4 · Other activities", "4 · الأنشطة الأخرى"), bi("Others may view, not edit, the record", "يمكن للآخرين عرض السجل دون تعديله")],
    [bi("5 · End state", "5 · الحالة النهائية"), bi("History saved; the session is logged", "حُفظ التاريخ الطبي وسُجِّلت الجلسة")],
  ];
  return (
    <Svg>
      {rows.map(([step, example], i) => {
        const y = 12 + i * 52;
        const wrong = i === 2;
        return (
          <g key={i}>
            <Box x={16} y={y} w={168} h={44} label={step} tone={wrong ? "warn" : "navy"} size={12} d={i * 300} />
            <Box x={200} y={y} w={344} h={44} label={example} tone={wrong ? "warn" : "outline"} size={11.5} d={i * 300 + 150} />
          </g>
        );
      })}
      <Token pts={[[192, 34], [192, 242]]} d={300} dur={1500} />
    </Svg>
  );
}

function Ethnography() {
  return (
    <Svg>
      <Person x={56} y={102} label={bi("Analyst watches", "المحلل يراقب")} d={0} />
      <Box
        x={150}
        y={16}
        w={360}
        h={68}
        label={bi("What the procedure says", "ما تقوله الإجراءات")}
        sub={bi("receptionists book every visit on screen", "يحجز موظفو الاستقبال كل زيارة على الشاشة")}
        tone="outline"
        size={12.5}
        d={200}
      />
      <Box
        x={150}
        y={110}
        w={360}
        h={68}
        label={bi("What people actually do", "ما يفعله الناس فعلًا")}
        sub={bi("they also keep a paper list of walk-ins", "ويحتفظون أيضًا بقائمة ورقية لمن يأتون دون موعد")}
        tone="slate"
        size={12.5}
        d={700}
      />
      <Arrow pts={[[84, 128], [146, 142]]} tone="gold" d={500} />
      <Mark x={528} y={97} ok={false} d={1200} />
      <Arrow pts={[[330, 180], [330, 200]]} tone="gold" d={1400} dur={200} />
      <Box
        x={150}
        y={202}
        w={360}
        h={68}
        label={bi("Implicit requirement found", "متطلب ضمني مكتشف")}
        sub={bi("support patients without appointments", "دعم المرضى القادمين دون موعد")}
        tone="gold"
        size={12.5}
        d={1500}
      />
    </Svg>
  );
}

function Discovery({ control }: { control: string }) {
  if (control === "scenarios") return <Scenarios />;
  if (control === "ethnography") return <Ethnography />;
  return <Interviews />;
}

function Srs() {
  const readers = [
    bi("Customers: check their needs", "العملاء: التحقق من احتياجاتهم"),
    bi("Managers: plan bid and process", "المديرون: تخطيط العطاء والعملية"),
    bi("System engineers: what to build", "مهندسو النظام: ما يجب بناؤه"),
    bi("Test engineers: derive tests", "مهندسو الاختبار: اشتقاق الاختبارات"),
    bi("Maintainers: understand parts", "مهندسو الصيانة: فهم الأجزاء"),
  ];
  return (
    <Svg>
      <Box x={16} y={56} w={150} h={44} label={bi("User requirements", "متطلبات المستخدم")} tone="slate" size={12} d={0} />
      <Box x={16} y={140} w={150} h={44} label={bi("System requirements", "متطلبات النظام")} tone="slate" size={12} d={150} />
      <Text x={91} y={200} text={bi("may be a separate document", "قد تكون وثيقة منفصلة")} tone="muted" size={10.5} d={300} />
      <Arrow pts={[[168, 78], [194, 106]]} tone="gold" d={400} dur={250} />
      <Arrow pts={[[168, 162], [194, 142]]} tone="gold" d={500} dur={250} />
      <Doc x={198} y={60} w={110} h={130} label="SRS" sub={bi("official statement", "البيان الرسمي")} tone="gold" size={16} d={600} />
      <Arrow pts={[[253, 192], [253, 214]]} tone="faint" d={900} dur={200} />
      <Chip x={253} y={236} w={160} text={bi("part of the contract", "جزء من العقد")} tone="outline" center d={1000} />
      {readers.map((r, i) => {
        const cy = 34 + i * 52;
        return (
          <g key={i}>
            <Arrow pts={[[310, 125], [342, cy]]} tone="gold" d={1100 + i * 150} dur={300} />
            <Box x={344} y={cy - 22} w={200} h={44} label={r} tone="outline" size={11} d={1200 + i * 150} />
          </g>
        );
      })}
    </Svg>
  );
}

const CHECKS: { check: Bi; draft: Bi; fixed: Bi }[] = [
  { check: bi("Validity", "الصلاحية"), draft: bi("R1: paper reports nobody asked for", "R1: تقارير ورقية لم يطلبها أحد"), fixed: bi("R1: on-screen reports, as managers asked", "R1: تقارير على الشاشة كما طلب المديرون") },
  { check: bi("Consistency", "الاتساق"), draft: bi("R2 and R4 disagree on who edits records", "يختلف R2 و R4 في من يعدّل السجلات"), fixed: bi("R2 and R4 agree: nurses may edit records", "اتفق R2 و R4: يحق للممرضين تعديل السجلات") },
  { check: bi("Completeness", "الاكتمال"), draft: bi("Nothing says how to cancel a visit", "لا شيء يذكر كيفية إلغاء الزيارة"), fixed: bi("R5 added: cancel a visit", "أُضيف R5: إلغاء الزيارة") },
  { check: bi("Realism", "الواقعية"), draft: bi("R3: answer every search in 1 ms", "R3: الرد على كل بحث خلال 1 ms"), fixed: bi("R3: search results within 2 s", "R3: نتائج البحث خلال 2 s") },
];

function Validation({ control }: { control: string }) {
  const fixed = control === "fixed";
  return (
    <Svg>
      {CHECKS.map((c, i) => {
        const y = 20 + i * 62;
        return (
          <g key={i}>
            <Box x={16} y={y} w={150} h={48} label={c.check} tone="navy" size={12.5} d={i * 300} />
            <Arrow pts={[[168, y + 24], [180, y + 24]]} tone="faint" head={false} d={i * 300 + 100} dur={150} />
            <Box x={182} y={y} w={330} h={48} label={fixed ? c.fixed : c.draft} tone={fixed ? "success" : "danger"} size={11.5} d={i * 300 + 150} />
            <Mark x={532} y={y + 24} ok={fixed} d={i * 300 + 400} />
          </g>
        );
      })}
    </Svg>
  );
}

function Techniques({ control }: { control: string }) {
  if (control === "prototype") {
    return (
      <Svg>
        <Box x={150} y={24} w={240} h={160} r={10} tone="outline" d={0} />
        <Text x={270} y={42} text={bi("Prototype", "نموذج أولي")} tone="heading" size={12} d={100} />
        <Box x={170} y={72} w={200} h={30} r={6} label="Clinic: A ▾" mono size={11.5} tone="warn" d={300} />
        <Box x={170} y={110} w={200} h={30} r={6} label="Name: Ali Hassan" mono size={11.5} tone="outline" d={450} />
        <Box x={170} y={148} w={200} h={26} r={4} label="0 results" mono size={11} tone="muted" d={600} />
        <Person x={490} y={50} label={bi("Receptionist", "موظفة الاستقبال")} d={200} />
        <Arrow pts={[[392, 100], [464, 78]]} tone="gold" d={800} label={bi("tries it", "تجرّبه")} labelAt={[424, 112]} labelTone="gold" />
        <Arrow pts={[[490, 128], [490, 186]]} tone="danger" d={1200} dur={300} />
        <Chip x={420} y={208} w={220} text={bi("I need every clinic at once!", "أحتاج كل العيادات معًا!")} tone="danger" center d={1400} />
        <Arrow pts={[[310, 208], [160, 208], [160, 224]]} tone="gold" d={1800} />
        <Box x={20} y={226} w={280} h={44} label={bi("R1 revised: search all clinics", "R1 بعد التعديل: البحث في كل العيادات")} tone="gold" size={12} d={2100} />
      </Svg>
    );
  }
  const issues: { x: number; text: Bi }[] = [
    { x: 120, text: bi("ambiguous term", "مصطلح غامض") },
    { x: 280, text: bi("conflict R2–R4", "تعارض بين R2 و R4") },
    { x: 440, text: bi("missing function", "وظيفة ناقصة") },
  ];
  const reviewers: { x: number; label: Bi; tone: Tone; to: Pt[] }[] = [
    { x: 90, label: bi("Customer", "العميل"), tone: "slate", to: [[118, 84], [220, 96]] },
    { x: 470, label: bi("Developer", "المطوّر"), tone: "slate", to: [[442, 84], [340, 96]] },
  ];
  return (
    <Svg>
      <Doc x={225} y={36} w={110} h={124} label="SRS" sub={bi("draft", "مسودة")} tone="outline" size={16} d={0} />
      {reviewers.map((r, i) => (
        <g key={i}>
          <Person x={r.x} y={50} label={r.label} tone={r.tone} d={200 + i * 150} />
          <Arrow pts={r.to} tone="gold" d={500 + i * 150} label={i === 0 ? bi("read", "يقرأ") : undefined} labelAt={[166, 62]} labelTone="gold" />
        </g>
      ))}
      {issues.map((s, i) => (
        <g key={i}>
          <Arrow pts={s.x === 280 ? [[280, 162], [280, 204]] : [[280, 162], [280, 182], [s.x, 182], [s.x, 204]]} tone="danger" d={1000 + i * 200} dur={350} />
          <Chip x={s.x} y={226} w={140} text={s.text} tone="danger" center d={1200 + i * 200} />
        </g>
      ))}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof reProcess>>({
  process: Process,
  elicitation: Elicitation,
  discovery: Discovery,
  srs: Srs,
  validation: Validation,
  techniques: Techniques,
});
