"use client";

import type { ethics } from "@/lib/walkthroughs/software-engineering/lecture-01";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Cylinder, Doc, Mark, Person, Svg, Text, Token } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function BeyondLaw() {
  return (
    <Svg>
      <Box x={16} y={44} w={528} h={184} r={18} tone="outline" d={0} />
      <Text x={32} y={62} text={bi("Allowed by law", "يسمح به القانون")} anchor="start" tone="muted" size={11.5} d={0} />
      <Box x={30} y={88} w={272} h={128} r={14} tone="success" d={300} />
      <Text x={44} y={106} text={bi("Professional and ethical", "مهني وأخلاقي")} anchor="start" tone="success" size={11.5} d={300} />
      <Chip x={44} y={146} text={bi("keep client data private", "حماية بيانات العميل")} tone="outline" d={600} />
      <Mark x={256} y={146} ok d={800} />
      <Chip x={44} y={190} text={bi("admit what you can't do", "الاعتراف بما لا تستطيعه")} tone="outline" d={750} />
      <Mark x={256} y={190} ok d={950} />
      <Text x={420} y={106} text={bi("legal, but wrong", "قانوني لكنه خاطئ")} tone="danger" size={11.5} d={1200} />
      <Chip x={318} y={146} text={bi("overstate your skills", "المبالغة في مهاراتك")} tone="warn" d={1300} />
      <Mark x={506} y={146} ok={false} d={1500} />
      <Chip x={318} y={190} text={bi("games on the work PC", "اللعب على جهاز العمل")} tone="warn" d={1450} />
      <Mark x={506} y={190} ok={false} d={1650} />
      <Chip x={280} y={252} text={bi("spread a virus: illegal too", "نشر فيروس: غير قانوني أيضًا")} tone="danger" center d={1900} />
    </Svg>
  );
}

