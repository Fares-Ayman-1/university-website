"use client";

import type { softwareProcess } from "@/lib/walkthroughs/software-engineering/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Fade, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function Activities() {
  const steps = [
    { x: 30, y: 44, label: bi("1 · Specification", "1 · التوصيف"), sub: bi("what it must do", "ما يجب أن تفعله") },
    { x: 330, y: 44, label: bi("2 · Design & implementation", "2 · التصميم والتنفيذ"), sub: bi("build it", "بناؤها") },
    { x: 330, y: 180, label: bi("3 · Validation", "3 · التحقق من الصلاحية"), sub: bi("is it what the customer wants?", "هل هي ما يريده العميل؟") },
    { x: 30, y: 180, label: bi("4 · Evolution", "4 · التطور"), sub: bi("change it as needs change", "تعديلها مع تغيّر الاحتياجات") },
  ];
  return (
    <Svg>
      {/* Drawn first, so the boxes hide it: it shows only on the arrows between activities. */}
      <Token pts={[[130, 79], [430, 79], [430, 215], [130, 215], [130, 79]]} d={1900} dur={4200} />
      {steps.map((s, i) => (
        <Box key={i} x={s.x} y={s.y} w={200} h={70} label={s.label} sub={s.sub} tone="navy" size={12} d={i * 350} />
      ))}
      <Arrow pts={[[232, 79], [326, 79]]} d={300} dur={300} />
      <Arrow pts={[[430, 116], [430, 176]]} d={650} dur={300} />
      <Arrow pts={[[328, 215], [234, 215]]} d={1000} dur={300} />
      <Arrow pts={[[130, 178], [130, 118]]} tone="gold" d={1350} dur={300} width={2.4} label={bi("new needs", "احتياجات جديدة")} labelAt={[184, 140]} labelTone="gold" />
      <Text x={280} y={147} text={bi("repeats", "تتكرر")} size={11.5} tone="muted" d={1600} />
    </Svg>
  );
}

function Description() {
  return (
    <Svg>
      <Person x={230} y={18} d={600} />
      <Arrow pts={[[230, 60], [230, 74]]} tone="slate" dashed head={false} d={700} />
      <Text x={254} y={32} text={bi("Role: software architect", "الدور: مصمم المعمارية")} anchor="start" size={11.5} tone="slate" d={700} />
      <Text x={85} y={52} text={bi("Order", "الترتيب")} size={11.5} tone="muted" d={0} />
      <Box x={20} y={76} w={130} h={48} label={bi("Specification", "التوصيف")} tone="muted" size={12} d={0} />
      <Box x={195} y={76} w={170} h={48} label={bi("Architectural design", "التصميم المعماري")} tone="navy" size={12.5} d={150} />
      <Box x={410} y={76} w={130} h={48} label={bi("Implementation", "التنفيذ")} tone="muted" size={12} d={300} />
      <Arrow pts={[[152, 100], [193, 100]]} d={200} dur={250} />
      <Arrow pts={[[367, 100], [408, 100]]} d={350} dur={250} />
      <Arrow pts={[[280, 126], [280, 146]]} tone="gold" d={1000} dur={250} />
      <Doc x={220} y={150} w={120} h={96} label={bi("Product", "الناتج")} sub={bi("architecture model", "نموذج المعمارية")} tone="gold" d={1100} />
      <Arrow pts={[[105, 174], [170, 106]]} tone="slate" dashed head={false} d={1500} />
      <Box x={20} y={176} w={170} h={70} label={bi("Pre-condition", "الشرط المسبق")} sub={bi("requirements approved", "المتطلبات معتمدة")} tone="slate" size={12} d={1500} />
      <Arrow pts={[[455, 174], [390, 106]]} tone="slate" dashed head={false} d={1800} />
      <Box x={370} y={176} w={170} h={70} label={bi("Post-condition", "الشرط اللاحق")} sub={bi("model reviewed", "تمت مراجعة النموذج")} tone="slate" size={12} d={1800} />
    </Svg>
  );
}

const PLAN = [
  { label: bi("Specification", "التوصيف"), sub: bi("month 1", "الشهر 1") },
  { label: bi("Design", "التصميم"), sub: bi("month 2", "الشهر 2") },
  { label: bi("Implementation", "التنفيذ"), sub: bi("months 3–4", "الشهران 3 و4") },
  { label: bi("Validation", "التحقق"), sub: bi("months 5–6", "الشهران 5 و6") },
];
const REDO = [bi("revisit", "مراجعة"), bi("revisit", "مراجعة"), bi("partly redone", "إعادة جزئية")];

