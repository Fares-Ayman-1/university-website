"use client";

import type { change } from "@/lib/walkthroughs/software-engineering/lecture-02";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Fade, Mark, Person, Svg, Text, Token, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function Rework() {
  const sources = [bi("Business changes", "تغيّر بيئة العمل"), bi("New technologies", "تقنيات جديدة"), bi("Platform changes", "تغيّر المنصات")];
  return (
    <Svg>
      {sources.map((s, i) => (
        <Box key={i} x={16} y={40 + i * 78} w={160} h={44} label={s} tone="slate" size={12} d={i * 200} />
      ))}
      <Arrow pts={[[178, 62], [214, 122]]} d={600} dur={300} />
      <Arrow pts={[[178, 140], [214, 140]]} d={650} dur={300} />
      <Arrow pts={[[178, 218], [214, 158]]} d={700} dur={300} />
      <Token pts={[[178, 140], [240, 140]]} d={1000} dur={500} />
      <Box x={216} y={110} w={110} h={60} label={bi("Change", "التغيير")} tone="navy" size={14} d={800} />
      <Arrow pts={[[328, 140], [366, 140]]} d={1300} dur={250} />
      <Token pts={[[328, 140], [396, 140]]} d={1500} dur={500} />
      <Text x={455} y={36} text={bi("cost of the change", "تكلفة التغيير")} size={11.5} tone="heading" d={1500} />
      <Box x={370} y={64} w={170} h={72} label={bi("Rework", "إعادة العمل")} sub={bi("re-analyse, redesign…", "إعادة التحليل والتصميم…")} tone="warn" d={1700} />
      <Box x={370} y={140} w={170} h={72} label={bi("New functionality", "الوظائف الجديدة")} sub={bi("the change itself", "التغيير نفسه")} tone="gold" d={1900} />
      <Text x={455} y={236} text={bi("rework is the part to reduce", "إعادة العمل هي ما يجب تقليله")} size={11} tone="muted" d={2300} />
    </Svg>
  );
}