function TrustIssues({ control }: { control: string }) {
  if (control === "competence") {
    const offers = [
      { y: 50, label: bi("Company website", "موقع الشركة"), ok: true },
      { y: 118, label: bi("Inventory app", "تطبيق المخزون"), ok: true },
      { y: 186, label: bi("Flight-control software", "برمجيات التحكم في الطيران"), ok: false },
    ];
    return (
      <Svg>
        <Box x={20} y={56} w={150} h={150} r={75} tone="success" d={0} />
        <Person x={95} y={98} label={bi("You", "أنت")} d={100} />
        <Text x={95} y={226} text={bi("your competence", "حدود كفاءتك")} tone="success" size={11.5} d={200} />
        {offers.map((o, i) => (
          <g key={i}>
            <Box x={230} y={o.y} w={190} h={44} label={o.label} tone={o.ok ? "outline" : "warn"} dashed={!o.ok} d={400 + i * 250} />
            <Arrow pts={[[228, o.y + 22], [172, 131]]} tone="faint" d={500 + i * 250} dur={300} />
            <Arrow pts={[[422, o.y + 22], [456, o.y + 22]]} tone={o.ok ? "success" : "danger"} d={1300 + i * 200} dur={200} />
            <Chip x={495} y={o.y + 22} text={o.ok ? bi("accept", "اقبل") : bi("decline", "اعتذر")} tone={o.ok ? "success" : "danger"} center d={1400 + i * 200} />
          </g>
        ))}
        <Text x={340} y={256} text={bi("be honest about what you can do", "كن صادقًا بشأن ما تستطيع فعله")} tone="gold" size={12} d={2200} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Box x={20} y={46} w={300} h={210} r={14} tone="ghost" dashed d={0} />
      <Text x={170} y={64} text={bi("You and your client", "أنت وعميلك")} tone="heading" size={12} d={0} />
      <Person x={80} y={100} label={bi("You", "أنت")} d={100} />
      <Doc x={170} y={96} w={120} h={90} label={bi("Client data", "بيانات العميل")} tone="gold" d={300} />
      <Arrow pts={[[110, 128], [166, 128]]} tone="success" d={500} dur={300} />
      <Person x={480} y={100} tone="danger" label={bi("Outsider", "شخص من الخارج")} d={700} />
      <Arrow pts={[[452, 124], [326, 140]]} tone="danger" dashed d={900} />
      <Token pts={[[452, 124], [384, 132]]} tone="danger" d={1000} dur={500} />
      <Text x={392} y={96} text={bi("asks for it", "يطلبها")} tone="danger" size={11} d={1000} />
      <Mark x={384} y={132} ok={false} d={1400} />
      <Chip x={170} y={224} text={bi("no agreement signed? still private", "لا اتفاقية موقَّعة؟ تبقى سرية")} tone="success" center d={1700} />
    </Svg>
  );
}

function PropertyIssues({ control }: { control: string }) {
  if (control === "misuse") {
    return (
      <Svg>
        <Box x={30} y={60} w={180} h={60} label={bi("Games on the work PC", "اللعب على جهاز العمل")} tone="warn" d={0} />
        <Mark x={210} y={60} ok={false} d={400} />
        <Box x={340} y={60} w={190} h={60} label={bi("Spreading a virus", "نشر فيروس")} tone="danger" d={600} />
        <Mark x={530} y={60} ok={false} d={1000} />
        <Arrow pts={[[40, 160], [520, 160]]} tone="danger" width={3} d={200} dur={900} />
        <Arrow pts={[[120, 122], [120, 156]]} tone="gold" d={300} dur={250} />
        <Arrow pts={[[435, 122], [435, 156]]} tone="danger" d={800} dur={250} />
        <Text x={40} y={182} text={bi("trivial", "بسيطة")} anchor="start" tone="muted" size={11.5} d={500} />
        <Text x={520} y={182} text={bi("very serious", "خطيرة جدًا")} anchor="end" tone="danger" size={11.5} d={900} />
        <Chip x={280} y={240} text={bi("both misuse someone else's computer", "كلاهما إساءة لاستخدام حاسوب غيرك")} tone="outline" center d={1300} />
      </Svg>
    );
  }
  return (
    <Svg>
      <Doc x={30} y={56} w={130} h={120} label={bi("Client's code", "شيفرة العميل")} sub={bi("© copyright", "© حقوق النشر")} tone="gold" d={0} />
      <Chip x={30} y={206} text={bi("patented idea", "فكرة ببراءة اختراع")} tone="gold" d={300} />
      <Person x={270} y={80} label={bi("You", "أنت")} d={500} />
      <Arrow pts={[[250, 110], [166, 110]]} tone="success" d={700} label={bi("protect", "احمِ")} labelAt={[208, 84]} labelTone="success" />
      <Box x={380} y={56} w={160} h={56} label={bi("Another project", "مشروع آخر")} tone="outline" d={900} />
      <Arrow pts={[[162, 156], [460, 156], [460, 114]]} tone="danger" dashed d={1100} label={bi("copied in", "نسخها إليه")} labelAt={[320, 178]} labelTone="danger" />
      <Mark x={460} y={156} ok={false} d={1400} />
      <Chip x={400} y={236} text={bi("know the local IP laws", "اعرف قوانين الملكية الفكرية المحلية")} tone="slate" center d={1600} />
    </Svg>
  );
}

const PRINCIPLES = [
  bi("1 · Public", "1 · الجمهور"),
  bi("2 · Client and employer", "2 · العميل وصاحب العمل"),
  bi("3 · Product", "3 · المنتج"),
  bi("4 · Judgment", "4 · الحُكم المهني"),
  bi("5 · Management", "5 · الإدارة"),
  bi("6 · Profession", "6 · المهنة"),
  bi("7 · Colleagues", "7 · الزملاء"),
  bi("8 · Self", "8 · الذات"),
];

function Code() {
  const ys = [56, 112, 168, 224];
  const place = (i: number) => ({ x: i < 4 ? 20 : 370, y: ys[i % 4] });
  return (
    <Svg>
      {PRINCIPLES.map((_, i) => {
        const { x, y } = place(i);
        return <Arrow key={i} pts={[[280, 144], [i < 4 ? x + 170 : x, y]]} tone="faint" head={false} d={400 + i * 120} dur={250} />;
      })}
      <Text x={280} y={60} text={bi("ACM/IEEE code", "ميثاق ACM/IEEE")} tone="heading" size={12.5} d={0} />
      <Box x={200} y={116} w={160} h={56} label={bi("Software engineer", "مهندس البرمجيات")} tone="navy" d={100} />
      {PRINCIPLES.map((p, i) => {
        const { x, y } = place(i);
        return <Chip key={i} x={x} y={y} w={170} text={p} tone={i === 0 ? "gold" : "outline"} d={400 + i * 120} />;
      })}
      <Text x={280} y={238} text={bi("students too", "والطلاب أيضًا")} tone="gold" size={11.5} d={1500} />
    </Svg>
  );
}

function Dilemma({ control }: { control: string }) {
  const severe = control === "severe";
  const weigh = [bi("potential damage", "الضرر المحتمل"), bi("how severe", "مدى الخطورة"), bi("who is affected", "من سيتأثر")];
  return (
    <Svg>
      <Box x={20} y={46} w={180} h={68} label={bi("Records falsified", "سجلات مزوّرة")} sub={bi("to meet a deadline", "للالتزام بموعد نهائي")} tone="danger" d={0} />
      {weigh.map((w, i) => (
        <Chip key={i} x={20} y={146 + i * 44} w={180} text={w} tone="outline" d={200 + i * 150} />
      ))}
      <Arrow pts={[[202, 80], [238, 80]]} tone="slate" d={700} dur={250} />
      <Box x={240} y={46} w={150} h={68} label={bi("Raise it inside", "اطرحه داخليًا")} sub={bi("with your manager", "مع مديرك")} tone="slate" d={800} />
      <Chip x={470} y={80} text={severe ? bi("lives at risk", "الأرواح في خطر") : bi("limited danger", "خطر محدود")} tone={severe ? "danger" : "success"} center d={900} />
      <Arrow pts={[[315, 116], [315, 166]]} tone={severe ? "danger" : "success"} d={1100} dur={300} />
      <Token pts={[[315, 116], [315, 166]]} tone={severe ? "danger" : "success"} d={1200} dur={400} />
      {severe ? (
        <>
          <Box x={240} y={168} w={150} h={68} label={bi("Ignored", "تُتجاهَل")} sub={bi("nothing changes", "لا يتغير شيء")} tone="danger" d={1400} />
          <Mark x={390} y={168} ok={false} d={1600} />
          <Arrow pts={[[392, 202], [408, 202]]} tone="gold" d={1800} dur={200} />
          <Box x={410} y={168} w={134} h={68} label={bi("Go public", "الإعلان للعامة")} sub={bi("warn the customer", "تحذير العميل")} tone="warn" d={1900} />
        </>
      ) : (
        <>
          <Box x={240} y={168} w={150} h={68} label={bi("Resolved", "تُحل المسألة")} sub={bi("employer's rights kept", "تُحفظ حقوق صاحب العمل")} tone="success" d={1400} />
          <Mark x={390} y={168} ok d={1600} />
          <Box x={410} y={168} w={134} h={68} label={bi("Go public", "الإعلان للعامة")} sub={bi("not needed", "غير لازم")} tone="muted" dashed d={1800} />
        </>
      )}
    </Svg>
  );
}

function Mentcare({ control }: { control: string }) {
  const management = control === "management";
  const staff = management ? [bi("Receptionist", "موظف الاستقبال"), bi("Records staff", "موظف السجلات")] : [bi("Doctor", "الطبيب"), bi("Nurse", "الممرض")];
  const ys = [56, 166];
  return (
    <Svg>
      <Cylinder x={225} y={84} w={110} h={120} label="Mentcare" sub={bi("patient records", "سجلات المرضى")} tone="navy" d={0} />
      {staff.map((s, i) => (
        <g key={i}>
          <Person x={70} y={ys[i]} label={s} tone="slate" d={200 + i * 150} />
          <Arrow pts={[[100, ys[i] + 24], [222, 124 + i * 46]]} tone="slate" both={!management} d={500 + i * 150} />
          <Token pts={management ? [[100, ys[i] + 24], [222, 124 + i * 46]] : [[222, 124 + i * 46], [100, ys[i] + 24]]} tone="navy" d={800 + i * 300} dur={600} />
        </g>
      ))}
      {management ? (
        <>
          <Arrow pts={[[337, 142], [370, 142]]} tone="gold" d={1200} dur={250} />
          <Doc x={372} y={100} w={80} h={84} label={bi("Reports", "التقارير")} tone="outline" d={1300} />
          <Arrow pts={[[454, 136], [482, 120]]} tone="gold" d={1500} dur={250} />
          <Person x={504} y={84} label={bi("Health manager", "مدير الرعاية")} d={1500} />
          <Chip x={440} y={236} text={bi("assess performance", "تقييم الأداء")} tone="gold" center d={1800} />
        </>
      ) : (
        <>
          <Arrow pts={[[337, 118], [376, 94]]} tone="gold" d={1200} dur={250} />
          <Chip x={445} y={90} text={bi("individual care", "الرعاية الفردية")} tone="gold" center d={1300} />
          <Arrow pts={[[337, 152], [370, 152]]} tone="gold" d={1400} dur={250} />
          <Chip x={445} y={152} text={bi("patient monitoring", "متابعة المرضى")} tone="gold" center d={1500} />
          <Chip x={445} y={232} text={bi("staff only: confidential", "للطاقم فقط: سري")} tone="danger" center d={1800} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof ethics>>({
  "beyond-law": BeyondLaw,
  "trust-issues": TrustIssues,
  "property-issues": PropertyIssues,
  code: Code,
  dilemma: Dilemma,
  mentcare: Mentcare,
});
