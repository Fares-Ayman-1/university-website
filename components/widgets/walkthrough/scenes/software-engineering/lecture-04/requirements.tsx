"use client";

import type { requirements } from "@/lib/walkthroughs/software-engineering/lecture-04";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi, type Bi } from "../../../../types";
import { Arrow, Box, Chip, Doc, Fade, Mark, Person, Svg, Text, type Pt, type Tone } from "../../../primitives";
import { sceneSet } from "../../../scene-set";

function Requirement() {
  const kinds: { y: number; label: Bi; sub: Bi; tone: Tone }[] = [
    { y: 28, label: bi("Function (service)", "وظيفة (خدمة)"), sub: bi("a daily patient list for each clinic", "قائمة يومية بالمرضى لكل عيادة"), tone: "navy" },
    { y: 112, label: bi("Constraint", "قيد"), sub: bi("downtime ≤ 5 s in any one day", "توقف لا يتجاوز 5 ثوانٍ في أي يوم"), tone: "gold" },
    { y: 196, label: bi("Other property", "خاصية أخرى"), sub: bi("patient records stay private", "تبقى سجلات المرضى سرية"), tone: "slate" },
  ];
  return (
    <Svg>
      <Person x={60} y={84} label={bi("Intended users", "المستخدمون المستهدفون")} d={0} />
      <Arrow pts={[[90, 112], [148, 112]]} tone="gold" d={300} label={bi("needs", "احتياجات")} labelAt={[119, 86]} labelTone="gold" />
      <Doc x={154} y={68} w={92} h={92} label={bi("Requirement", "المتطلب")} tone="outline" d={500} />
      {kinds.map((k, i) => (
        <g key={i}>
          <Arrow pts={[[248, 116], [272, 116], [272, k.y + 34], [294, k.y + 34]]} tone="faint" d={800 + i * 250} dur={400} />
          <Box x={298} y={k.y} w={246} h={68} label={k.label} sub={k.sub} tone={k.tone} size={12.5} d={900 + i * 250} />
        </g>
      ))}
    </Svg>
  );
}

const NEEDS: [Bi, Bi][] = [
  [bi("search all clinics", "البحث في كل العيادات"), bi("R1 · search all clinics", "R1 · البحث في كل العيادات")],
  [bi("monthly reports", "التقارير الشهرية"), bi("R2 · monthly cost reports", "R2 · تقارير التكلفة الشهرية")],
  [bi("records private", "سرية السجلات"), bi("R3 · records stay private", "R3 · تبقى السجلات سرية")],
];

function Re({ control }: { control: string }) {
  if (control === "adhoc") {
    const results: { text: Bi; tone: Tone }[] = [
      { text: bi("search one clinic", "البحث في عيادة واحدة"), tone: "warn" },
      { text: bi("forgotten", "نُسي"), tone: "danger" },
      { text: bi("never checked", "لم يُفحص أبدًا"), tone: "muted" },
    ];
    const xs = [100, 280, 460];
    return (
      <Svg>
        <Person x={60} y={40} label={bi("Customer", "العميل")} d={0} />
        <Person x={300} y={40} label={bi("Developer", "المطوّر")} d={150} />
        <Arrow pts={[[90, 64], [268, 64]]} tone="muted" dashed d={300} label={bi("tells", "يخبره")} labelAt={[180, 40]} />
        <Arrow pts={[[330, 64], [436, 64]]} tone="muted" d={500} />
        <Box x={440} y={38} w={100} h={52} label={bi("Code", "الشيفرة")} tone="slate" d={600} />
        {NEEDS.map(([need], i) => (
          <g key={i}>
            <Chip x={xs[i]} y={150} text={need} tone="outline" w={150} center d={800 + i * 200} />
            <Arrow pts={[[xs[i], 170], [xs[i], 189]]} tone={i === 0 ? "gold" : "danger"} d={1300 + i * 250} dur={250} />
            <Chip x={xs[i]} y={210} text={results[i].text} tone={results[i].tone} w={150} center d={1450 + i * 250} />
          </g>
        ))}
        <Text x={280} y={250} text={bi("nothing written, nothing checked", "لا شيء مكتوب ولا شيء مفحوص")} tone="danger" size={12} d={2300} />
      </Svg>
    );
  }
  const ys = [76, 140, 204];
  const versions = ["v1", "v1 → v2", "v1"];
  return (
    <Svg>
      <Person x={50} y={104} label={bi("Customer", "العميل")} d={0} />
      <Arrow pts={[[80, 132], [116, 132]]} tone="gold" d={200} />
      <Text x={232} y={24} text={bi("1 · defined", "1 · مُعرَّف")} tone="heading" size={12} d={300} />
      <Text x={404} y={24} text={bi("2 · managed", "2 · مُدار")} tone="heading" size={12} d={300} />
      <Text x={506} y={24} text={bi("3 · tested", "3 · مُختبَر")} tone="heading" size={12} d={300} />
      {NEEDS.map(([, req], i) => (
        <g key={i}>
          <Box x={122} y={ys[i] - 22} w={220} h={44} label={req} tone="navy" size={12} d={500 + i * 200} />
          <Chip x={404} y={ys[i]} text={versions[i]} tone={i === 1 ? "gold" : "slate"} center d={1200 + i * 200} />
          <Mark x={506} y={ys[i]} ok d={1800 + i * 200} />
        </g>
      ))}
      <Text x={330} y={254} text={bi("every requirement written, tracked and checked", "كل متطلب مكتوب ومتابَع ومفحوص")} tone="success" size={12} d={2400} />
    </Svg>
  );
}

