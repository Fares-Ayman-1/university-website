"use client";

import type { scrum } from "@/lib/walkthroughs/software-engineering/lecture-03";
import type { PanelIdOf } from "@/lib/widgets/walkthrough";
import { bi } from "../../../../types";
import { Arrow, Box, Chip, Mark, Person, Svg, Text, Token, type Pt } from "../../../primitives";
import { sceneSet } from "../../../scene-set";
import { Glide, arc } from "./local";

// ---------- Three phases ----------
const RING = { cx: 280, cy: 140, r: 78 };
/** Stage chips at the four diagonals; each arc runs clockwise from one chip to the next. */
const WHEEL = [
  { label: bi("Assess", "التقييم"), at: 315 },
  { label: bi("Select", "الاختيار"), at: 405 },
  { label: bi("Develop", "التطوير"), at: 495 },
  { label: bi("Review", "المراجعة"), at: 585 },
];
const onRing = (deg: number): Pt => {
  const a = (deg * Math.PI) / 180;
  return [RING.cx + RING.r * Math.cos(a), RING.cy + RING.r * Math.sin(a)];
};

function Phases() {
  return (
    <Svg>
      <Box x={14} y={106} w={156} h={68} label={bi("Outline planning", "التخطيط المبدئي")} sub={bi("and architecture", "والتصميم المعماري")} tone="navy" size={12} d={0} />
      <Arrow pts={[[170, 140], [200, 140]]} tone="gold" d={300} dur={250} />
      {WHEEL.map((s, i) => (
        <Arrow key={i} pts={arc(RING.cx, RING.cy, RING.r, s.at + 22, s.at + 68, 8)} tone="slate" d={500 + i * 250} dur={300} />
      ))}
      {WHEEL.map((s, i) => {
        const [x, y] = onRing(s.at);
        return <Chip key={i} x={x} y={y} text={s.label} tone="slate" center d={450 + i * 250} />;
      })}
      <Text x={280} y={136} text={bi("sprint cycle", "دورة السبرنت")} tone="heading" size={12} d={1500} />
      <Token pts={arc(RING.cx, RING.cy, RING.r, 180, 900, 96)} d={1700} dur={4000} />
      <Box x={390} y={106} w={156} h={68} label={bi("Project closure", "إغلاق المشروع")} sub={bi("docs, lessons learned", "التوثيق والدروس المستفادة")} tone="slate" size={12} d={200} />
      <Arrow pts={[[358, 140], [388, 140]]} tone="gold" d={5700} dur={250} />
      <Text x={280} y={252} text={bi("each sprint: 2–4 weeks, one increment", "كل سبرنت: من 2 إلى 4 أسابيع وزيادة واحدة")} tone="muted" size={11.5} d={1800} />
    </Svg>
  );
}

// ---------- Assess and select ----------
const BACKLOG = [
  { label: bi("Prescribe a drug", "وصف دواء"), pick: 0 },
  { label: bi("Dose check", "فحص الجرعة"), pick: 1 },
  { label: bi("Patient search", "البحث عن مريض"), pick: -1 },
  { label: bi("Print reports", "طباعة التقارير"), pick: -1 },
  { label: bi("Allergy alert (new)", "تنبيه الحساسية (جديد)"), pick: 2 },
];
const by = (i: number) => 72 + i * 42;
const slotY = (j: number) => 82 + j * 44;

function Select() {
  return (
    <Svg>
      <Text x={110} y={22} text={bi("Product backlog", "قائمة أعمال المنتج")} tone="heading" size={12} d={0} />
      <Box x={20} y={48} w={180} h={216} r={10} tone="ghost" dashed d={0} />
      {BACKLOG.map((b, i) => {
        const isNew = i === BACKLOG.length - 1;
        return <Chip key={i} x={28} y={by(i)} w={164} text={b.label} tone={isNew ? "gold" : "outline"} d={isNew ? 800 : 100 + i * 100} />;
      })}
      <Box x={226} y={56} w={108} h={200} r={10} label={bi("Select", "الاختيار")} sub={bi("team + customer", "الفريق + العميل")} tone="navy" size={13} d={1100} />
      <Text x={451} y={22} text={bi("Sprint backlog", "قائمة أعمال السبرنت")} tone="heading" size={12} d={1100} />
      <Box x={362} y={48} w={178} h={158} r={10} tone="ghost" dashed d={1100} />
      {BACKLOG.map((b, i) =>
        b.pick < 0 ? null : (
          <g key={i}>
            <Arrow pts={[[194, by(i)], [224, by(i)]]} tone="gold" d={1400 + b.pick * 300} dur={200} />
            <Arrow pts={[[336, slotY(b.pick)], [367, slotY(b.pick)]]} tone="gold" d={1600 + b.pick * 300} dur={200} />
            <Chip x={369} y={slotY(b.pick)} w={164} text={b.label} tone={i === BACKLOG.length - 1 ? "gold" : "slate"} d={1700 + b.pick * 300} />
          </g>
        ),
      )}
      <Text x={451} y={228} text={bi("as much as fits in one sprint", "بقدر ما يتسع له سبرنت واحد")} tone="muted" size={11} d={2700} />
    </Svg>
  );
}