function TwoWays({ control }: { control: string }) {
  if (control === "tolerate") {
    const floors: { tone: Tone; side: ReturnType<typeof bi> }[] = [
      { tone: "success", side: bi("done", "انتهت") },
      { tone: "success", side: bi("done", "انتهت") },
      { tone: "gold", side: bi("now", "الآن") },
      { tone: "ghost", side: bi("not built yet", "لم تُبنَ بعد") },
    ];
    const y = (k: number) => 212 - k * 46;
    return (
      <Svg>
        <Text x={280} y={24} text={bi("Absorb the change in a later increment", "استوعب التغيير في زيادة لاحقة")} size={12} tone="heading" d={0} />
        {floors.map((f, k) => (
          <g key={k}>
            <Box x={150} y={y(k)} w={180} h={44} label={bi(`Increment ${k + 1}`, `الزيادة ${k + 1}`)} tone={f.tone} dashed={f.tone === "ghost"} size={12} d={200 + k * 200} />
            <Text x={140} y={y(k) + 22} text={f.side} anchor="end" size={11} tone="muted" d={200 + k * 200} />
          </g>
        ))}
        <Chip x={452} y={96} text={bi("late change", "تغيير متأخر")} tone="danger" center d={1100} />
        <Arrow pts={[[401, 96], [334, 96]]} tone="danger" d={1300} dur={300} />
        <Fade d={1700}>
          <Box x={150} y={y(3)} w={180} h={44} label={bi("Increment 4 + change", "الزيادة 4 + التغيير")} tone="warn" size={12} />
        </Fade>
        <Mark x={346} y={y(0) + 22} ok r={9} d={2000} />
        <Mark x={346} y={y(1) + 22} ok r={9} d={2100} />
        <Text x={364} y={211} text={bi("untouched", "دون تغيير")} anchor="start" size={11} tone="success" d={2200} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Token pts={[[244, 120], [312, 120]]} d={1700} dur={600} />
      <Token pts={[[382, 120], [440, 120]]} d={2300} dur={500} />
      <Text x={280} y={26} text={bi("Find the change before building", "اكتشف التغيير قبل البناء")} size={12} tone="heading" d={0} />
      <Box x={16} y={96} w={120} h={48} label={bi("Prototype", "نموذج أولي")} tone="gold" d={0} />
      <Arrow pts={[[138, 120], [180, 120]]} d={400} dur={250} />
      <Person x={212} y={92} label={bi("Customer", "العميل")} d={500} />
      <Chip x={212} y={200} text={bi("change found early", "اكتُشف التغيير مبكرًا")} tone="warn" center d={1200} />
      <Arrow pts={[[244, 120], [284, 120]]} d={1400} dur={250} />
      <Doc x={288} y={80} w={92} h={80} label={bi("Requirements", "المتطلبات")} sub={bi("updated", "حُدِّثت")} tone="outline" d={1500} />
      <Arrow pts={[[382, 120], [412, 120]]} d={2000} dur={200} />
      <Box x={414} y={92} w={126} h={56} label={bi("Development", "التطوير")} tone="navy" d={2100} />
      <Mark x={477} y={176} ok r={10} d={2600} />
      <Text x={477} y={200} text={bi("no rework", "دون إعادة عمل")} size={11} tone="success" d={2700} />
    </Svg>
  );
}

const STAGES = [bi("Set objectives", "تحديد الأهداف"), bi("Define functions", "تحديد الوظائف"), bi("Develop prototype", "تطوير النموذج"), bi("Evaluate prototype", "تقييم النموذج")];
const OUTPUTS = [bi("Prototyping plan", "خطة النموذج الأولي"), bi("Outline definition", "تعريف مبدئي"), bi("Executable prototype", "نموذج قابل للتنفيذ"), bi("Evaluation report", "تقرير التقييم")];

function Prototype() {
  const x = (i: number) => 8 + i * 140;
  return (
    <Svg>
      <Token pts={STAGES.map((_, i) => [x(i) + 62, 64] as const)} d={1600} dur={2600} />
      {STAGES.map((s, i) => (
        <g key={i}>
          <Box x={x(i)} y={40} w={124} h={48} label={s} tone="navy" size={11.5} d={i * 350} />
          {i < 3 ? <Arrow pts={[[x(i) + 125, 64], [x(i) + 139, 64]]} d={i * 350 + 250} dur={150} /> : null}
          <Arrow pts={[[x(i) + 62, 90], [x(i) + 62, 110]]} tone="gold" d={i * 350 + 300} dur={150} />
          <Doc x={x(i) + 6} y={114} w={112} h={64} label={OUTPUTS[i]} tone="outline" size={10} d={i * 350 + 400} />
        </g>
      ))}
      <Mark x={44} y={234} ok r={10} d={1900} />
      <Chip x={60} y={234} text={bi("functional requirements", "المتطلبات الوظيفية")} tone="success" d={1900} />
      <Mark x={262} y={234} ok={false} r={10} d={2200} />
      <Chip x={278} y={234} text={bi("error checking, reliability, security", "التحقق من الأخطاء والموثوقية والأمان")} tone="muted" d={2200} />
    </Svg>
  );
}

const ISSUES = [bi("Non-functional needs unmet", "المتطلبات غير الوظيفية غير مستوفاة"), bi("Undocumented", "غير موثَّق"), bi("Degraded structure", "بنية متدهورة"), bi("Below quality standards", "دون معايير الجودة")];

function Throwaway({ control }: { control: string }) {
  if (control === "ship") {
    return (
      <Svg>
        <Box x={20} y={110} w={130} h={48} label={bi("Prototype", "النموذج الأولي")} tone="gold" d={0} />
        <Arrow pts={[[152, 134], [196, 134]]} tone="danger" d={300} label={bi("shipped as is", "يُسلَّم كما هو")} labelAt={[170, 180]} labelTone="danger" />
        <Box x={200} y={98} w={130} h={72} label={bi("In production", "في الإنتاج")} sub={bi("as the product", "كمنتج نهائي")} tone="danger" d={600} />
        {ISSUES.map((issue, i) => {
          const y = 30 + i * 58;
          return (
            <g key={i}>
              <Arrow pts={[[332, 134], [344, y + 22]]} tone="danger" dashed head={false} d={1000 + i * 250} />
              <Mark x={350} y={y + 22} ok={false} r={9} d={1100 + i * 250} />
              <Box x={364} y={y} w={180} h={44} label={issue} tone="outline" size={11.5} d={1100 + i * 250} />
            </g>
          );
        })}
      </Svg>
    );
  }
  return (
    <Svg>
      <Token pts={[[90, 80], [254, 80]]} d={600} dur={700} />
      <Token pts={[[254, 80], [450, 80]]} d={1500} dur={700} tone="success" />
      <Box x={20} y={56} w={140} h={48} label={bi("Prototype", "النموذج الأولي")} tone="gold" d={0} />
      <Arrow pts={[[162, 80], [194, 80]]} d={300} dur={200} />
      <Doc x={196} y={40} w={116} h={80} label={bi("Evaluation report", "تقرير التقييم")} tone="outline" size={10.5} d={400} />
      <Arrow pts={[[314, 80], [356, 80]]} tone="success" d={1200} dur={250} label={bi("lessons", "الدروس")} labelAt={[335, 100]} labelTone="success" />
      <Box x={360} y={46} w={180} h={68} label={bi("Production system", "نظام الإنتاج")} sub={bi("engineered properly", "مُهندَس كما ينبغي")} tone="success" d={1400} />
      <Chip x={450} y={146} text={bi("documented", "موثَّق")} tone="success" center d={1900} />
      <Chip x={450} y={194} text={bi("meets quality standards", "يستوفي معايير الجودة")} tone="success" center d={2100} />
      <Arrow pts={[[90, 106], [90, 170]]} tone="muted" dashed d={2300} />
      <Box x={20} y={174} w={140} h={48} label={bi("Discarded", "يُستبعد")} tone="muted" dashed d={2500} />
      <Text x={90} y={242} text={bi("the code is thrown away", "تُرمى الشيفرة")} size={11} tone="muted" d={2600} />
    </Svg>
  );
}

const FEATURES = [
  { label: bi("1 · Ordering", "1 · الطلب"), name: bi("Ordering", "الطلب"), tone: "gold", y: 142 },
  { label: bi("2 · Payment", "2 · الدفع"), name: bi("Payment", "الدفع"), tone: "slate", y: 96 },
  { label: bi("3 · Tracking", "3 · التتبّع"), name: bi("Tracking", "التتبّع"), tone: "outline", y: 50 },
] as const;
const RELEASE = (r: number) => 160 + r * 130;

function Delivery({ control }: { control: string }) {
  const problems = control === "problems";
  const at = (r: number) => 500 + r * 700;
  return (
    <Svg>
      <Text x={76} y={24} text={bi("Priority", "الأولوية")} size={11.5} tone="muted" d={0} />
      {FEATURES.map((f, k) => (
        <Box key={k} x={16} y={f.y} w={120} h={44} label={f.label} tone={f.tone} size={11.5} d={k * 120} />
      ))}
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <Text x={RELEASE(r) + 50} y={24} text={bi(`Release ${r + 1}`, `الإصدار ${r + 1}`)} size={11.5} tone="heading" d={at(r)} />
          <Arrow pts={[[138, FEATURES[r].y + 22], [RELEASE(r) - 2, FEATURES[r].y + 22]]} tone="faint" d={at(r) - 200} dur={300} />
          {FEATURES.slice(0, r + 1).map((f, k) => (
            <g key={k}>
              <Box x={RELEASE(r)} y={f.y} w={100} h={44} label={f.name} tone={f.tone} size={12} d={at(r) + k * 120} />
              {problems ? null : <Mark x={RELEASE(r) + 92} y={f.y + 8} ok r={6} d={at(r) + 300 + k * 120} />}
            </g>
          ))}
        </g>
      ))}
      {problems ? (
        <>
          <Box
            x={160}
            y={192}
            w={360}
            h={44}
            label={bi("Common facilities? (login, data storage…)", "مرافق مشتركة؟ (تسجيل الدخول، تخزين البيانات…)")}
            tone="warn"
            dashed
            size={12}
            d={2400}
          />
          <Mark x={186} y={256} ok={false} r={9} d={2800} />
          <Text x={204} y={256} text={bi("complete specification only after release 3", "التوصيف الكامل لا يكتمل إلا بعد الإصدار 3")} anchor="start" size={11.5} tone="danger" d={2800} />
        </>
      ) : (
        <>
          <Chip x={210} y={214} text={bi("value from release 1", "قيمة من الإصدار 1")} tone="success" center d={900} />
          <Text x={340} y={254} text={bi("✓ = tested again in that release", "✓ = اختُبر من جديد في ذلك الإصدار")} size={11} tone="success" d={2500} />
        </>
      )}
    </Svg>
  );
}