function CompleteConsistent({ control }: { control: string }) {
  if (control === "consistency") {
    const reqs: { label: Bi; clash: boolean }[] = [
      { label: bi("R1 · Search the appointments of all clinics", "R1 · البحث في مواعيد كل العيادات"), clash: false },
      { label: bi("R2 · Only doctors may open a patient record", "R2 · لا يفتح سجل المريض إلا الأطباء"), clash: true },
      { label: bi("R3 · Staff log in with an 8-digit number", "R3 · يدخل الموظفون برقم من 8 أرقام"), clash: false },
      { label: bi("R4 · Nurses shall update patient records", "R4 · يحدّث الممرضون سجلات المرضى"), clash: true },
    ];
    const ys = [70, 122, 174, 226];
    return (
      <Svg>
        <Text x={280} y={22} text={bi("Specification", "التوصيف")} tone="heading" size={13} d={0} />
        {reqs.map((r, i) => (
          <g key={i}>
            <Box x={110} y={ys[i] - 22} w={330} h={44} label={r.label} tone={r.clash ? "danger" : "outline"} size={12} d={150 + i * 180} />
            <Mark x={90} y={ys[i]} ok={!r.clash} d={1300 + i * 120} />
          </g>
        ))}
        <Arrow pts={[[442, 122], [478, 122], [478, 226], [442, 226]]} tone="danger" both dashed d={1100} />
        <Text x={516} y={168} text={bi("contradict", "يتعارضان")} tone="danger" size={11.5} d={1300} />
      </Svg>
    );
  }
  const needs = [bi("search appointments", "البحث في المواعيد"), bi("daily patient lists", "قوائم المرضى اليومية"), bi("staff log-in", "دخول الموظفين"), bi("monthly cost reports", "تقارير التكلفة الشهرية")];
  const reqs = [bi("R1 · search all clinics", "R1 · البحث في كل العيادات"), bi("R2 · a list per clinic, daily", "R2 · قائمة لكل عيادة يوميًا"), bi("R3 · 8-digit employee number", "R3 · رقم وظيفي من 8 أرقام")];
  const ys = [72, 124, 176, 228];
  return (
    <Svg>
      <Text x={110} y={22} text={bi("User needs", "احتياجات المستخدمين")} tone="heading" size={13} d={0} />
      <Text x={410} y={22} text={bi("Specification", "التوصيف")} tone="heading" size={13} d={0} />
      {needs.map((n, i) => (
        <Chip key={i} x={110} y={ys[i]} text={n} tone="slate" w={180} center d={100 + i * 150} />
      ))}
      {reqs.map((r, i) => (
        <g key={i}>
          <Arrow pts={[[202, ys[i]], [296, ys[i]]]} tone="gold" d={700 + i * 200} dur={350} />
          <Box x={300} y={ys[i] - 22} w={220} h={44} label={r} tone="navy" size={12} d={850 + i * 200} />
          <Mark x={538} y={ys[i]} ok d={1000 + i * 200} />
        </g>
      ))}
      <Arrow pts={[[202, ys[3]], [296, ys[3]]]} tone="danger" dashed d={1500} />
      <Box x={300} y={ys[3] - 22} w={220} h={44} label={bi("no requirement", "لا يوجد متطلب")} tone="danger" dashed size={12} d={1600} />
      <Mark x={538} y={ys[3]} ok={false} d={1800} />
    </Svg>
  );
}