// ---------- Develop: the Scrum board ----------
const T0 = 500;
const DAY = 420;
const dayAt = (k: number) => T0 + (k - 1) * DAY;
const COL = [14, 194, 374];
const ROW = [106, 158, 210];
const slot = (c: number, r: number): Pt => [COL[c] + 11, ROW[r]];
const NOTES = [
  { label: bi("Drug list table", "جدول الأدوية"), stops: [slot(0, 0), slot(1, 0), slot(2, 0)], at: [dayAt(2), dayAt(4)] },
  { label: bi("Prescribe form", "نموذج الوصف"), stops: [slot(0, 1), slot(1, 1), slot(2, 1)], at: [dayAt(3), dayAt(7)] },
  { label: bi("Dose-range check", "فحص نطاق الجرعة"), stops: [slot(0, 2), slot(1, 0)], at: [dayAt(5)] },
];
const TODAY = 7;

function Develop() {
  const columns = [bi("To do", "للتنفيذ"), bi("Doing", "قيد التنفيذ"), bi("Done", "مُنجز")];
  return (
    <Svg>
      <Text x={14} y={22} text={bi("Daily scrums", "اجتماعات Scrum اليومية")} anchor="start" tone="heading" size={11.5} d={0} />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <Box x={169 + i * 40} y={15} w={14} h={14} r={7} tone="muted" d={i * 30} />
          <Text x={176 + i * 40} y={40} text={`${i + 1}`} mono size={9.5} tone="muted" d={i * 30} />
          {i < TODAY ? <Box x={169 + i * 40} y={15} w={14} h={14} r={7} tone="gold" d={dayAt(i + 1)} /> : null}
        </g>
      ))}
      {columns.map((c, i) => (
        <g key={i}>
          <Box x={COL[i]} y={56} w={172} h={208} r={10} tone="ghost" dashed d={100 + i * 80} />
          <Text x={COL[i] + 86} y={74} text={c} tone="heading" size={12} d={100 + i * 80} />
        </g>
      ))}
      {NOTES.map((n, i) => (
        <Glide key={i} stops={n.stops} at={n.at} move={450}>
          <Box x={n.stops[0][0]} y={n.stops[0][1]} w={150} h={44} r={4} label={n.label} tone="warn" size={11.5} d={300 + i * 100} />
        </Glide>
      ))}
    </Svg>
  );
}