function PlanAgile({ control }: { control: string }) {
  if (control === "agile") {
    const cycles = [
      { tone: "success", sub: bi("done", "انتهت") },
      { tone: "success", sub: bi("done", "انتهت") },
      { tone: "gold", sub: bi("now", "الآن") },
      { tone: "outline", sub: bi("next", "التالية") },
      { tone: "ghost", sub: bi("not planned yet", "لم تُخطَّط بعد") },
    ] as const;
    return (
      <Svg>
        <Text x={280} y={18} text={bi("Only the next cycle is planned in detail", "لا تُخطَّط بالتفصيل إلا الدورة التالية")} size={12} tone="heading" d={0} />
        {cycles.map((c, i) => (
          <Box key={i} x={20 + i * 106} y={48} w={96} h={68} label={bi(`Cycle ${i + 1}`, `الدورة ${i + 1}`)} sub={c.sub} tone={c.tone} dashed={c.tone === "ghost"} size={12} d={i * 200} />
        ))}
        <Chip x={386} y={214} text={bi("requirement change", "تغيير في المتطلبات")} tone="danger" center d={1100} />
        <Arrow pts={[[386, 194], [386, 120]]} tone="danger" d={1300} />
        <Fade d={1800}>
          <Box x={338} y={48} w={96} h={68} label={bi("Cycle 4", "الدورة 4")} sub={bi("+ the change", "+ التغيير")} tone="warn" size={12} />
        </Fade>
        <Text x={126} y={146} text={bi("nothing to redo", "لا شيء يُعاد")} tone="success" size={12} d={2200} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Text x={280} y={18} text={bi("The whole plan is made on day 1", "الخطة كلها تُوضع في اليوم الأول")} size={12} tone="heading" d={0} />
      {PLAN.map((p, i) => (
        <Box key={i} x={30 + i * 100} y={48} w={98} h={68} label={p.label} sub={p.sub} tone="navy" size={12} d={i * 200} />
      ))}
      <Arrow pts={[[30, 134], [250, 134]]} tone="success" head={false} width={4} d={900} dur={700} />
      <Token pts={[[30, 134], [250, 134]]} tone="success" d={900} dur={700} />
      <Text x={140} y={152} text={bi("progress, measured against the plan", "التقدم مقيسًا مقارنةً بالخطة")} tone="success" size={11} d={1200} />
      <Chip x={250} y={214} text={bi("requirement change", "تغيير في المتطلبات")} tone="danger" center d={1400} />
      <Arrow pts={[[250, 194], [250, 120]]} tone="danger" d={1600} />
      {REDO.map((sub, i) => (
        <Fade key={i} d={2000 + i * 200}>
          <Box x={30 + i * 100} y={48} w={98} h={68} label={PLAN[i].label} sub={sub} tone="warn" size={12} />
        </Fade>
      ))}
      <Box x={432} y={48} w={100} h={68} label={bi("Delay", "تأخير")} sub={bi("past month 6", "بعد الشهر 6")} tone="danger" dashed size={12} d={2700} />
    </Svg>
  );
}

function Balance() {
  return (
    <Svg>
      <Box x={20} y={46} w={130} h={48} label={bi("Plan-driven", "موجَّه بالخطة")} tone="navy" d={0} />
      <Box x={410} y={46} w={130} h={48} label={bi("Agile", "رشيق")} tone="gold" d={0} />
      <Arrow pts={[[156, 70], [404, 70]]} both d={200} />
      <Text x={20} y={116} text={bi("stable, well-understood requirements", "متطلبات مستقرة ومفهومة جيدًا")} anchor="start" size={11} tone="muted" d={400} />
      <Text x={540} y={116} text={bi("requirements that keep changing", "متطلبات تتغير باستمرار")} anchor="end" size={11} tone="muted" d={400} />
      <Token pts={[[160, 70], [276, 70]]} tone="navy" d={800} dur={900} />
      <Token pts={[[400, 70], [284, 70]]} d={800} dur={900} />
      <Arrow pts={[[280, 80], [280, 146]]} tone="faint" dashed d={1600} />
      <Box x={190} y={150} w={180} h={48} label={bi("Large system", "نظام كبير")} tone="slate" d={1700} />
      <Arrow pts={[[236, 200], [168, 218]]} d={2000} dur={300} />
      <Arrow pts={[[280, 200], [280, 218]]} d={2000} dur={300} />
      <Arrow pts={[[324, 200], [392, 218]]} d={2000} dur={300} />
      <Chip x={160} y={238} w={110} text={bi("Waterfall", "الشلال")} tone="outline" center d={2200} />
      <Chip x={280} y={238} w={110} text={bi("Incremental", "التزايدي")} tone="outline" center d={2300} />
      <Chip x={400} y={238} w={110} text={bi("Reuse", "إعادة الاستخدام")} tone="outline" center d={2400} />
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof softwareProcess>>({
  activities: Activities,
  description: Description,
  "plan-agile": PlanAgile,
  balance: Balance,
});