function Stakeholders() {
  const sys: Pt = [280, 124];
  const people: { x: number; y: number; label: Bi; tone: Tone; from: Pt; to: Pt }[] = [
    { x: 100, y: 20, label: bi("System owners", "مالكو النظام"), tone: "gold", from: [198, 108], to: [128, 48] },
    { x: 460, y: 20, label: bi("End users", "المستخدمون النهائيون"), tone: "slate", from: [362, 108], to: [432, 48] },
    { x: 70, y: 150, label: bi("System managers", "مديرو النظام"), tone: "slate", from: [198, 140], to: [96, 172] },
    { x: 280, y: 188, label: bi("Project groups", "فرق المشروع"), tone: "slate", from: [sys[0], 154], to: [sys[0], 184] },
    { x: 490, y: 150, label: bi("External", "الخارجيون"), tone: "slate", from: [362, 140], to: [464, 172] },
  ];
  return (
    <Svg>
      <Box x={200} y={96} w={160} h={56} label={bi("The system", "النظام")} tone="navy" d={0} />
      {people.map((p, i) => (
        <g key={i}>
          <Arrow pts={[p.from, p.to]} tone="gold" d={400 + i * 220} dur={380} />
          <Person x={p.x} y={p.y} label={p.label} tone={p.tone} d={550 + i * 220} />
        </g>
      ))}
    </Svg>
  );
}

function Mentcare({ control }: { control: string }) {
  const affected = control === "affected";
  const people: { x: number; y: number; label: Bi; user: boolean; from: Pt; to: Pt }[] = [
    { x: 70, y: 14, label: bi("Patients", "المرضى"), user: false, from: [203, 124], to: [96, 40] },
    { x: 70, y: 104, label: bi("Doctors", "الأطباء"), user: true, from: [203, 140], to: [98, 128] },
    { x: 70, y: 194, label: bi("Nurses", "الممرضون"), user: true, from: [203, 156], to: [96, 212] },
    { x: 490, y: 14, label: bi("Receptionists", "موظفو الاستقبال"), user: true, from: [357, 124], to: [464, 40] },
    { x: 490, y: 104, label: bi("IT staff", "موظفو IT"), user: true, from: [357, 140], to: [462, 128] },
    { x: 490, y: 194, label: bi("Ethics manager", "مدير الأخلاقيات"), user: false, from: [357, 156], to: [464, 212] },
  ];
  return (
    <Svg>
      <Box x={205} y={112} w={150} h={56} label="Mentcare" sub="MHC-PMS" tone="navy" d={0} />
      {people.map((p, i) => {
        const lit = affected ? !p.user : p.user;
        const tone: Tone = lit ? "gold" : affected ? "slate" : "muted";
        const linked = affected || p.user;
        return (
          <g key={i}>
            {linked ? (
              <Arrow pts={[p.from, p.to]} tone={lit ? "gold" : "faint"} d={300 + i * 150} dur={360} />
            ) : (
              <Arrow pts={[p.from, p.to]} tone="faint" dashed head={false} d={300 + i * 150} />
            )}
            <Person x={p.x} y={p.y} label={p.label} tone={tone} d={400 + i * 150} />
          </g>
        );
      })}
      {affected ? (
        <>
          <Chip x={210} y={30} text={bi("their data is in it", "بياناتهم فيه")} tone="gold" w={160} center d={1400} />
          <Chip x={350} y={250} text={bi("checks it is ethical", "يتحقق من التزامه الأخلاقي")} tone="gold" w={170} center d={1600} />
        </>
      ) : (
        <Fade d={1400}>
          <Text x={280} y={210} text={bi("4 of the 6 log in", "4 من الـ 6 يسجّلون الدخول")} tone="muted" size={12} />
        </Fade>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof requirements>>({
  requirement: Requirement,
  re: Re,
  "complete-consistent": CompleteConsistent,
  stakeholders: Stakeholders,
  mentcare: Mentcare,
});