// ---------- Review ----------
function Review() {
  return (
    <Svg>
      <Box x={14} y={48} w={110} h={44} label={bi("Sprint 1", "السبرنت 1")} tone="slate" size={12} d={0} />
      <Arrow pts={[[124, 70], [168, 70]]} tone="gold" d={200} dur={250} />
      <Box x={170} y={48} w={130} h={44} label={bi("Increment", "الزيادة")} tone="gold" size={12} d={300} />
      <Arrow pts={[[300, 70], [346, 70]]} tone="gold" d={600} dur={300} label={bi("shown", "تُعرض")} labelAt={[323, 92]} labelTone="gold" />
      <Token pts={[[124, 70], [346, 70]]} d={500} dur={900} />
      {[372, 422, 472].map((x, i) => (
        <Person key={i} x={x} y={46} tone="slate" d={900 + i * 80} />
      ))}
      <Text x={422} y={104} text={bi("Stakeholders", "أصحاب المصلحة")} tone="heading" size={11.5} d={1000} />
      <Arrow pts={[[422, 128], [422, 166]]} tone="gold" d={1400} dur={300} label={bi("feedback", "ملاحظات")} labelAt={[470, 142]} labelTone="gold" />
      <Token pts={[[422, 128], [422, 166]]} d={1500} dur={500} />
      <Box x={330} y={168} w={210} h={44} label={bi("Product backlog", "قائمة أعمال المنتج")} tone="outline" size={12} d={1600} />
      <Arrow pts={[[330, 190], [126, 190]]} tone="navy" d={2100} label={bi("next sprint begins", "يبدأ السبرنت التالي")} labelAt={[228, 210]} labelTone="heading" />
      <Token pts={[[330, 190], [126, 190]]} d={2300} dur={900} tone="navy" />
      <Box x={14} y={168} w={110} h={44} label={bi("Sprint 2", "السبرنت 2")} tone="navy" size={12} d={2700} />
      <Arrow pts={[[69, 94], [69, 166]]} tone="faint" dashed d={2700} />
      <Text x={280} y={252} text={bi("the cycle repeats until the project closes", "تتكرر الدورة حتى يُغلق المشروع")} tone="muted" size={11.5} d={3000} />
    </Svg>
  );
}

// ---------- The Scrum master ----------
const SOURCES = [bi("Management", "الإدارة"), bi("Customers", "العملاء"), bi("Other teams", "الفرق الأخرى")];
const sy = (i: number) => 36 + i * 82;
const DEVS: Pt[] = [
  [385, 84],
  [490, 84],
  [438, 160],
];

function Master({ control }: { control: string }) {
  const shielded = control === "master";
  return (
    <Svg>
      {SOURCES.map((s, i) => (
        <Box key={i} x={14} y={sy(i)} w={124} h={44} label={s} tone="outline" size={12} d={i * 120} />
      ))}
      <Box x={330} y={24} w={216} h={232} r={14} tone="ghost" dashed d={100} />
      <Text x={438} y={42} text={bi("Development team", "فريق التطوير")} tone="muted" size={11.5} d={100} />
      {DEVS.map(([x, y], i) => (
        <Person key={i} x={x} y={y} tone="slate" d={200 + i * 80} />
      ))}
      {shielded ? (
        <>
          <Person x={250} y={112} tone="gold" d={300} />
          <Text x={250} y={168} text="Scrum master" tone="heading" size={11.5} d={300} />
          <Arrow pts={[[312, 44], [312, 236]]} tone="gold" head={false} width={4} d={500} />
          {SOURCES.map((_, i) => {
            const to: Pt = [232, 116 + i * 12];
            return (
              <g key={i}>
                <Arrow pts={[[138, sy(i) + 22], to]} tone="gold" d={800 + i * 200} />
                <Token pts={[[138, sy(i) + 22], to]} d={900 + i * 200} dur={600} />
              </g>
            );
          })}
          <Arrow pts={[[268, 128], [352, 128]]} tone="gold" dashed d={1700} />
          {DEVS.map(([x, y], i) => (
            <Mark key={i} x={x + 20} y={y} ok d={2000 + i * 120} />
          ))}
          <Text x={438} y={232} text={bi("the team stays focused", "يبقى الفريق مركّزًا")} tone="success" size={11.5} d={2400} />
        </>
      ) : (
        <>
          {SOURCES.map((_, i) => {
            const [x, y] = DEVS[[0, 2, 1][i]];
            const to: Pt = [x - 18, y + 20];
            return (
              <g key={i}>
                <Arrow pts={[[138, sy(i) + 22], to]} tone="danger" d={700 + i * 300} />
                <Token pts={[[138, sy(i) + 22], to]} d={800 + i * 300} dur={700} tone="danger" />
              </g>
            );
          })}
          {DEVS.map(([x, y], i) => (
            <Mark key={i} x={x + 20} y={y} ok={false} d={1700 + i * 120} />
          ))}
          <Text x={438} y={232} text={bi("work keeps stopping", "العمل يتوقف باستمرار")} tone="danger" size={11.5} d={2100} />
        </>
      )}
    </Svg>
  );
}

export const Scene = sceneSet<PanelIdOf<typeof scrum>>({
  phases: Phases,
  select: Select,
  develop: Develop,
  review: Review,
  master: Master,
});