function Deploy({ control }: { control: string }) {
  const delivery = control === "delivery";
  return (
    <Svg>
      {delivery ? <Token pts={[[136, 120], [424, 120]]} d={1000} dur={900} /> : null}
      <Box x={16} y={36} w={240} h={220} r={12} tone="ghost" dashed d={0} />
      <Text x={136} y={54} text={bi("Developers' environment", "بيئة المطورين")} size={11.5} tone="heading" d={0} />
      <Box x={304} y={36} w={240} h={220} r={12} tone="ghost" dashed d={0} />
      <Text x={424} y={54} text={bi("Customer's environment", "بيئة العميل")} size={11.5} tone="heading" d={0} />
      <Box x={56} y={96} w={160} h={48} label={bi("Increment 2", "الزيادة 2")} tone="gold" d={200} />
      {delivery ? (
        <>
          <Arrow pts={[[218, 120], [342, 120]]} tone="gold" width={2.4} d={600} label={bi("deploy", "نشر")} labelAt={[280, 92]} labelTone="gold" />
          <Box x={344} y={96} w={160} h={48} label={bi("Increment 2", "الزيادة 2")} tone="success" d={1800} />
          <Person x={366} y={150} d={2100} />
          <Person x={412} y={150} d={2100} />
          <Text x={478} y={170} text={bi("end users", "المستخدمون")} size={11} tone="muted" d={2100} />
          <Text x={136} y={190} text={bi("realistic evaluation in real use", "تقييم واقعي في الاستخدام الفعلي")} size={11} tone="success" d={2300} />
          <Box x={344} y={196} w={160} h={48} label={bi("Old system: does more", "النظام القديم: يؤدي أكثر")} tone="warn" size={11.5} d={2600} />
        </>
      ) : (
        <>
          <Arrow pts={[[136, 146], [136, 164]]} tone="gold" d={600} dur={200} />
          <Person x={136} y={166} label={bi("Customers", "العملاء")} d={700} />
          <Arrow pts={[[160, 186], [210, 150]]} tone="slate" d={1100} label={bi("comments", "ملاحظات")} labelAt={[212, 190]} labelTone="slate" />
          <Arrow pts={[[218, 120], [342, 120]]} tone="faint" dashed d={1400} />
          <Mark x={280} y={120} ok={false} r={10} d={1600} />
          <Box x={344} y={96} w={160} h={48} label={bi("not deployed", "غير منشورة")} tone="muted" dashed d={1600} />
          <Box x={344} y={170} w={160} h={68} label={bi("Old system", "النظام القديم")} sub={bi("still in use", "ما زال مستخدمًا")} tone="slate" d={1800} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof change>>({
  rework: Rework,
  "two-ways": TwoWays,
  prototype: Prototype,
  throwaway: Throwaway,
  delivery: Delivery,
  deploy: Deploy,
});
